import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { BellRing, CheckCircle2, Printer } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StampBadge } from "@/components/StampBadge";
import { supabase } from "@/integrations/supabase/client";
import { sendReminderNow } from "@/lib/reminders.functions";
import {
  computeTotals,
  effectiveStatus,
  formatMoney,
  type InvoiceRecord,
  type LineItem,
} from "@/lib/invoice";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/invoices/$id")({
  head: () => ({
    meta: [
      { title: "Invoice — Duely" },
      {
        name: "description",
        content:
          "View an invoice, download it as a PDF and see every payment reminder Duely has sent.",
      },
      { property: "og:title", content: "Invoice — Duely" },
      {
        property: "og:description",
        content: "Invoice detail with reminder history and PDF download.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <InvoiceDetail />
    </AppShell>
  ),
});

function InvoiceDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const send = useServerFn(sendReminderNow);
  const [sending, setSending] = useState(false);

  const { data } = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const [inv, items, reminders, profile] = await Promise.all([
        supabase.from("invoices").select("*").eq("id", id).single(),
        supabase.from("invoice_items").select("*").eq("invoice_id", id).order("position"),
        supabase
          .from("reminders")
          .select("*")
          .eq("invoice_id", id)
          .order("sent_at", { ascending: false }),
        supabase.from("profiles").select("*").maybeSingle(),
      ]);
      if (inv.error) throw inv.error;
      return {
        invoice: inv.data as unknown as InvoiceRecord,
        items: (items.data ?? []) as unknown as LineItem[],
        reminders: (reminders.data ?? []) as unknown as ReminderRow[],
        profile: profile.data,
      };
    },
  });

  if (!data) return <p className="label-caps">Loading invoice…</p>;
  const { invoice, items, reminders, profile } = data;
  const status = effectiveStatus(invoice);
  const totals = computeTotals(items, Number(invoice.tax_rate), Number(invoice.discount));

  async function markPaid() {
    const { error } = await supabase
      .from("invoices")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Marked as paid. Chasing stopped.");
    qc.invalidateQueries({ queryKey: ["invoice", id] });
    qc.invalidateQueries({ queryKey: ["invoices"] });
  }

  async function chase() {
    setSending(true);
    try {
      const res = await send({ data: { invoiceId: id } });
      const failed = res.channels.filter((c) => c.status === "failed");
      if (failed.length === res.channels.length) {
        toast.error(`Draft written but not delivered: ${failed[0]?.error ?? "no channel"}`);
      } else {
        toast.success(`${res.tone} reminder sent.`);
      }
      qc.invalidateQueries({ queryKey: ["invoice", id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reminder failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="no-print flex flex-wrap items-center gap-3">
        <Button onClick={chase} disabled={sending || status === "paid" || status === "draft"}>
          <BellRing className="size-4" /> {sending ? "Drafting…" : "Send reminder now"}
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="size-4" /> Download PDF
        </Button>
        {status !== "paid" && (
          <Button variant="outline" onClick={markPaid}>
            <CheckCircle2 className="size-4" /> Mark paid
          </Button>
        )}
      </div>

      <article className="ledger-panel print-sheet p-8 sm:p-10">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl">{profile?.business_name || "Invoice"}</h1>
            <p className="mt-1 text-sm whitespace-pre-line text-muted-foreground">
              {profile?.address}
              {profile?.contact_email ? `\n${profile.contact_email}` : ""}
              {profile?.phone ? `\n${profile.phone}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="money text-sm">{invoice.number}</p>
            <p className="label-caps mt-1">issued {invoice.issue_date}</p>
            <p className="label-caps">due {invoice.due_date}</p>
            <div className="mt-3">
              <StampBadge status={status} size="md" />
            </div>
          </div>
        </header>

        <section className="grid gap-6 py-6 sm:grid-cols-2">
          <div>
            <p className="label-caps">Billed to</p>
            <p className="mt-1 font-serif text-xl">{invoice.client_name}</p>
            <p className="text-sm whitespace-pre-line text-muted-foreground">
              {invoice.client_address}
              {invoice.client_email ? `\n${invoice.client_email}` : ""}
              {invoice.client_phone ? `\n${invoice.client_phone}` : ""}
            </p>
          </div>
          {profile?.bank_details && (
            <div>
              <p className="label-caps">Payment details</p>
              <p className="mt-1 text-sm whitespace-pre-line">{profile.bank_details}</p>
            </div>
          )}
        </section>

        <table className="w-full border-t border-border text-sm">
          <thead>
            <tr className="label-caps text-left">
              <th className="py-3 font-normal">Description</th>
              <th className="py-3 text-right font-normal">Qty</th>
              <th className="py-3 text-right font-normal">Rate</th>
              <th className="py-3 text-right font-normal">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item, i) => (
              <tr key={i}>
                <td className="py-3">{item.description}</td>
                <td className="money py-3 text-right">{Number(item.quantity)}</td>
                <td className="money py-3 text-right">
                  {formatMoney(Number(item.unit_price), invoice.currency)}
                </td>
                <td className="money py-3 text-right">
                  {formatMoney(
                    Number(item.quantity) * Number(item.unit_price),
                    invoice.currency,
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 ml-auto max-w-xs space-y-2 text-sm">
          <SummaryRow label="Subtotal" value={formatMoney(totals.subtotal, invoice.currency)} />
          <SummaryRow
            label="Discount"
            value={`− ${formatMoney(Number(invoice.discount), invoice.currency)}`}
          />
          <SummaryRow
            label={`Tax (${Number(invoice.tax_rate)}%)`}
            value={formatMoney(totals.tax, invoice.currency)}
          />
          <div className="flex items-baseline justify-between border-t border-border pt-3">
            <span className="font-serif text-lg">Total due</span>
            <span className="money text-2xl">
              {formatMoney(totals.total, invoice.currency)}
            </span>
          </div>
        </div>

        {invoice.notes && (
          <p className="mt-8 border-t border-border pt-4 text-sm whitespace-pre-line text-muted-foreground">
            {invoice.notes}
          </p>
        )}
      </article>

      <section className="no-print ledger-panel overflow-hidden">
        <div className="border-b border-border px-5 py-3">
          <p className="label-caps">Reminder history</p>
        </div>
        {reminders.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            Nothing sent yet. Duely checks unpaid invoices every 3 days.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {reminders.map((r) => (
              <li key={r.id} className="space-y-2 px-5 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="label-caps">{new Date(r.sent_at).toLocaleString()}</span>
                  <span className="rounded-sm border border-border px-2 py-0.5 font-mono text-[0.65rem] tracking-widest uppercase">
                    {r.channel}
                  </span>
                  <span className="rounded-sm border border-border px-2 py-0.5 font-mono text-[0.65rem] tracking-widest uppercase">
                    {r.tone}
                  </span>
                  <span
                    className={
                      r.status === "sent"
                        ? "font-mono text-[0.65rem] tracking-widest text-stamp-paid uppercase"
                        : "font-mono text-[0.65rem] tracking-widest text-stamp-overdue uppercase"
                    }
                  >
                    {r.status}
                  </span>
                </div>
                <p className="font-medium">{r.subject}</p>
                <p className="text-sm whitespace-pre-line text-muted-foreground">{r.body}</p>
                {r.error && <p className="text-xs text-stamp-overdue">{r.error}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

interface ReminderRow {
  id: string;
  channel: string;
  tone: string;
  subject: string;
  body: string;
  status: string;
  error: string | null;
  sent_at: string;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="money">{value}</span>
    </div>
  );
}
