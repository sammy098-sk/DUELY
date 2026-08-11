import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Business settings — Duely" },
      {
        name: "description",
        content:
          "Set the business name, contact details and bank details that appear on your Duely invoices.",
      },
      { property: "og:title", content: "Business settings — Duely" },
      {
        property: "og:description",
        content: "Your business identity and payment details for every invoice.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Settings />
    </AppShell>
  ),
});

const empty = {
  business_name: "",
  contact_email: "",
  phone: "",
  address: "",
  bank_details: "",
  default_currency: "USD",
  reminders_enabled: true,
};

function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setForm({ ...empty, ...data });
      });
  }, [user]);

  async function save() {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...form });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Settings saved.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          These details print on every invoice and sign every reminder.
        </p>
      </div>

      <div className="ledger-panel grid gap-4 p-6 sm:grid-cols-2">
        <Field label="Business name">
          <Input
            value={form.business_name}
            onChange={(e) => setForm({ ...form, business_name: e.target.value })}
          />
        </Field>
        <Field label="Contact email">
          <Input
            type="email"
            value={form.contact_email}
            onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
          />
        </Field>
        <Field label="WhatsApp sender number">
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+2348012345678"
          />
        </Field>
        <Field label="Default currency">
          <Input
            value={form.default_currency}
            onChange={(e) => setForm({ ...form, default_currency: e.target.value.toUpperCase() })}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Business address">
            <Textarea
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Bank / payment details">
            <Textarea
              rows={3}
              value={form.bank_details}
              onChange={(e) => setForm({ ...form, bank_details: e.target.value })}
              placeholder="Bank name, account name, account number, IBAN…"
            />
          </Field>
        </div>
        <div className="flex items-center justify-between gap-4 sm:col-span-2">
          <div>
            <p className="label-caps">Automatic chasing</p>
            <p className="text-sm text-muted-foreground">
              Duely reminds unpaid clients every 3 days, escalating in tone.
            </p>
          </div>
          <Switch
            checked={form.reminders_enabled}
            onCheckedChange={(v) => setForm({ ...form, reminders_enabled: v })}
          />
        </div>
        <div className="sm:col-span-2">
          <Button onClick={save} disabled={busy}>
            Save settings
          </Button>
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
