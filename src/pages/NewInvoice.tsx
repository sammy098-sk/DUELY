import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { computeTotals, formatMoney, nextInvoiceNumber, type LineItem } from "@/lib/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const today = () => new Date().toISOString().slice(0, 10);
const inDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

export default function NewInvoice() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [number, setNumber] = useState("");
  const [client, setClient] = useState({ name: "", email: "", phone: "", address: "" });
  const [issueDate, setIssueDate] = useState(today());
  const [dueDate, setDueDate] = useState(inDays(14));
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unit_price: 0 },
  ]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("invoices").select("number");
      setNumber(nextInvoiceNumber((data ?? []).map((d) => d.number)));
      const { data: profile } = await supabase
        .from("profiles")
        .select("default_currency")
        .maybeSingle();
      if (profile?.default_currency) setCurrency(profile.default_currency);
    })();
  }, []);

  const totals = computeTotals(items, taxRate, discount);

  function updateItem(i: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  async function save(status: "draft" | "awaiting") {
    if (!user) return;
    if (!client.name.trim()) {
      toast.error("Add a client name first.");
      return;
    }
    setBusy(true);
    try {
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

      toast.success(status === "draft" ? "Saved as draft." : "Invoice issued — chasing begins.");
      navigate(`/invoices/${invoice.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save invoice");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl">New invoice</h1>

      <div className="ledger-panel space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Invoice number">
            <Input value={number} onChange={(e) => setNumber(e.target.value)} className="font-mono" />
          </Field>
          <Field label="Currency">
            <Input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} />
          </Field>
          <Field label="Client name">
            <Input value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} />
          </Field>
          <Field label="Client email">
            <Input
              type="email"
              value={client.email}
              onChange={(e) => setClient({ ...client, email: e.target.value })}
            />
          </Field>
          <Field label="Client WhatsApp (+country code)">
            <Input
              value={client.phone}
              onChange={(e) => setClient({ ...client, phone: e.target.value })}
              placeholder="+2348012345678"
            />
          </Field>
          <Field label="Client address">
            <Input
              value={client.address}
              onChange={(e) => setClient({ ...client, address: e.target.value })}
            />
          </Field>
          <Field label="Issue date">
            <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          </Field>
          <Field label="Due date">
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="ledger-panel p-6">
        <p className="label-caps mb-4">Line items</p>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 items-end gap-2">
              <div className="col-span-12 sm:col-span-6">
                <Input
                  placeholder="Service or deliverable"
                  value={item.description}
                  onChange={(e) => updateItem(i, { description: e.target.value })}
                />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <Input
                  type="number"
                  step="0.01"
                  className="font-mono"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
                />
              </div>
              <div className="col-span-5 sm:col-span-3">
                <Input
                  type="number"
                  step="0.01"
                  className="font-mono"
                  value={item.unit_price}
                  onChange={(e) => updateItem(i, { unit_price: Number(e.target.value) })}
                />
              </div>
              <div className="col-span-3 sm:col-span-1 flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                  disabled={items.length === 1}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => setItems([...items, { description: "", quantity: 1, unit_price: 0 }])}
        >
          <Plus className="size-4" /> Add line
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="ledger-panel space-y-4 p-6">
          <Field label="Tax rate (%)">
            <Input
              type="number"
              step="0.01"
              className="font-mono"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
            />
          </Field>
          <Field label="Discount">
            <Input
              type="number"
              step="0.01"
              className="font-mono"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </Field>
          <Field label="Notes">
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </div>

        <div className="ledger-panel p-6">
          <p className="label-caps mb-4">Running total</p>
          <dl className="space-y-2 text-sm">
            <Row label="Subtotal" value={formatMoney(totals.subtotal, currency)} />
            <Row label="Discount" value={`− ${formatMoney(discount, currency)}`} />
            <Row label={`Tax (${taxRate}%)`} value={formatMoney(totals.tax, currency)} />
            <div className="border-t border-border pt-3">
              <Row
                label="Total due"
                value={formatMoney(totals.total, currency)}
                emphasis
              />
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => save("awaiting")} disabled={busy}>
              Issue invoice
            </Button>
            <Button variant="outline" onClick={() => save("draft")} disabled={busy}>
              Save draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="label-caps">{label}</Label>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={emphasis ? "font-serif text-lg" : "text-muted-foreground"}>{label}</dt>
      <dd className={emphasis ? "money text-2xl" : "money"}>{value}</dd>
    </div>
  );
}
