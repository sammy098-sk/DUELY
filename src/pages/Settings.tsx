import { useEffect, useState, ChangeEvent } from "react";
import { toast } from "sonner";
import { Upload, Loader2, Building2, FileSignature } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { uploadBrandingImage } from "@/lib/branding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const empty = {
  business_name: "",
  contact_email: "",
  phone: "",
  address: "",
  bank_details: "",
  default_currency: "USD",
  reminders_enabled: true,
  company_logo_url: "",
  signature_url: "",
};

export default function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSig, setUploadingSig] = useState(false);

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

  async function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0] || !user) return;
    setUploadingLogo(true);
    try {
      const url = await uploadBrandingImage(user.id, e.target.files[0], "logo");
      setForm((prev) => ({ ...prev, company_logo_url: url }));
      toast.success("Company logo uploaded.");
    } catch {
      toast.error("Failed to upload logo.");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSignatureUpload(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0] || !user) return;
    setUploadingSig(true);
    try {
      const url = await uploadBrandingImage(user.id, e.target.files[0], "signature");
      setForm((prev) => ({ ...prev, signature_url: url }));
      toast.success("Signature uploaded.");
    } catch {
      toast.error("Failed to upload signature.");
    } finally {
      setUploadingSig(false);
    }
  }

  async function save() {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...form } as any);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Settings saved.");
  }

  return (
    <AppShell pageTitle="Settings">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            These business & branding details print on every invoice and sign every reminder.
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card grid gap-4 p-6 sm:grid-cols-2 shadow-paper">
          <Field label="Business / Company name">
            <Input
              value={form.business_name}
              onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              className="text-xs font-semibold"
            />
          </Field>
          <Field label="Contact email">
            <Input
              type="email"
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              className="text-xs"
            />
          </Field>
          <Field label="WhatsApp sender number">
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+2348012345678"
              className="text-xs"
            />
          </Field>
          <Field label="Default currency">
            <Input
              value={form.default_currency}
              onChange={(e) => setForm({ ...form, default_currency: e.target.value.toUpperCase() })}
              className="text-xs font-mono"
            />
          </Field>

          {/* Branding Image Uploads */}
          <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2 border-t border-b border-border/60 py-4 my-1">
            <div className="space-y-2">
              <Label className="label-caps">Company Logo</Label>
              <div className="flex items-center gap-3">
                <div className="size-14 rounded-lg border border-border bg-background flex items-center justify-center overflow-hidden shrink-0">
                  {form.company_logo_url ? (
                    <img src={form.company_logo_url} alt="Logo" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <Building2 className="size-5 text-muted-foreground" />
                  )}
                </div>
                <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs">
                  {uploadingLogo ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  <span>{form.company_logo_url ? "Change Logo" : "Upload Logo"}</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="label-caps">Authorized Signature</Label>
              <div className="flex items-center gap-3">
                <div className="size-14 rounded-lg border border-border bg-background flex items-center justify-center overflow-hidden shrink-0">
                  {form.signature_url ? (
                    <img src={form.signature_url} alt="Signature" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <FileSignature className="size-5 text-muted-foreground" />
                  )}
                </div>
                <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs">
                  {uploadingSig ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  <span>{form.signature_url ? "Change Signature" : "Upload Signature"}</span>
                  <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="sm:col-span-2">
            <Field label="Business address">
              <Textarea
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="text-xs"
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
                className="text-xs font-mono"
              />
            </Field>
          </div>
          <div className="flex items-center justify-between gap-4 sm:col-span-2 pt-2">
            <div>
              <p className="label-caps">Automatic chasing</p>
              <p className="text-xs text-muted-foreground">
                Duely reminds unpaid clients every 3 days, escalating in tone.
              </p>
            </div>
            <Switch
              checked={form.reminders_enabled}
              onCheckedChange={(v) => setForm({ ...form, reminders_enabled: v })}
            />
          </div>
          <div className="sm:col-span-2 pt-2">
            <Button onClick={save} disabled={busy} size="sm" className="font-bold text-xs">
              {busy ? <Loader2 className="size-4 animate-spin" /> : "Save settings"}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
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
