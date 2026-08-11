import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { daysOverdue, formatMoney, toneForInvoice } from "./invoice";

export interface ReminderContext {
  invoiceNumber: string;
  clientName: string;
  businessName: string;
  amount: number;
  currency: string;
  dueDate: string;
  bankDetails: string;
}

const TONE_BRIEF = {
  friendly: "Warm, light, assumes it simply slipped their mind. No pressure.",
  firm: "Polite but direct. State the invoice is overdue and ask for a payment date.",
  final:
    "Final notice. Serious, professional, unemotional. State this is the last reminder before escalation, and ask for immediate settlement.",
} as const;

export async function draftReminder(ctx: ReminderContext) {
  const tone = toneForInvoice(ctx.dueDate);
  const overdue = daysOverdue(ctx.dueDate);
  const amount = formatMoney(ctx.amount, ctx.currency);

  const fallbackSubject =
    tone === "final"
      ? `Final notice: invoice ${ctx.invoiceNumber} (${amount})`
      : tone === "firm"
        ? `Overdue: invoice ${ctx.invoiceNumber} (${amount})`
        : `Quick nudge on invoice ${ctx.invoiceNumber}`;

  const key = process.env["LOVABLE_API_KEY"];
  if (!key) {
    return {
      tone,
      subject: fallbackSubject,
      body: `Hi ${ctx.clientName},\n\nInvoice ${ctx.invoiceNumber} for ${amount} was due on ${ctx.dueDate}${
        overdue > 0 ? ` — that's ${overdue} day(s) ago` : ""
      }. Could you let me know when payment will be made?\n\nThank you,\n${ctx.businessName}`,
    };
  }

  const gateway = createLovableAiGatewayProvider(key);
  const { text } = await generateText({
    model: gateway("google/gemini-3.6-flash"),
    system:
      "You write short payment reminder messages on behalf of freelancers. Output plain text only, 60-110 words, no markdown, no placeholders in brackets. First line must be 'SUBJECT: ...' followed by a blank line and then the message body.",
    prompt: `Write a ${tone} payment reminder.
Tone brief: ${TONE_BRIEF[tone]}
From: ${ctx.businessName}
To: ${ctx.clientName}
Invoice: ${ctx.invoiceNumber}
Amount: ${amount}
Due date: ${ctx.dueDate}${overdue > 0 ? ` (${overdue} days overdue)` : " (not yet overdue)"}
Payment details to include at the end if present: ${ctx.bankDetails || "none"}`,
  });

  const match = /^SUBJECT:\s*(.+)\n+([\s\S]+)$/i.exec(text.trim());
  return {
    tone,
    subject: match?.[1]?.trim() ?? fallbackSubject,
    body: (match?.[2] ?? text).trim(),
  };
}

const GATEWAY = "https://connector-gateway.lovable.dev";

/** Sends via Resend if the connector is linked. Returns null when unavailable. */
export async function sendEmailReminder(opts: {
  to: string;
  from: string;
  subject: string;
  body: string;
}) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const resendKey = process.env["RESEND_API_KEY"];
  if (!lovableKey || !resendKey) return { ok: false, reason: "resend_not_connected" };

  const res = await fetch(`${GATEWAY}/resend/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": resendKey,
    },
    body: JSON.stringify({
      from: opts.from,
      to: [opts.to],
      subject: opts.subject,
      text: opts.body,
    }),
  });
  if (!res.ok) {
    return { ok: false, reason: `resend_error_${res.status}: ${await res.text()}` };
  }
  return { ok: true, reason: "" };
}

/** Sends a WhatsApp message via Twilio if the connector is linked. */
export async function sendWhatsappReminder(opts: {
  to: string;
  from: string;
  body: string;
}) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const twilioKey = process.env["TWILIO_API_KEY"];
  if (!lovableKey || !twilioKey) return { ok: false, reason: "twilio_not_connected" };

  const res = await fetch(`${GATEWAY}/twilio/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": twilioKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: `whatsapp:${opts.to}`,
      From: `whatsapp:${opts.from}`,
      Body: opts.body,
    }),
  });
  if (!res.ok) {
    return { ok: false, reason: `twilio_error_${res.status}: ${await res.text()}` };
  }
  return { ok: true, reason: "" };
}
