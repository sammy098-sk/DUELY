import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Set up CORS headers for preflight requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookPayload {
  invoiceId?: string; // Optional: specific invoice to run for
}

const TONE_BRIEF = {
  friendly: "Warm, light, assumes it simply slipped their mind. No pressure.",
  firm: "Polite but direct. State the invoice is overdue and ask for a payment date.",
  final: "Final notice. Serious, professional, unemotional. State this is the last reminder before escalation, and ask for immediate settlement.",
};

function daysOverdue(dueDate: string) {
  const diff = Date.now() - new Date(dueDate).getTime();
  return Math.floor(diff / 86_400_000);
}

function toneForInvoice(dueDate: string) {
  const overdue = daysOverdue(dueDate);
  if (overdue < 0) return "friendly";
  if (overdue < 7) return "firm";
  return "final";
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

// Simple fallback templating instead of AI if no API key is provided
function generateFallbackReminder(ctx: any, tone: string, overdue: number, amount: string) {
  const fallbackSubject =
    tone === "final"
      ? `Final notice: invoice ${ctx.invoiceNumber} (${amount})`
      : tone === "firm"
        ? `Overdue: invoice ${ctx.invoiceNumber} (${amount})`
        : `Quick nudge on invoice ${ctx.invoiceNumber}`;

  return {
    tone,
    subject: fallbackSubject,
    body: `Hi ${ctx.clientName},\n\nInvoice ${ctx.invoiceNumber} for ${amount} was due on ${ctx.dueDate}${
      overdue > 0 ? ` — that's ${overdue} day(s) ago` : ""
    }. Could you let me know when payment will be made?\n\nThank you,\n${ctx.businessName}`,
  };
}

async function draftReminder(ctx: any) {
  const tone = toneForInvoice(ctx.dueDate);
  const overdue = daysOverdue(ctx.dueDate);
  const amount = formatMoney(ctx.amount, ctx.currency);

  const apiKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("OPENAI_API_KEY");
  
  if (!apiKey) {
    return generateFallbackReminder(ctx, tone, overdue, amount);
  }

  // NOTE: You can implement direct fetch calls to Gemini or OpenAI here.
  // For now, we use the fallback logic to ensure migration doesn't break due to missing AI integration.
  return generateFallbackReminder(ctx, tone, overdue, amount);
}

async function sendEmailReminder(to: string, from: string, subject: string, body: string) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) return { ok: false, reason: "RESEND_API_KEY not configured" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text: body,
    }),
  });

  if (!res.ok) {
    return { ok: false, reason: `Resend error: ${await res.text()}` };
  }
  return { ok: true, reason: "" };
}

async function sendWhatsappReminder(to: string, from: string, body: string) {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  if (!accountSid || !authToken) return { ok: false, reason: "Twilio credentials not configured" };

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: `whatsapp:${to}`,
      From: `whatsapp:${from}`,
      Body: body,
    }),
  });

  if (!res.ok) {
    return { ok: false, reason: `Twilio error: ${await res.text()}` };
  }
  return { ok: true, reason: "" };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let invoiceIdToRun: string | null = null;
    if (req.method === "POST" && req.headers.get("content-type")?.includes("application/json")) {
      const payload: WebhookPayload = await req.json();
      invoiceIdToRun = payload.invoiceId || null;
    }

    const cutoff = new Date(Date.now() - 3 * 86_400_000).toISOString();
    const today = new Date().toISOString().slice(0, 10);

    let query = supabaseClient
      .from("invoices")
      .select("*")
      .in("status", ["awaiting", "overdue"]);

    if (invoiceIdToRun) {
      query = query.eq("id", invoiceIdToRun);
    } else {
      query = query
        .lte("due_date", today)
        .or(`last_reminder_at.is.null,last_reminder_at.lte.${cutoff}`)
        .limit(100);
    }

    const { data: invoices, error } = await query;
    if (error) throw error;

    let processed = 0;
    const results = [];

    for (const invoice of invoices ?? []) {
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", invoice.user_id)
        .maybeSingle();

      if (profile && profile.reminders_enabled === false) continue;

      const draft = await draftReminder({
        invoiceNumber: invoice.number,
        clientName: invoice.client_name || "there",
        businessName: profile?.business_name?.trim() || "Your freelancer",
        amount: Number(invoice.total),
        currency: invoice.currency,
        dueDate: invoice.due_date,
        bankDetails: profile?.bank_details ?? "",
      });

      const channels: any[] = [];
      const businessName = profile?.business_name?.trim() || "Your freelancer";

      if (invoice.client_email) {
        const from = `${businessName} <onboarding@resend.dev>`;
        const res = await sendEmailReminder(invoice.client_email, from, draft.subject, draft.body);
        channels.push({
          channel: "email",
          status: res.ok ? "sent" : "failed",
          error: res.ok ? null : res.reason,
        });
      }

      if (invoice.client_phone) {
        const res = await sendWhatsappReminder(invoice.client_phone, profile?.phone || "", draft.body);
        channels.push({
          channel: "whatsapp",
          status: res.ok ? "sent" : "failed",
          error: res.ok ? null : res.reason,
        });
      }

      if (channels.length === 0) {
        channels.push({
          channel: "email",
          status: "failed",
          error: "No client email or phone number on this invoice.",
        });
      }

      await supabaseClient.from("reminders").insert(
        channels.map((c) => ({
          invoice_id: invoice.id,
          user_id: invoice.user_id,
          channel: c.channel,
          tone: draft.tone,
          subject: draft.subject,
          body: draft.body,
          status: c.status,
          error: c.error,
        }))
      );

      await supabaseClient
        .from("invoices")
        .update({
          last_reminder_at: new Date().toISOString(),
          reminder_count: (invoice.reminder_count ?? 0) + 1,
        })
        .eq("id", invoice.id);

      processed++;
      
      if (invoiceIdToRun) {
        results.push({ drafted: true, tone: draft.tone, subject: draft.subject, body: draft.body, channels });
      }
    }

    if (invoiceIdToRun && results.length > 0) {
      return new Response(JSON.stringify(results[0]), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true, processed, considered: invoices?.length ?? 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
