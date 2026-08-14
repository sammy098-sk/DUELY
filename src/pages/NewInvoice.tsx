import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Sparkles,
  Plus,
  Trash2,
  Send,
  Download,
  Save,
  Loader2,
  Check,
  ChevronDown,
  Printer,
  Calendar,
  X,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FileUploadZone } from "@/components/FileUploadZone";
import { downloadInvoicePDF } from "@/components/InvoicePDF";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  computeTotals,
  formatMoney,
  formatDateFormatted,
  nextInvoiceNumber,
  daysOverdue,
  type LineItem,
  type InvoiceStatus,
} from "@/lib/invoice";
import { parsePromptToInvoice, countWords, type ParsedInvoiceData } from "@/lib/aiInvoiceParser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const today = () => new Date().toISOString().slice(0, 10);
const inDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

export default function NewInvoice() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Generation Mode: 'prompt' or 'file'
  const [genMode, setGenMode] = useState<"prompt" | "file">("prompt");
  const [prompt, setPrompt] = useState("");
  const [genStatus, setGenStatus] = useState<"idle" | "loading" | "generating" | "success" | "error">("idle");

  // Invoice Data State
  const [number, setNumber] = useState("#0001");
  const [projectName, setProjectName] = useState("Website Redesign");
  const [client, setClient] = useState({
    name: "Acme Studio",
    email: "billing@acmestudio.com",
    phone: "+234 801 234 5678",
    address: "Lagos, Nigeria",
  });
  const [sender, setSender] = useState({
    name: "Duely Studio",
    email: "hello@example.com",
    phone: "+234 800 000 0000",
    address: "Lagos, Nigeria",
    bankDetails: "Bank: Example Bank\nAccount Number: 0123456789",
    companyLogoUrl: "",
    signatureUrl: "",
  });
  const [issueDate, setIssueDate] = useState(today());
  const [dueDate, setDueDate] = useState<string>(inDays(14)); // Blank means Paid (no due date line)
  const [currency, setCurrency] = useState("NGN");
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [notes, setNotes] = useState(
    "Please reference the invoice number when making payment.",
  );
  const [items, setItems] = useState<LineItem[]>([
    { description: "Website Design & Development for Acme Studio", quantity: 1, unit_price: 420000 },
  ]);

  const [busy, setBusy] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Load existing profile details and next sequential invoice number
  useEffect(() => {
    (async () => {
      if (!user) return;
      
      const { data: invData } = await supabase.from("invoices").select("number");
      if (invData && invData.length > 0) {
        const nextNum = nextInvoiceNumber(invData.map((d) => d.number));
        setNumber(nextNum);
      } else {
        setNumber("#0001");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        const ext = profile as any;
        setSender({
          name: ext.business_name || ext.company_name || "Duely Studio",
          email: ext.contact_email || user.email || "hello@example.com",
          phone: ext.phone || "+234 800 000 0000",
          address: ext.address || "Lagos, Nigeria",
          bankDetails: ext.bank_details || "Bank: Example Bank\nAccount Number: 0123456789",
          companyLogoUrl: ext.company_logo_url || "",
          signatureUrl: ext.signature_url || "",
        });
        if (ext.default_currency) setCurrency(ext.default_currency);
      }
    })();
  }, [user]);

  const totals = computeTotals(items, taxRate, discount);
  const wordCount = countWords(prompt);

  // Handle AI prompt generation
  async function handleGeneratePrompt() {
    if (!prompt.trim()) {
      toast.error("Please enter a description of the invoice you want to generate.");
      return;
    }
    setGenStatus("generating");
    try {
      await new Promise((res) => setTimeout(res, 800));
      const parsed = parsePromptToInvoice(prompt);
      applyParsedInvoice(parsed);
      setGenStatus("success");
      toast.success("Invoice generated! Preview updated.");
      setTimeout(() => setGenStatus("idle"), 2000);
    } catch {
      setGenStatus("error");
      toast.error("Could not parse prompt. Please try a different description.");
    }
  }

  // Handle AI file extraction callback
  function handleFileProcessed(parsed: ParsedInvoiceData) {
    applyParsedInvoice(parsed);
    toast.success("Extracted invoice details from file!");
  }

  // Apply parsed data to state
  function applyParsedInvoice(parsed: ParsedInvoiceData) {
    if (parsed.clientName) {
      setClient((prev) => ({
        ...prev,
        name: parsed.clientName,
        email: parsed.clientEmail || prev.email,
        phone: parsed.clientPhone || prev.phone,
        address: parsed.clientAddress || prev.address,
      }));
    }
    if (parsed.projectName) setProjectName(parsed.projectName);
    if (parsed.currency) setCurrency(parsed.currency);
    if (parsed.dueDays) setDueDate(inDays(parsed.dueDays));
    if (parsed.items && parsed.items.length > 0) setItems(parsed.items);
    if (parsed.notes) setNotes(parsed.notes);
  }

  function updateItem(i: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { description: "Additional Service", quantity: 1, unit_price: 50000 }]);
  }

  function removeItem(i: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  // Save draft or issued invoice to Supabase
  async function saveInvoice(targetStatus?: "draft" | "sent") {
    if (!user) {
      toast.error("You must be logged in.");
      return;
    }
    if (!client.name.trim()) {
      toast.error("Please add a client name.");
      return;
    }

    const isDraft = targetStatus === "draft";
    const finalStatus: InvoiceStatus = isDraft
      ? "draft"
      : !dueDate
        ? "paid"
        : daysOverdue(dueDate) > 0
          ? "overdue"
          : "awaiting";

    setBusy(true);

    try {
      const payloadNotes = `${notes}\n\n[Payment Method: ${paymentMethod}]\n[Project: ${projectName}]`;

      const { data: invoice, error } = await supabase
        .from("invoices")
        .insert({
          user_id: user.id,
          number,
          client_name: client.name,
          client_email: client.email,
          client_phone: client.phone,
          client_address: client.address,
          issue_date: issueDate,
          due_date: dueDate || null,
          currency,
          tax_rate: taxRate,
          discount,
          notes: payloadNotes,
          status: finalStatus,
          subtotal: totals.subtotal,
          total: totals.total,
          paid_at: finalStatus === "paid" ? new Date().toISOString() : null,
        } as any)
        .select()
        .single();

      if (error) throw error;

      const rows = items
        .filter((i) => i.description.trim() || i.unit_price)
        .map((i, idx) => ({
          invoice_id: invoice.id,
          user_id: user.id,
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unit_price,
          position: idx,
        }));

      if (rows.length) {
        const { error: itemsError } = await supabase.from("invoice_items").insert(rows);
        if (itemsError) throw itemsError;
      }

      if (finalStatus === "draft") {
        toast.success("Saved Draft successfully.");
      } else if (finalStatus === "paid") {
        toast.success("Invoice saved (no due date).");
      } else {
        toast.success("Invoice sent — Duely chases payment automatically!");
      }
      navigate(`/invoices/${invoice.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save invoice");
    } finally {
      setBusy(false);
    }
  }

  // Programmatic PDF Download using @react-pdf/renderer
  async function handleDownloadPDF() {
    if (downloadingPDF) return;
    setDownloadingPDF(true);
    toast.info("Generating PDF file…");

    try {
      await downloadInvoicePDF({
        number,
        sender,
        client,
        projectName,
        issueDate,
        dueDate,
        currency,
        items,
        subtotal: totals.subtotal,
        discount,
        taxRate,
        total: totals.total,
        paymentMethod,
        notes,
      });
      toast.success("Invoice PDF downloaded!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setDownloadingPDF(false);
    }
  }

  // Header CTA buttons passed into AppShell header Actions slot
  const headerActions = (
    <div className="flex items-center gap-2.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3 text-xs font-semibold gap-1.5 border-border bg-card hover:bg-muted cursor-pointer"
          >
            <span>Save / Download</span>
            <ChevronDown className="size-3.5 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => saveInvoice("draft")} disabled={busy} className="gap-2 cursor-pointer text-xs font-medium">
            <Save className="size-4 text-muted-foreground" />
            <span>Save Draft</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadPDF} disabled={downloadingPDF} className="gap-2 cursor-pointer text-xs font-medium">
            {downloadingPDF ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <Download className="size-4 text-muted-foreground" />
            )}
            <span>{downloadingPDF ? "Generating PDF…" : "Download PDF"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.print()} className="gap-2 cursor-pointer text-xs font-medium border-t border-border/50">
            <Printer className="size-4 text-muted-foreground" />
            <span>Print Invoice</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        onClick={() => saveInvoice()}
        disabled={busy}
        size="sm"
        className="h-9 px-4 text-xs font-bold gap-2 bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98] transition-all shadow-xs cursor-pointer"
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-3.5 fill-current" />
        )}
        <span>Send Invoice</span>
      </Button>
    </div>
  );

  return (
    <AppShell pageTitle="New Invoice" headerActions={headerActions}>
      <div className="flex-1 p-4 lg:p-6 bg-background font-sans">
        <div className="mx-auto max-w-7xl">
          {/* TWO COLUMN DESKTOP WORKSPACE LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ── LEFT COLUMN: AI INVOICE GENERATOR ────────── */}
            <div className="lg:col-span-5 space-y-4 no-print">
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-paper space-y-4">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-foreground font-sans">
                    AI Invoice Generator
                  </h1>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed font-sans">
                    Create an invoice from a file or simply describe what you need.
                  </p>
                </div>

                {/* Generation Mode Segmented Control */}
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1 border border-border/50">
                  <button
                    type="button"
                    onClick={() => setGenMode("file")}
                    className={`rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                      genMode === "file"
                        ? "bg-card text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Generate by File
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenMode("prompt")}
                    className={`rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                      genMode === "prompt"
                        ? "bg-card text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Generate by Prompt
                  </button>
                </div>

                {/* Mode 1: Generate by Prompt */}
                {genMode === "prompt" && (
                  <div className="space-y-3">
                    <Textarea
                      rows={5}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="> Describe the invoice you want to create. For example: Create an invoice for Acme Studio for ₦420,000 for website design and development, due in 14 days."
                      className="resize-none font-sans text-xs leading-relaxed border-border/80 focus:border-foreground/40 bg-background/50 placeholder:text-muted-foreground/50 rounded-xl"
                    />

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-mono">
                        {wordCount} / 4,000 words
                      </span>
                      {wordCount > 0 && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          Ready to generate
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={handleGeneratePrompt}
                      disabled={genStatus === "generating" || !prompt.trim()}
                      className="w-full h-11 rounded-xl font-bold text-xs gap-2 bg-foreground text-background hover:bg-foreground/90 transition-all shadow-xs cursor-pointer"
                    >
                      {genStatus === "generating" ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>Generating invoice…</span>
                        </>
                      ) : genStatus === "success" ? (
                        <>
                          <Check className="size-4 text-emerald-400" />
                          <span>Invoice Generated!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-4 text-primary fill-primary/20" />
                          <span>Generate</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Mode 2: Generate by File */}
                {genMode === "file" && (
                  <FileUploadZone onFileProcessed={handleFileProcessed} />
                )}
              </div>
            </div>

            {/* ── RIGHT COLUMN: LIVE INVOICE PREVIEW & DOCUMENT ── */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Document Container Surface */}
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-paper space-y-6 print-sheet relative">
                
                {/* 1. CLEAN INVOICE HEADER (Logo/Name on Left | Plain NO. #0001 on Right — NO STATUS BADGE) */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/70 pb-5">
                  <div className="flex items-center gap-3">
                    {sender.companyLogoUrl ? (
                      <img
                        src={sender.companyLogoUrl}
                        alt="Company Logo"
                        className="h-12 w-auto max-w-[140px] object-contain rounded border border-border/40 shrink-0"
                      />
                    ) : (
                      <div className="flex size-11 items-center justify-center rounded-xl bg-foreground text-background font-extrabold text-sm shadow-xs tracking-tight shrink-0 font-sans">
                        {sender.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-extrabold tracking-tight text-foreground uppercase font-serif">
                        {sender.name}
                      </h2>
                      <p className="text-xs font-medium text-muted-foreground font-sans">{sender.email}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1.5 font-mono text-sm font-extrabold text-foreground">
                      <span className="text-[11px] font-bold text-muted-foreground label-caps">NO.</span>
                      <span>{number}</span>
                    </div>
                  </div>
                </div>

                {/* 2. CLEAN META ROW (3 Columns: INVOICE TO | DATE | PROJECT NAME) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-border/70 pb-5">
                  {/* Col 1: INVOICE TO */}
                  <div className="space-y-1">
                    <Label className="label-caps font-bold">INVOICE TO</Label>
                    <Input
                      value={client.name}
                      onChange={(e) => setClient({ ...client, name: e.target.value })}
                      placeholder="Client Name"
                      className="h-8 font-extrabold text-sm border-0 border-b border-border/60 rounded-none bg-transparent px-0 shadow-none focus-visible:ring-0 focus:border-emerald-500 font-sans"
                    />
                  </div>

                  {/* Col 2: DATE (Issue Date Only) */}
                  <div className="space-y-1">
                    <Label className="label-caps font-bold">DATE</Label>
                    <div className="pt-1.5 font-mono text-xs font-bold text-foreground">
                      {formatDateFormatted(issueDate)}
                    </div>
                  </div>

                  {/* Col 3: PROJECT NAME */}
                  <div className="space-y-1">
                    <Label className="label-caps font-bold">PROJECT NAME</Label>
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Website Redesign"
                      className="h-8 font-bold text-xs border-0 border-b border-border/60 rounded-none bg-transparent px-0 shadow-none focus-visible:ring-0 focus:border-emerald-500 font-sans"
                    />
                  </div>
                </div>

                {/* 3. BILLED TO / FROM */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs leading-relaxed font-sans">
                  {/* Client Details */}
                  <div className="space-y-1">
                    <p className="label-caps font-bold">Billed To</p>
                    <p className="font-bold text-foreground text-sm">{client.name || "Client Name"}</p>
                    <Input
                      value={client.address}
                      onChange={(e) => setClient({ ...client, address: e.target.value })}
                      placeholder="Client Address"
                      className="h-7 text-xs border-0 border-b border-border/40 rounded-none bg-transparent px-0 shadow-none focus-visible:ring-0 font-sans"
                    />
                    <Input
                      value={client.email}
                      onChange={(e) => setClient({ ...client, email: e.target.value })}
                      placeholder="Client Email"
                      className="h-7 text-xs border-0 border-b border-border/40 rounded-none bg-transparent px-0 shadow-none focus-visible:ring-0 font-sans"
                    />
                    <Input
                      value={client.phone}
                      onChange={(e) => setClient({ ...client, phone: e.target.value })}
                      placeholder="Client Phone"
                      className="h-7 text-xs border-0 border-b border-border/40 rounded-none bg-transparent px-0 shadow-none focus-visible:ring-0 font-sans"
                    />
                  </div>

                  {/* Sender Details */}
                  <div className="space-y-1 text-left sm:text-right">
                    <p className="label-caps font-bold">From</p>
                    <p className="font-bold text-foreground text-sm">{sender.name}</p>
                    <p className="text-muted-foreground">{sender.email}</p>
                    <p className="text-muted-foreground whitespace-pre-line">{sender.address}</p>
                    {sender.phone && <p className="text-muted-foreground">{sender.phone}</p>}
                  </div>
                </div>

                {/* 4. LINE ITEMS TABLE */}
                <div className="space-y-4 pt-2">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/80 label-caps text-left">
                        <th className="py-2.5 font-bold">Item</th>
                        <th className="py-2.5 text-right font-bold w-24">Price</th>
                        <th className="py-2.5 text-right font-bold w-16">Qty</th>
                        <th className="py-2.5 text-right font-bold w-28">Total</th>
                        <th className="py-2.5 w-8 no-print"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {items.map((item, idx) => (
                        <tr key={idx} className="group align-top">
                          <td className="py-3 pr-3 text-left">
                            <Textarea
                              rows={2}
                              value={item.description}
                              onChange={(e) => updateItem(idx, { description: e.target.value })}
                              placeholder="Description of service..."
                              className="w-full text-xs font-medium border-0 border-b border-border/40 rounded-none bg-transparent p-0 shadow-none focus-visible:ring-0 focus:border-emerald-500 resize-none whitespace-normal overflow-wrap-anywhere break-words leading-relaxed font-sans"
                            />
                          </td>
                          <td className="py-3 px-1 text-right">
                            <Input
                              type="number"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateItem(idx, { unit_price: Number(e.target.value) })}
                              className="h-8 text-xs font-mono font-medium text-right border-0 border-b border-border/40 rounded-none bg-transparent p-0 shadow-none focus-visible:ring-0"
                            />
                          </td>
                          <td className="py-3 px-1 text-right">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                              className="h-8 text-xs font-mono font-medium text-right border-0 border-b border-border/40 rounded-none bg-transparent p-0 shadow-none focus-visible:ring-0"
                            />
                          </td>
                          <td className="py-3 pl-2 text-right font-mono font-bold text-foreground whitespace-nowrap pt-3">
                            {formatMoney(Number(item.quantity) * Number(item.unit_price), currency)}
                          </td>
                          <td className="py-3 text-right no-print pt-2.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(idx)}
                              disabled={items.length <= 1}
                              className="size-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="pt-1 mb-6">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addItem}
                      className="h-8 text-xs font-semibold gap-1.5 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-foreground shadow-2xs hover:-translate-y-[2px] hover:shadow-md transition-all duration-150 ease-in-out cursor-pointer font-sans"
                    >
                      <Plus className="size-3.5" />
                      <span>Add Item</span>
                    </Button>
                  </div>
                </div>

                {/* 5. PAYMENT METHOD, BANK DETAILS & REPOSITIONED INVOICE TOTAL */}
                <div className="space-y-6 pt-4 border-t border-border/80">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start font-sans">
                    <div className="sm:col-span-7 space-y-2">
                      <Label className="label-caps font-bold">Payment Method</Label>
                      <Input
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        placeholder="Bank Transfer, Cash, PayPal..."
                        className="h-8 text-xs font-semibold border-0 border-b border-border/60 rounded-none bg-transparent px-0 shadow-none focus-visible:ring-0 focus:border-emerald-500 font-sans"
                      />

                      <div className="pt-2">
                        <Label className="label-caps font-bold">Bank Details (From Profile)</Label>
                        <p className="mt-1 text-xs font-mono text-muted-foreground whitespace-pre-line leading-relaxed">
                          {sender.bankDetails || "Bank details configured in Profile/Settings"}
                        </p>
                      </div>
                    </div>

                    <div className="sm:col-span-5 space-y-2 text-xs text-right font-sans">
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Subtotal</span>
                        <span className="font-mono font-semibold text-foreground">
                          {formatMoney(totals.subtotal, currency)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Discount</span>
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(Number(e.target.value))}
                            className="w-14 h-6 text-xs text-right font-mono border-0 border-b border-border/60 bg-transparent px-1 outline-none"
                          />
                          <span className="font-mono">{currency}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Tax Rate</span>
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            value={taxRate}
                            onChange={(e) => setTaxRate(Number(e.target.value))}
                            className="w-12 h-6 text-xs text-right font-mono border-0 border-b border-border/60 bg-transparent px-1 outline-none"
                          />
                          <span>%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-b border-border/80 py-3.5 flex justify-between items-baseline font-bold bg-muted/20 px-4 rounded-xl">
                    <span className="text-sm text-foreground uppercase tracking-wider font-extrabold font-sans">
                      Invoice Total
                    </span>
                    <span className="font-mono text-2xl font-extrabold text-foreground">
                      {formatMoney(totals.total, currency)}
                    </span>
                  </div>
                </div>

                {/* 6. BOTTOM DUE DATE EXCLUSIVE SECTION */}
                {dueDate ? (
                  <div className="border-t border-border/70 pt-4 space-y-4 font-sans">
                    {sender.signatureUrl && (
                      <div className="space-y-1">
                        <Label className="label-caps font-bold">Authorized Signature</Label>
                        <img
                          src={sender.signatureUrl}
                          alt="Signature"
                          className="max-h-14 w-auto object-contain rounded bg-card p-1 border border-border/40"
                        />
                      </div>
                    )}

                    <div className="text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground">
                          Payment due by{" "}
                          <span className="font-mono font-bold text-foreground">
                            {formatDateFormatted(dueDate)}
                          </span>
                          .
                        </p>
                        <div className="flex items-center gap-2 no-print">
                          <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="font-mono text-xs font-semibold text-foreground bg-transparent border-0 border-b border-border/60 p-0 outline-none cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => setDueDate("")}
                            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer underline font-medium"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">
                        Please reference the invoice number (<span className="font-mono font-bold text-foreground">{number}</span>) when making payment.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 font-sans">
                    {sender.signatureUrl && (
                      <div className="border-t border-border/70 pt-4">
                        <Label className="label-caps font-bold">Authorized Signature</Label>
                        <img
                          src={sender.signatureUrl}
                          alt="Signature"
                          className="max-h-14 w-auto object-contain rounded bg-card p-1 border border-border/40 mt-1"
                        />
                      </div>
                    )}

                    {/* No-print control to add a due date if needed */}
                    <div className="no-print pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-dashed border-border/50">
                      <span className="text-[11px]">No due date set (Invoice is treated as Paid)</span>
                      <button
                        type="button"
                        onClick={() => setDueDate(inDays(14))}
                        className="inline-flex items-center gap-1 font-bold text-xs text-primary hover:underline cursor-pointer"
                      >
                        <Calendar className="size-3.5" />
                        <span>Add Due Date</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
