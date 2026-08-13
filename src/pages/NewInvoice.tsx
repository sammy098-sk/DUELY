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
  FileText,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FileUploadZone } from "@/components/FileUploadZone";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  computeTotals,
  formatMoney,
  nextInvoiceNumber,
  type LineItem,
} from "@/lib/invoice";
import { parsePromptToInvoice, countWords, type ParsedInvoiceData } from "@/lib/aiInvoiceParser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

  // Invoice State
  const [number, setNumber] = useState("#0048");
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
  });
  const [issueDate, setIssueDate] = useState(today());
  const [dueDate, setDueDate] = useState(inDays(14));
  const [currency, setCurrency] = useState("NGN");
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState(
    "Payment is due by the stated due date. Please reference the invoice number when making payment.",
  );
  const [items, setItems] = useState<LineItem[]>([
    { description: "Website Design & Development", quantity: 1, unit_price: 420000 },
  ]);

  const [busy, setBusy] = useState(false);

  // Load existing profile details and next invoice number
  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data: invData } = await supabase.from("invoices").select("number");
      if (invData && invData.length > 0) {
        const nextNum = nextInvoiceNumber(invData.map((d) => d.number));
        setNumber(nextNum.startsWith("#") ? nextNum : `#${nextNum.replace("INV-", "")}`);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setSender({
          name: profile.business_name || "Duely Studio",
          email: profile.contact_email || user.email || "hello@example.com",
          phone: profile.phone || "+234 800 000 0000",
          address: profile.address || "Lagos, Nigeria",
          bankDetails: profile.bank_details || "Bank: Example Bank\nAccount Number: 0123456789",
        });
        if (profile.default_currency) setCurrency(profile.default_currency);
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

  // Save draft or issue invoice to Supabase
  async function saveInvoice(status: "draft" | "awaiting") {
    if (!user) {
      toast.error("You must be logged in.");
      return;
    }
    if (!client.name.trim()) {
      toast.error("Please add a client name.");
      return;
    }

    setBusy(true);
    try {
      const cleanNum = number.replace(/^#/, "");
      const { data: invoice, error } = await supabase
        .from("invoices")
        .insert({
          user_id: user.id,
          number: cleanNum.includes("-") ? cleanNum : `INV-${cleanNum}`,
          client_name: client.name,
          client_email: client.email,
          client_phone: client.phone,
          client_address: client.address,
          issue_date: issueDate,
          due_date: dueDate,
          currency,
          tax_rate: taxRate,
          discount,
          notes,
          status,
          subtotal: totals.subtotal,
          total: totals.total,
        })
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

      if (status === "draft") {
        toast.success("Saved Draft successfully.");
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

  function handleDownloadPDF() {
    toast.info("Preparing PDF preview for print/download…");
    setTimeout(() => {
      window.print();
    }, 400);
  }

  // Header CTA buttons passed into AppShell header Actions slot
  const headerActions = (
    <div className="flex items-center gap-2.5">
      {/* Save / Download Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3 text-xs font-semibold gap-1.5 border-border bg-card hover:bg-muted"
          >
            <span>Save / Download</span>
            <ChevronDown className="size-3.5 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => saveInvoice("draft")} disabled={busy} className="gap-2 cursor-pointer text-xs font-medium">
            <Save className="size-4 text-muted-foreground" />
            <span>Save Draft</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadPDF} className="gap-2 cursor-pointer text-xs font-medium">
            <Download className="size-4 text-muted-foreground" />
            <span>Download PDF</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Primary Action CTA: Send Invoice */}
      <Button
        onClick={() => saveInvoice("awaiting")}
        disabled={busy}
        size="sm"
        className="h-9 px-4 text-xs font-bold gap-2 bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98] transition-all shadow-xs"
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
    <AppShell pageTitle="Invoice Generator" headerActions={headerActions}>
      <div className="flex-1 p-4 lg:p-6 bg-background">
        <div className="mx-auto max-w-7xl">
          {/* TWO COLUMN DESKTOP WORKSPACE LAYOUT (40% Left / 60% Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ── LEFT COLUMN: AI INVOICE GENERATOR (Col 5 / ~40%) ────────── */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-paper space-y-4">
                
                {/* Heading & Subtitle */}
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-foreground">
                    AI Invoice Generator
                  </h1>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Create an invoice from a file or simply describe what you need.
                  </p>
                </div>

                {/* Generation Mode Segmented Control */}
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1 border border-border/50">
                  <button
                    type="button"
                    onClick={() => setGenMode("file")}
                    className={`rounded-lg py-2 text-xs font-bold transition-all ${
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
                    className={`rounded-lg py-2 text-xs font-bold transition-all ${
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

                    {/* Real-time Dynamic Word Counter */}
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

                    {/* Generate Button with Multi-State Support */}
                    <Button
                      onClick={handleGeneratePrompt}
                      disabled={genStatus === "generating" || !prompt.trim()}
                      className="w-full h-11 rounded-xl font-bold text-xs gap-2 bg-foreground text-background hover:bg-foreground/90 transition-all shadow-xs"
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

            {/* ── RIGHT COLUMN: LIVE INVOICE PREVIEW (Col 7 / ~60%) ───────── */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Document Container Surface */}
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-paper space-y-8 print-sheet relative overflow-hidden">
                
                {/* 1. INVOICE HEADER */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/70 pb-6">
                  {/* Left: Duely / Business logo mark */}
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-foreground text-background font-extrabold text-sm shadow-xs tracking-tight">
                      D
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold tracking-tight text-foreground uppercase">
                        INVOICE
                      </h2>
                      <p className="text-xs text-muted-foreground">{sender.name}</p>
                    </div>
                  </div>

                  {/* Right: Invoice Number Badge */}
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-3 py-1 border border-border">
                      <span className="text-[11px] font-bold text-muted-foreground">NO.</span>
                      <input
                        type="text"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        className="font-mono text-xs font-bold text-foreground bg-transparent outline-none w-20 text-right"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. INVOICE META ROW (3 Columns with Label Chips) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-border/70 pb-6">
                  {/* Col 1: Invoice to: */}
                  <div className="space-y-1.5">
                    <span className="inline-block rounded-md bg-muted px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground border border-border/60">
                      Invoice to:
                    </span>
                    <Input
                      value={client.name}
                      onChange={(e) => setClient({ ...client, name: e.target.value })}
                      placeholder="Client Name"
                      className="h-8 font-bold text-sm border-transparent hover:border-border focus:border-foreground/30 bg-transparent px-1.5"
                    />
                    <Input
                      value={client.email}
                      onChange={(e) => setClient({ ...client, email: e.target.value })}
                      placeholder="Client Email"
                      className="h-7 text-xs text-muted-foreground border-transparent hover:border-border focus:border-foreground/30 bg-transparent px-1.5"
                    />
                  </div>

                  {/* Col 2: Date & Due Date: */}
                  <div className="space-y-1.5">
                    <span className="inline-block rounded-md bg-muted px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground border border-border/60">
                      Date & Due Date:
                    </span>
                    <div className="flex items-center gap-1 pt-1">
                      <input
                        type="date"
                        value={issueDate}
                        onChange={(e) => setIssueDate(e.target.value)}
                        className="text-xs font-mono font-medium text-foreground bg-transparent outline-none cursor-pointer"
                      />
                      <span className="text-muted-foreground text-xs">→</span>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="text-xs font-mono font-medium text-foreground bg-transparent outline-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Col 3: Project Name: */}
                  <div className="space-y-1.5">
                    <span className="inline-block rounded-md bg-muted px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground border border-border/60">
                      Project Name:
                    </span>
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g. Website Redesign"
                      className="h-8 font-bold text-sm border-transparent hover:border-border focus:border-foreground/30 bg-transparent px-1.5"
                    />
                  </div>
                </div>

                {/* 3. CLIENT & SENDER DETAILS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs leading-relaxed">
                  {/* Client Info */}
                  <div className="space-y-1">
                    <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Billed To</p>
                    <p className="font-semibold text-foreground text-sm">{client.name || "Client Name"}</p>
                    <Input
                      value={client.address}
                      onChange={(e) => setClient({ ...client, address: e.target.value })}
                      placeholder="Client Address"
                      className="h-7 text-xs text-muted-foreground border-transparent hover:border-border focus:border-foreground/30 bg-transparent px-1"
                    />
                    <Input
                      value={client.phone}
                      onChange={(e) => setClient({ ...client, phone: e.target.value })}
                      placeholder="Client Phone"
                      className="h-7 text-xs text-muted-foreground border-transparent hover:border-border focus:border-foreground/30 bg-transparent px-1"
                    />
                  </div>

                  {/* Sender Info (From Profile) */}
                  <div className="space-y-1 text-left sm:text-right">
                    <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground">From</p>
                    <p className="font-semibold text-foreground text-sm">{sender.name}</p>
                    <p className="text-muted-foreground">{sender.email}</p>
                    <p className="text-muted-foreground">{sender.address}</p>
                  </div>
                </div>

                {/* 4. LINE ITEMS TABLE */}
                <div className="space-y-3 pt-2">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border/80 font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                          <th className="py-2.5 text-left font-semibold">Item</th>
                          <th className="py-2.5 text-right font-semibold w-24">Price</th>
                          <th className="py-2.5 text-right font-semibold w-16">Qty</th>
                          <th className="py-2.5 text-right font-semibold w-28">Total</th>
                          <th className="py-2.5 w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {items.map((item, idx) => (
                          <tr key={idx} className="group">
                            <td className="py-2.5 pr-2">
                              <Input
                                value={item.description}
                                onChange={(e) => updateItem(idx, { description: e.target.value })}
                                placeholder="Service description"
                                className="h-8 text-xs font-medium border-transparent hover:border-border focus:border-foreground/30 bg-transparent"
                              />
                            </td>
                            <td className="py-2.5 px-1 text-right">
                              <Input
                                type="number"
                                step="0.01"
                                value={item.unit_price}
                                onChange={(e) => updateItem(idx, { unit_price: Number(e.target.value) })}
                                className="h-8 text-xs font-mono font-medium text-right border-transparent hover:border-border focus:border-foreground/30 bg-transparent"
                              />
                            </td>
                            <td className="py-2.5 px-1 text-right">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                                className="h-8 text-xs font-mono font-medium text-right border-transparent hover:border-border focus:border-foreground/30 bg-transparent"
                              />
                            </td>
                            <td className="py-2.5 pl-2 text-right font-mono font-bold text-foreground">
                              {formatMoney(Number(item.quantity) * Number(item.unit_price), currency)}
                            </td>
                            <td className="py-2.5 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(idx)}
                                disabled={items.length <= 1}
                                className="size-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                    className="h-8 text-xs font-semibold gap-1.5 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Item</span>
                  </Button>
                </div>

                {/* 5. PAYMENT METHOD & TOTALS SUMMARY */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-4 border-t border-border/80">
                  {/* Payment Method Details */}
                  <div className="sm:col-span-7 space-y-1.5">
                    <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Payment Method
                    </p>
                    <p className="text-xs font-semibold text-foreground">Bank Transfer</p>
                    <Textarea
                      rows={2}
                      value={sender.bankDetails}
                      onChange={(e) => setSender({ ...sender, bankDetails: e.target.value })}
                      className="resize-none text-xs font-mono border-transparent hover:border-border focus:border-foreground/30 bg-transparent p-1 text-muted-foreground"
                    />
                  </div>

                  {/* Right-aligned Totals Block */}
                  <div className="sm:col-span-5 space-y-2 text-xs text-right">
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
                          className="w-12 h-6 text-xs text-right font-mono border border-border/60 rounded bg-transparent px-1"
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
                          className="w-12 h-6 text-xs text-right font-mono border border-border/60 rounded bg-transparent px-1"
                        />
                        <span>%</span>
                      </div>
                    </div>

                    <div className="border-t border-border/80 pt-2 flex justify-between items-baseline font-bold">
                      <span className="text-sm text-foreground uppercase tracking-wider">Invoice Total</span>
                      <span className="font-mono text-xl text-foreground">
                        {formatMoney(totals.total, currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6. TERMS & CONDITIONS */}
                <div className="border-t border-border/70 pt-4 text-xs space-y-1">
                  <p className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                    Terms & Conditions
                  </p>
                  <Textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="resize-none text-xs text-muted-foreground border-transparent hover:border-border focus:border-foreground/30 bg-transparent p-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
