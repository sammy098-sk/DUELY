import { draftReminder, sendEmailReminder, sendWhatsappReminder } from "./reminders.server";

interface InvoiceRow {
  id: string;
  user_id: string;
  number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  due_date: string;
  currency: string;
  total: number | string;
  reminder_count: number;
}

interface ProfileRow {
  business_name: string | null;
  contact_email: string | null;
  phone: string | null;
  bank_details: string | null;
}

export interface ReminderResult {
  drafted: boolean;
  tone: string;
  subject: string;
  body: string;
  channels: { channel: string; status: string; error: string | null }[];
}

/**
 * Drafts the escalating reminder for one invoice, attempts delivery on each
 * configured channel and writes a row to the reminder history log per channel.
 */
export async function runReminderForInvoice(
  invoice: InvoiceRow,
  profile: ProfileRow | null,
): Promise<ReminderResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const businessName = profile?.business_name?.trim() || "Your freelancer";
  const draft = await draftReminder({
    invoiceNumber: invoice.number,
    clientName: invoice.client_name || "there",
    businessName,
    amount: Number(invoice.total),
    currency: invoice.currency,
    dueDate: invoice.due_date,
    bankDetails: profile?.bank_details ?? "",
  });

  const channels: ReminderResult["channels"] = [];

  if (invoice.client_email) {
    const from = `${businessName} <onboarding@resend.dev>`;
    const res = await sendEmailReminder({
      to: invoice.client_email,
      from,
      subject: draft.subject,
      body: draft.body,
    });
    channels.push({
      channel: "email",
      status: res.ok ? "sent" : "failed",
      error: res.ok ? null : res.reason,
    });
  }

  if (invoice.client_phone) {
    const res = await sendWhatsappReminder({
      to: invoice.client_phone,
      from: profile?.phone || "",
      body: draft.body,
    });
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

  await supabaseAdmin.from("reminders").insert(
    channels.map((c) => ({
      invoice_id: invoice.id,
      user_id: invoice.user_id,
      channel: c.channel,
      tone: draft.tone,
      subject: draft.subject,
      body: draft.body,
      status: c.status,
      error: c.error,
    })),
  );

  await supabaseAdmin
    .from("invoices")
    .update({
      last_reminder_at: new Date().toISOString(),
      reminder_count: (invoice.reminder_count ?? 0) + 1,
    })
    .eq("id", invoice.id);

  return { drafted: true, tone: draft.tone, subject: draft.subject, body: draft.body, channels };
}
