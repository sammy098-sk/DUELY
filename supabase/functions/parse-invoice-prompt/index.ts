import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Item {
  description: string;
  quantity: number;
  unit_price: number;
}

interface ParsedInvoiceOutput {
  client_name: string | null;
  project_name: string | null;
  due_date: string | null;
  items: Item[];
  currency: string | null;
  notes?: string | null;
  error?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return new Response(
        JSON.stringify({ error: "Please enter a description of the invoice you want to generate." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const trimmedPrompt = prompt.trim();
    const todayISO = new Date().toISOString().slice(0, 10);

    // 1. Detect explicit currency in prompt
    const explicitCurrency = detectExplicitCurrency(trimmedPrompt);

    // 2. Call Anthropic / OpenAI or local rule parser
    let rawOutput: any = null;

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (anthropicApiKey) {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicApiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            system:
              "Return JSON only. No markdown fences. No explanations. Do not invent missing values. Use null when an optional value isn't provided.",
            messages: [
              {
                role: "user",
                content: `Current Server Date: ${todayISO}\n\nParse the following prompt into structured invoice JSON with fields:\n- client_name: string or null\n- project_name: string or null\n- due_date: string (YYYY-MM-DD) or null\n- items: array of { description: string, quantity: number, unit_price: number }\n- currency: string (e.g. NGN, USD, EUR, GBP) ONLY if currency symbol or code is explicitly mentioned in the prompt, otherwise return null\n- notes: string or null\n\nPrompt: "${trimmedPrompt}"`,
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const textContent = data.content?.[0]?.text || "";
          const cleanedText = textContent.replace(/```json/g, "").replace(/```/g, "").trim();
          rawOutput = JSON.parse(cleanedText);
        }
      } catch (err) {
        console.error("Anthropic API error, falling back to rule parser:", err);
      }
    } else if (openaiApiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content:
                  "Return JSON only. No markdown fences. No explanations. Do not invent missing values. Use null when an optional value isn't provided.",
              },
              {
                role: "user",
                content: `Current Server Date: ${todayISO}\n\nParse the following prompt into structured invoice JSON with fields:\n- client_name: string or null\n- project_name: string or null\n- due_date: string (YYYY-MM-DD) or null\n- items: array of { description: string, quantity: number, unit_price: number }\n- currency: string (e.g. NGN, USD, EUR, GBP) ONLY if currency symbol or code is explicitly mentioned in the prompt, otherwise return null\n- notes: string or null\n\nPrompt: "${trimmedPrompt}"`,
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const textContent = data.choices?.[0]?.message?.content || "";
          rawOutput = JSON.parse(textContent);
        }
      } catch (err) {
        console.error("OpenAI API error, falling back to rule parser:", err);
      }
    }

    // Fallback rule-based parsing if LLM not available or failed
    if (!rawOutput) {
      rawOutput = parseWithRules(trimmedPrompt, todayISO);
    }

    // Always enforce strict explicit currency precedence
    rawOutput.currency = explicitCurrency;

    // 3. Strict Validation
    const validationError = validateInvoiceData(rawOutput, trimmedPrompt);
    if (validationError) {
      return new Response(JSON.stringify({ error: validationError }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Format clean response
    const cleanResult: ParsedInvoiceOutput = {
      client_name: rawOutput.client_name ? String(rawOutput.client_name).trim() : null,
      project_name: rawOutput.project_name ? String(rawOutput.project_name).trim() : null,
      due_date: rawOutput.due_date ? String(rawOutput.due_date).trim() : null,
      items: (rawOutput.items || []).map((it: any) => ({
        description: String(it.description || "Service").trim(),
        quantity: Math.max(1, Number(it.quantity) || 1),
        unit_price: Math.max(0, Number(it.unit_price) || 0),
      })),
      currency: explicitCurrency,
      notes: rawOutput.notes ? String(rawOutput.notes).trim() : null,
    };

    return new Response(JSON.stringify(cleanResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    console.error("Error in parse-invoice-prompt function:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to parse invoice prompt." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});

/** Detect if prompt explicitly mentions currency symbols or codes */
function detectExplicitCurrency(text: string): string | null {
  const lower = text.toLowerCase();
  if (text.includes("₦") || lower.includes("naira") || lower.includes("ngn")) {
    return "NGN";
  }
  if (text.includes("$") || lower.includes("usd") || lower.includes("dollar")) {
    return "USD";
  }
  if (text.includes("€") || lower.includes("eur") || lower.includes("euro")) {
    return "EUR";
  }
  if (text.includes("£") || lower.includes("gbp") || lower.includes("pound")) {
    return "GBP";
  }
  if (lower.includes("cad") || lower.includes("canadian dollar")) {
    return "CAD";
  }
  if (lower.includes("aud") || lower.includes("australian dollar")) {
    return "AUD";
  }
  return null;
}

/** Validate output fields strictly */
function validateInvoiceData(data: any, originalPrompt: string): string | null {
  // Check client_name
  if (!data || !data.client_name || typeof data.client_name !== "string" || !data.client_name.trim()) {
    return "Missing client — please specify who the invoice is for.";
  }

  // Check items & amounts
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    return "Missing amount — please specify how much to invoice for.";
  }

  let totalAmount = 0;
  for (const item of data.items) {
    if (!item.description || typeof item.description !== "string" || !item.description.trim()) {
      return "Invalid item description in generated output.";
    }
    const qty = Number(item.quantity);
    const price = Number(item.unit_price);
    if (isNaN(qty) || qty <= 0 || isNaN(price) || price < 0) {
      return "Missing amount — please specify how much to invoice for.";
    }
    totalAmount += qty * price;
  }

  if (totalAmount <= 0) {
    return "Missing amount — please specify how much to invoice for.";
  }

  return null;
}

/** Fallback rule-based parser */
function parseWithRules(text: string, todayISO: string): any {
  const lower = text.toLowerCase();

  // Detect Client
  let client_name: string | null = null;
  const clientMatch = text.match(/(?:for|to|client)\s+([A-Z0-9][A-Za-z0-9\s&'-]+?)(?=\s+(?:for|for\s+₦|for\s+\$|due|amount|worth|in|\$|₦|€|£|\d|$))/i);
  if (clientMatch && clientMatch[1]) {
    client_name = clientMatch[1].trim();
  }

  // Detect Project / Deliverable
  let project_name: string | null = null;
  const projectMatch = text.match(/(?:for|deliverable|project|service|services|task)\s+([a-zA-Z0-9\s&'-]+?)(?=\s+(?:due|in\s+\d+|worth|\$|₦|€|£|amount|client|\.|$))/i);
  if (projectMatch && projectMatch[1] && projectMatch[1].toLowerCase() !== (client_name || "").toLowerCase()) {
    project_name = projectMatch[1].trim();
    project_name = project_name.charAt(0).toUpperCase() + project_name.slice(1);
  }

  // Detect Amount
  const amountMatch = text.match(/(?:₦|\$|€|£|NGN|USD|EUR|GBP)?\s*([\d,]+(?:\.\d{2})?)/);
  let totalAmount = 0;
  if (amountMatch && amountMatch[1]) {
    const cleanNum = amountMatch[1].replace(/,/g, "");
    const parsedNum = parseFloat(cleanNum);
    if (!isNaN(parsedNum) && parsedNum > 0) {
      totalAmount = parsedNum;
    }
  }

  if (totalAmount === 0) {
    const numMatches = text.match(/\b\d[\d,]*\b/g);
    if (numMatches) {
      for (const raw of numMatches) {
        const val = parseFloat(raw.replace(/,/g, ""));
        if (!isNaN(val) && val > 10) {
          totalAmount = val;
          break;
        }
      }
    }
  }

  // Detect Due Date
  let due_date: string | null = null;
  const daysMatch = text.match(/due\s+(?:in\s+)?(\d+)\s*day/i);
  if (daysMatch && daysMatch[1]) {
    const days = parseInt(daysMatch[1], 10);
    const d = new Date(Date.now() + days * 86_400_000);
    due_date = d.toISOString().slice(0, 10);
  }

  const items: Item[] = [];
  if (totalAmount > 0) {
    items.push({
      description: project_name || "Services rendered",
      quantity: 1,
      unit_price: totalAmount,
    });
  }

  return {
    client_name,
    project_name,
    due_date,
    items,
    currency: detectExplicitCurrency(text),
    notes: "Please reference the invoice number when making payment.",
  };
}
