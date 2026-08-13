export interface ParsedInvoiceData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  projectName: string;
  currency: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
  }>;
  taxRate: number;
  discount: number;
  dueDays: number;
  notes?: string;
}

export function parsePromptToInvoice(prompt: string): ParsedInvoiceData {
  const text = prompt.trim();
  const lower = text.toLowerCase();

  // Default values
  let clientName = "";
  let projectName = "";
  let currency = "USD";
  let taxRate = 0;
  let discount = 0;
  let dueDays = 14;
  const items: Array<{ description: string; quantity: number; unit_price: number }> = [];

  // Currency detection
  if (text.includes("₦") || lower.includes("naira") || lower.includes("ngn")) {
    currency = "NGN";
  } else if (text.includes("€") || lower.includes("eur") || lower.includes("euro")) {
    currency = "EUR";
  } else if (text.includes("£") || lower.includes("gbp") || lower.includes("pound")) {
    currency = "GBP";
  } else if (text.includes("$") || lower.includes("usd") || lower.includes("dollar")) {
    currency = "USD";
  }

  // Detect client name: e.g. "for Acme Studio", "to Acme Inc", "client Acme"
  const clientMatch = text.match(/(?:for|to|client)\s+([A-Z0-9][A-Za-z0-9\s&'-]+?)(?=\s+(?:for|for\s+₦|for\s+\$|due|amount|worth|in|\$|₦|€|£|\d|$))/i);
  if (clientMatch && clientMatch[1]) {
    clientName = clientMatch[1].trim();
  }

  // Detect project / deliverables: e.g. "website design and development", "logo design", "mobile app consulting"
  const projectMatch = text.match(/(?:for|deliverable|project|service|services|task)\s+([a-zA-Z0-9\s&'-]+?)(?=\s+(?:due|in\s+\d+|worth|\$|₦|€|£|amount|client|\.|$))/i);
  if (projectMatch && projectMatch[1] && projectMatch[1].toLowerCase() !== clientName.toLowerCase()) {
    projectName = projectMatch[1].trim();
    // Capitalize first letter
    projectName = projectName.charAt(0).toUpperCase() + projectName.slice(1);
  }

  // Detect money amount: e.g. "₦420,000", "$1,500", "420000", "1500"
  const amountMatch = text.match(/(?:₦|\$|€|£|NGN|USD|EUR|GBP)?\s*([\d,]+(?:\.\d{2})?)/);
  let totalAmount = 0;
  if (amountMatch && amountMatch[1]) {
    const cleanNum = amountMatch[1].replace(/,/g, "");
    const parsedNum = parseFloat(cleanNum);
    if (!isNaN(parsedNum) && parsedNum > 0) {
      totalAmount = parsedNum;
    }
  }

  // Fallback check for numbers if first match failed
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

  // Detect due days: e.g. "due in 14 days", "14-day due date", "due in 30 days"
  const daysMatch = text.match(/due\s+(?:in\s+)?(\d+)\s*day/i);
  if (daysMatch && daysMatch[1]) {
    dueDays = parseInt(daysMatch[1], 10);
  }

  // Build primary line item
  const itemDesc = projectName || "Design and development services";
  items.push({
    description: itemDesc,
    quantity: 1,
    unit_price: totalAmount || 420000,
  });

  return {
    clientName: clientName || "Acme Studio",
    clientEmail: clientName ? `${clientName.toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com` : "billing@acmestudio.com",
    clientPhone: "+234 801 234 5678",
    clientAddress: "Lagos, Nigeria",
    projectName: projectName || "Website Redesign & Development",
    currency: totalAmount > 0 ? currency : (currency === "USD" && text.includes("₦") ? "NGN" : currency),
    items,
    taxRate,
    discount,
    dueDays,
    notes: "Payment is due by the stated due date. Please reference the invoice number when making payment.",
  };
}

export function countWords(str: string): number {
  if (!str.trim()) return 0;
  return str.trim().split(/\s+/).length;
}
