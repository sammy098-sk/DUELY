import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { BellRing, CheckCircle2, Download, Printer, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { downloadInvoicePDF } from "@/components/InvoicePDF";
import { InvoiceSaveMenu } from "@/components/InvoiceSaveMenu";
import { supabase } from "@/integrations/supabase/client";
import {
  computeTotals,
  effectiveStatus,
  formatMoney,
  formatDateFormatted,
  type InvoiceRecord,
  type LineItem,
} from "@/lib/invoice";
import { Button } from "@/components/ui/button";

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [sending, setSending] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const { data } = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const targetId = id || "";
      const [inv, items, reminders, profile] = await Promise.all([
        supabase.from("invoices").select("*").eq("id", targetId).single(),
        supabase.from("invoice_items").select("*").eq("invoice_id", targetId).order("position"),
        supabase
          .from("reminders")
          .select("*")
          .eq("invoice_id", targetId)
          .order("sent_at", { ascending: false }),
        supabase.from("profiles").select("*").maybeSingle(),
      ]);
      if (inv.error) throw inv.error;
      return {
        invoice: inv.data as unknown as InvoiceRecord,
        items: (items.data ?? []) as unknown as LineItem[],
        reminders: (reminders.data ?? []) as unknown as ReminderRow[],
        profile: profile.data as any,
      };
    },
  });

  if (!data) {
    return (
      <AppShell pageTitle="Invoice Details">
        <p className="label-caps p-8 text-center animate-pulse">Loading invoice details…</p>
      </AppShell>
    );
  }

  const { invoice, items, reminders, profile } = data;
  const status = effectiveStatus(invoice);
  const totals = computeTotals(items, Number(invoice.tax_rate), Number(invoice.discount));

  // Extract payment method or project name if stored in notes metadata
  const notesText = invoice.notes || "";
  const paymentMethodMatch = /\[Payment Method:\s*(.*?)\]/.exec(notesText);
  const projectNameMatch = /\[Project:\s*(.*?)\]/.exec(notesText);

  const paymentMethod = invoice.payment_method || paymentMethodMatch?.[1] || "Bank Transfer";
  const projectName = invoice.project_name || projectNameMatch?.[1] || "Invoice Details";
  const cleanNotes = notesText.replace(/\[(Payment Method|Project):.*?\]/g, "").trim();

  const displayNum = invoice.number.startsWith("#")
    ? invoice.number
    : `#${invoice.number.replace(/^INV-/, "")}`;

  async function markPaid() {
    if (!id) return;
    const payload = {
      status: "paid",
      due_date: null,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("Marking invoice as paid:", { invoiceId: id, payload });

    const { error } = await supabase
      .from("invoices")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("Failed to mark invoice as paid:", {
        error,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      toast.error(`Failed to update invoice: ${error.message}`);
      return;
    }

    toast.success("Invoice marked as paid. Due date cleared.");
    qc.invalidateQueries({ queryKey: ["invoice", id] });
    qc.invalidateQueries({ queryKey: ["invoices"] });
  }

  async function handleDownloadPDF() {
    if (downloadingPDF) return;
    setDownloadingPDF(true);
    toast.info("Generating PDF file…");

    try {
      await downloadInvoicePDF({
        number: displayNum,
        sender: {
          name: profile?.business_name || profile?.company_name || "Duely Studio",
          email: profile?.contact_email || "",
          phone: profile?.phone || "",
          address: profile?.address || "",
          bankDetails: profile?.bank_details || "",
          companyLogoUrl: profile?.company_logo_url || "",
          signatureUrl: profile?.signature_url || "",
        },
        client: {
          name: invoice.client_name,
          email: invoice.client_email,
          phone: invoice.client_phone,
          address: invoice.client_address,
        },
        projectName,
        issueDate: invoice.issue_date,
        dueDate: invoice.due_date,
        currency: invoice.currency,
        items,
        subtotal: totals.subtotal,
        discount: Number(invoice.discount),
        taxRate: Number(invoice.tax_rate),
        total: totals.total,
        paymentMethod,
        notes: cleanNotes,
      });
      toast.success("Invoice PDF downloaded!");
    } catch (err: any) {
      console.error("PDF generation error:", err);
      toast.error(`Failed to generate PDF: ${err?.message || "Unknown error"}`);
    } finally {
      setDownloadingPDF(false);
    }
  }

  async function chase() {
    if (!id) return;
    if (status === "paid" || invoice.due_date === null) {
      toast.error("Reminders cannot be sent for paid invoices.");
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("run-reminders", {
        body: { invoiceId: id },
      });

      if (error) {
        console.error("Send reminder error:", {
          error,
          message: error.message,
          name: error.name,
        });
        toast.error(`Failed to send reminder: ${error.message || "Edge Function error"}`);
        return;
      }

      if (data && data.channels) {
        const failed = data.channels.filter((c: any) => c.status === "failed");
        if (failed.length === data.channels.length) {
          toast.error(`Reminder drafted but delivery failed: ${failed[0]?.error ?? "No active communication channel"}`);
        } else {
          toast.success(`${data.tone ? data.tone.toUpperCase() : "Payment"} reminder sent successfully.`);
        }
      } else {
        toast.success("Reminder sent successfully.");
      }

      qc.invalidateQueries({ queryKey: ["invoice", id] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    } catch (err: any) {
      console.error("Unexpected error during reminder send:", err);
      toast.error(`Failed to send reminder: ${err?.message || "Network or server error"}`);
    } finally {
      setSending(false);
    }
  }

  const headerActions = (
    <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
      <InvoiceSaveMenu
        onDownloadPDF={handleDownloadPDF}
        downloadingPDF={downloadingPDF}
      />
    </div>
  );

  return (
    <AppShell pageTitle={`Invoice ${displayNum}`} headerActions={headerActions}>
      <div className="space-y-6 p-4 lg:p-8 max-w-4xl mx-auto font-sans">
        {/* Action Toolbar */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={chase}
              disabled={sending || status === "paid" || status === "draft"}
              className="gap-1.5 font-bold text-xs cursor-pointer font-sans"
            >
              <BellRing className="size-3.5" />
              <span>{sending ? "Drafting…" : "Send reminder now"}</span>
            </Button>
            {status !== "paid" && (
              <Button variant="outline" size="sm" onClick={markPaid} className="gap-1.5 font-bold text-xs cursor-pointer font-sans">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>Mark as Paid</span>
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <InvoiceSaveMenu
              onDownloadPDF={handleDownloadPDF}
              downloadingPDF={downloadingPDF}
            />
          </div>
        </div>

        {/* Printable Document Surface */}
        <article className="ledger-panel print-sheet p-8 sm:p-10 space-y-6 relative">
          
          {/* 1. CLEAN HEADER (Logo & Name on Left | Plain Static NO. #0001 on Right — NO STATUS BADGE) */}
          <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
            <div className="flex items-center gap-3">
              {profile?.company_logo_url ? (
                <img
                  src={profile.company_logo_url}
                  alt="Company Logo"
                  className="h-12 w-auto max-w-[140px] object-contain rounded border border-border/40 shrink-0"
                />
              ) : (
                <div className="flex size-11 items-center justify-center rounded-xl bg-foreground text-background font-extrabold text-sm shadow-xs tracking-tight shrink-0 font-sans">
                  {(profile?.business_name || profile?.company_name || "D").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-xl font-extrabold text-foreground uppercase tracking-tight font-serif">
                  {profile?.business_name || profile?.company_name || "Invoice"}
                </h1>
                <p className="text-xs text-muted-foreground font-sans">{profile?.contact_email}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1.5 font-mono text-sm font-extrabold text-foreground">
                <span className="text-[11px] font-bold text-muted-foreground label-caps">NO.</span>
                <span>{displayNum}</span>
              </div>
            </div>
          </header>

          {/* 2. META ROW (3 Columns: INVOICE TO | DATE | PROJECT NAME) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-border pb-5 text-xs">
            <div className="space-y-1 font-sans">
              <span className="label-caps font-bold">INVOICE TO</span>
              <p className="font-extrabold text-sm text-foreground">{invoice.client_name}</p>
            </div>
            <div className="space-y-1">
              <span className="label-caps font-bold">DATE</span>
              <p className="font-mono font-bold text-foreground pt-0.5">
                {formatDateFormatted(invoice.issue_date)}
              </p>
            </div>
            <div className="space-y-1 font-sans">
              <span className="label-caps font-bold">PROJECT NAME</span>
              <p className="font-bold text-xs text-foreground pt-0.5">{projectName}</p>
            </div>
          </div>

          {/* 3. BILLED TO / FROM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs leading-relaxed font-sans">
            <div>
              <p className="label-caps font-bold">Billed To</p>
              <p className="font-bold text-sm text-foreground">{invoice.client_name}</p>
              <p className="text-muted-foreground whitespace-pre-line">
                {invoice.client_address}
                {invoice.client_email ? `\n${invoice.client_email}` : ""}
                {invoice.client_phone ? `\n${invoice.client_phone}` : ""}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="label-caps font-bold">From</p>
              <p className="font-bold text-sm text-foreground">
                {profile?.business_name || profile?.company_name || "Duely Studio"}
              </p>
              <p className="text-muted-foreground">{profile?.contact_email}</p>
              <p className="text-muted-foreground whitespace-pre-line">{profile?.address}</p>
            </div>
          </div>

          {/* 4. LINE ITEMS TABLE */}
          <div className="space-y-3">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border label-caps text-left">
                  <th className="py-2.5 font-bold">Item</th>
                  <th className="py-2.5 text-right font-bold w-24">Price</th>
                  <th className="py-2.5 text-right font-bold w-16">Qty</th>
                  <th className="py-2.5 text-right font-bold w-28">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item, i) => (
                  <tr key={i} className="align-top">
                    <td className="py-3 pr-3 text-left font-medium text-foreground whitespace-normal overflow-wrap-anywhere break-words leading-relaxed font-sans">
                      {item.description}
                    </td>
                    <td className="py-3 px-1 text-right font-mono font-medium">
                      {formatMoney(Number(item.unit_price), invoice.currency)}
                    </td>
                    <td className="py-3 px-1 text-right font-mono font-medium">
                      {Number(item.quantity)}
                    </td>
                    <td className="py-3 pl-2 text-right font-mono font-bold text-foreground">
                      {formatMoney(Number(item.quantity) * Number(item.unit_price), invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5. PAYMENT METHOD, BANK DETAILS & REPOSITIONED INVOICE TOTAL */}
          <div className="space-y-6 pt-4 border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start text-xs font-sans">
              <div className="sm:col-span-7 space-y-2">
                <p className="label-caps font-bold">Payment Method</p>
                <p className="font-semibold text-foreground">{paymentMethod}</p>

                {profile?.bank_details && (
                  <div className="pt-2">
                    <p className="label-caps font-bold">Bank Details</p>
                    <p className="mt-1 text-xs font-mono text-muted-foreground whitespace-pre-line leading-relaxed">
                      {profile.bank_details}
                    </p>
                  </div>
                )}
              </div>

              <div className="sm:col-span-5 space-y-2 text-right">
                <SummaryRow label="Subtotal" value={formatMoney(totals.subtotal, invoice.currency)} />
                {Number(invoice.discount) > 0 && (
                  <SummaryRow
                    label="Discount"
                    value={`− ${formatMoney(Number(invoice.discount), invoice.currency)}`}
                  />
                )}
                {Number(invoice.tax_rate) > 0 && (
                  <SummaryRow
                    label={`Tax (${Number(invoice.tax_rate)}%)`}
                    value={formatMoney(totals.tax, invoice.currency)}
                  />
                )}
              </div>
            </div>

            <div className="border-t border-b border-border py-3.5 flex justify-between items-baseline font-bold bg-muted/20 px-4 rounded-xl">
              <span className="text-sm text-foreground uppercase tracking-wider font-extrabold font-sans">
                Invoice Total
              </span>
              <span className="font-mono text-2xl font-extrabold text-foreground">
                {formatMoney(totals.total, invoice.currency)}
              </span>
            </div>
          </div>

          {/* 6. BOTTOM DUE DATE EXCLUSIVE SECTION */}
          {invoice.due_date ? (
            <div className="border-t border-border pt-4 space-y-4 text-xs font-sans">
              {profile?.signature_url && (
                <div className="space-y-1">
                  <p className="label-caps font-bold">Authorized Signature</p>
                  <img
                    src={profile.signature_url}
                    alt="Signature"
                    className="max-h-14 w-auto object-contain rounded bg-card p-1 border border-border/40"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <p className="font-semibold text-foreground">
                  Payment due by <span className="font-mono font-bold">{formatDateFormatted(invoice.due_date)}</span>.
                </p>
                <p className="text-muted-foreground font-medium">
                  Please reference the invoice number (<span className="font-mono font-bold text-foreground">{displayNum}</span>) when making payment.
                </p>
                {cleanNotes && (
                  <p className="text-muted-foreground whitespace-pre-line pt-1">{cleanNotes}</p>
                )}
              </div>
            </div>
          ) : profile?.signature_url ? (
            <div className="border-t border-border pt-4 font-sans">
              <p className="label-caps font-bold">Authorized Signature</p>
              <img
                src={profile.signature_url}
                alt="Signature"
                className="max-h-14 w-auto object-contain rounded bg-card p-1 border border-border/40 mt-1"
              />
            </div>
          ) : null}
        </article>

        {/* Reminder History Log */}
        <section className="no-print ledger-panel overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <p className="label-caps font-bold">Reminder history</p>
          </div>
          {reminders.length === 0 ? (
            <p className="px-5 py-8 text-center text-xs text-muted-foreground">
              Nothing sent yet. Duely checks unpaid invoices every 3 days.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {reminders.map((r) => (
                <li key={r.id} className="space-y-2 px-5 py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="label-caps">{new Date(r.sent_at).toLocaleString()}</span>
                    <span className="rounded-sm border border-border px-2 py-0.5 text-[0.7rem] font-semibold uppercase font-sans">
                      {r.channel}
                    </span>
                    <span className="rounded-sm border border-border px-2 py-0.5 text-[0.7rem] font-semibold uppercase font-sans">
                      {r.tone}
                    </span>
                    <span
                      className={
                        r.status === "sent"
                          ? "text-[0.7rem] font-semibold text-stamp-paid uppercase font-sans"
                          : "text-[0.7rem] font-semibold text-stamp-overdue uppercase font-sans"
                      }
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="font-medium text-xs font-sans">{r.subject}</p>
                  <p className="text-xs whitespace-pre-line text-muted-foreground font-sans">{r.body}</p>
                  {r.error && <p className="text-xs text-stamp-overdue font-sans">{r.error}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
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
    <div className="flex items-baseline justify-between gap-4 font-sans">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold text-foreground">{value}</span>
    </div>
  );
}
