export type InvoiceStatus = "draft" | "awaiting" | "paid" | "overdue";

export interface LineItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export interface InvoiceRecord {
  id: string;
  user_id: string;
  number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  issue_date: string;
  due_date: string | null;
  currency: string;
  tax_rate: number;
  discount: number;
  notes: string;
  status: string;
  subtotal: number;
  total: number;
  paid_at: string | null;
  last_reminder_at: string | null;
  reminder_count: number;
  created_at: string;
  payment_method?: string;
  project_name?: string;
}

export function computeTotals(items: LineItem[], taxRate: number, discount: number) {
  const subtotal = items.reduce(
    (sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0),
    0,
  );
  const afterDiscount = Math.max(subtotal - (Number(discount) || 0), 0);
  const tax = afterDiscount * ((Number(taxRate) || 0) / 100);
  return {
    subtotal: round2(subtotal),
    tax: round2(tax),
    total: round2(afterDiscount + tax),
  };
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "CA$",
  AUD: "A$",
  INR: "₹",
};

export function getCurrencySymbol(currency = "USD"): string {
  const code = (currency || "USD").toUpperCase();
  return CURRENCY_SYMBOLS[code] || `${code} `;
}

export function formatMoney(amount: number, currency = "USD"): string {
  const num = Number(amount) || 0;
  const symbol = getCurrencySymbol(currency);
  const formatted = num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

export function formatDateFormatted(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(`${dateStr}T00:00:00Z`);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function daysOverdue(dueDate: string | null) {
  if (!dueDate) return 0;
  const due = new Date(`${dueDate}T00:00:00Z`).getTime();
  const now = Date.now();
  return Math.floor((now - due) / 86_400_000);
}

/** Effective status: No due date = Paid. Due date exists = Awaiting or Overdue. */
export function effectiveStatus(inv: {
  status: string;
  due_date: string | null;
}): InvoiceStatus {
  if (!inv.due_date || inv.status === "paid") return "paid";
  if (inv.status === "draft") return "draft";
  return daysOverdue(inv.due_date) > 0 ? "overdue" : "awaiting";
}

export function toneForInvoice(dueDate: string | null): "friendly" | "firm" | "final" {
  if (!dueDate) return "friendly";
  const d = daysOverdue(dueDate);
  if (d <= 7) return "friendly";
  if (d <= 21) return "firm";
  return "final";
}

export function nextInvoiceNumber(existing: string[]): string {
  const nums = existing
    .map((n) => /(\d+)\s*$/.exec(n)?.[1])
    .filter(Boolean)
    .map((n) => parseInt(n as string, 10));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `#${String(next).padStart(4, "0")}`;
}
