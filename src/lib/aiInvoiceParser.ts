export interface ParsedInvoiceData {
  clientName: string | null;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  projectName: string | null;
  currency: string | null;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
  }>;
  taxRate?: number;
  discount?: number;
  dueDays?: number;
  dueDate?: string | null;
  notes?: string;
  error?: string;
}

export function detectExplicitCurrency(text: string): string | null {
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

export function parsePromptToInvoice(prompt: string): ParsedInvoiceData {
  const text = prompt.trim();
  if (!text) {
    return {
      clientName: null,
      projectName: null,
      currency: null,
      items: [],
      error: "Please enter a description of the invoice you want to generate.",
    };
  }

  // Currency detection (returns null if not explicitly mentioned)
  const currency = detectExplicitCurrency(text);

  // Detect client name
  let clientName: string | null = null;
  const clientMatch = text.match(/(?:for|to|client)\s+([A-Z0-9][A-Za-z0-9\s&'-]+?)(?=\s+(?:for|for\s+₦|for\s+\$|due|amount|worth|in|\$|₦|€|£|\d|$))/i);
  if (clientMatch && clientMatch[1]) {
    clientName = clientMatch[1].trim();
  }

  if (!clientName) {
    return {
      clientName: null,
      projectName: null,
      currency,
      items: [],
      error: "Missing client — please specify who the invoice is for.",
    };
  }

  // Detect project / deliverables
  let projectName: string | null = null;
  const projectMatch = text.match(/(?:for|deliverable|project|service|services|task)\s+([a-zA-Z0-9\s&'-]+?)(?=\s+(?:due|in\s+\d+|worth|\$|₦|€|£|amount|client|\.|$))/i);
  if (projectMatch && projectMatch[1] && projectMatch[1].toLowerCase() !== clientName.toLowerCase()) {
    projectName = projectMatch[1].trim();
    projectName = projectName.charAt(0).toUpperCase() + projectName.slice(1);
  }

  // Detect money amount
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

  if (totalAmount <= 0) {
    return {
      clientName,
      projectName,
      currency,
      items: [],
      error: "Missing amount — please specify how much to invoice for.",
    };
  }

  // Detect due days
  let dueDays = 14;
  const daysMatch = text.match(/due\s+(?:in\s+)?(\d+)\s*day/i);
  if (daysMatch && daysMatch[1]) {
    dueDays = parseInt(daysMatch[1], 10);
  }

  const items = [
    {
      description: projectName || "Services rendered",
      quantity: 1,
      unit_price: totalAmount,
    },
  ];

  return {
    clientName,
    projectName: projectName || `${clientName} Project`,
    currency,
    items,
    dueDays,
    notes: "Payment is due by the stated due date. Please reference the invoice number when making payment.",
  };
}

export function countWords(str: string): number {
  if (!str.trim()) return 0;
  return str.trim().split(/\s+/).length;
}
