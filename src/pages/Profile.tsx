import { useEffect, useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  User,
  Building2,
  Mail,
  LogOut,
  Upload,
  FileSignature,
  Loader2,
  Save,
  CreditCard,
  Phone,
  Coins,
  BellRing,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { uploadBrandingImage, type ExtendedProfile } from "@/lib/branding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// Minimalist Underline Input & Textarea Style Classes
const underlineInputClass =
  "w-full bg-transparent border-0 border-b border-border/80 rounded-none px-0 py-2 text-xs font-semibold text-foreground placeholder:text-muted-foreground/40 shadow-none outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors";

const underlineTextareaClass =
  "w-full bg-transparent border-0 border-b border-border/80 rounded-none px-0 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 shadow-none outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors resize-none";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    business_name: "",
    contact_email: "",
    phone: "",
    address: "",
    bank_details: "",
    default_currency: "NGN",
    reminders_enabled: true,
    company_logo_url: "",
    signature_url: "",
  });

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
        if (data) {
          const ext = data as unknown as ExtendedProfile;
          setForm({
            business_name: ext.business_name || ext.company_name || "",
            contact_email: ext.contact_email || user.email || "",
            phone: ext.phone || "",
            address: ext.address || "",
            bank_details: ext.bank_details || "",
            default_currency: ext.default_currency || "NGN",
            reminders_enabled: ext.reminders_enabled ?? true,
            company_logo_url: ext.company_logo_url || "",
            signature_url: ext.signature_url || "",
          });
        }
      });
  }, [user]);

  async function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0] || !user) return;
    setUploadingLogo(true);
    try {
      const url = await uploadBrandingImage(user.id, e.target.files[0], "logo");
      setForm((prev) => ({ ...prev, company_logo_url: url }));
      toast.success("Company logo uploaded.");
    } catch (err: any) {
      console.error("Failed to upload logo:", err);
      toast.error(`Failed to upload logo: ${err?.message || "Unknown error"}`);
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSignatureChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0] || !user) return;
    setUploadingSig(true);
    try {
      const url = await uploadBrandingImage(user.id, e.target.files[0], "signature");
      setForm((prev) => ({ ...prev, signature_url: url }));
      toast.success("Signature uploaded.");
    } catch (err: any) {
      console.error("Failed to upload signature:", err);
      toast.error(`Failed to upload signature: ${err?.message || "Unknown error"}`);
    } finally {
      setUploadingSig(false);
    }
  }

  async function saveProfile() {
    if (!user) return;
    setBusy(true);
    
    const payload = {
      id: user.id,
      business_name: form.business_name,
      contact_email: form.contact_email,
      phone: form.phone,
      address: form.address,
      bank_details: form.bank_details,
      default_currency: form.default_currency,
      reminders_enabled: form.reminders_enabled,
      company_logo_url: form.company_logo_url,
      signature_url: form.signature_url,
      updated_at: new Date().toISOString(),
    };

    console.log("Saving profile for authenticated user:", {
      authenticatedUserId: user.id,
      profileId: user.id,
      payload,
    });

    try {
      const { error } = await supabase.from("profiles").upsert(payload);

      if (error) {
        console.error("Failed to save profile settings:", {
          error,
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        toast.error(`Failed to save: ${error.message}`);
        return;
      }

      toast.success("Profile & Business Settings saved successfully.");
    } catch (err: any) {
      console.error("Unexpected error during profile save:", err);
      const msg = err?.message || (typeof err === "string" ? err : "Failed to save settings.");
      toast.error(`Failed to save: ${msg}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Signed out successfully.");
    navigate("/auth");
  }

  const fullName =
    (user?.user_metadata?.["full_name"] as string) ||
    form.business_name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <AppShell pageTitle="Profile & Settings">
      <div className="flex-1 p-4 lg:p-8 bg-background">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                Profile &amp; Settings
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Manage your personal information, invoice branding, and payment configurations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-xs font-bold cursor-pointer"
              >
                <LogOut className="size-3.5" />
                Log out
              </Button>
            </div>
          </div>

          {/* Section 1: Personal Information */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-paper space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <User className="size-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Personal Information
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="space-y-1">
                <Label className="label-caps">Full Name</Label>
                <p className="font-semibold text-sm text-foreground py-1 border-b border-border/40">
                  {fullName}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="label-caps">Email Address</Label>
                <div className="flex items-center gap-2 py-1 text-muted-foreground border-b border-border/40">
                  <Mail className="size-3.5 text-muted-foreground" />
                  <span className="font-medium text-foreground">{user?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Company & Invoice Branding */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-paper space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Building2 className="size-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Company &amp; Invoice Branding
              </h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="label-caps">Company / Business Name</Label>
                <Input
                  value={form.business_name}
                  onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                  placeholder="e.g. Duely Studio"
                  className={cn(underlineInputClass, "h-9 text-sm font-extrabold")}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2 pt-2">
                {/* Company Logo Dropzone */}
                <div className="space-y-2">
                  <Label className="label-caps">Company Logo</Label>
                  <div className="rounded-xl border border-border bg-background p-4 flex flex-col items-center justify-center text-center space-y-3">
                    {form.company_logo_url ? (
                      <div className="relative">
                        <img
                          src={form.company_logo_url}
                          alt="Company Logo"
                          className="h-16 w-auto object-contain max-w-full rounded"
                        />
                      </div>
                    ) : (
                      <div className="flex size-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        <Building2 className="size-6" />
                      </div>
                    )}

                    <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs">
                      {uploadingLogo ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Upload className="size-3.5" />
                      )}
                      <span>{form.company_logo_url ? "Change Logo" : "Upload Logo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Signature Dropzone */}
                <div className="space-y-2">
                  <Label className="label-caps">Authorized Signature</Label>
                  <div className="rounded-xl border border-border bg-background p-4 flex flex-col items-center justify-center text-center space-y-3">
                    {form.signature_url ? (
                      <div className="relative">
                        <img
                          src={form.signature_url}
                          alt="Signature Preview"
                          className="h-14 w-auto object-contain max-w-full rounded bg-card p-1 border border-border/50"
                        />
                      </div>
                    ) : (
                      <div className="flex size-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        <FileSignature className="size-6" />
                      </div>
                    )}

                    <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs">
                      {uploadingSig ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Upload className="size-3.5" />
                      )}
                      <span>{form.signature_url ? "Change Signature" : "Upload Signature"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSignatureChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Business & Payment Settings */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-paper space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <CreditCard className="size-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Business &amp; Payment Settings
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="label-caps">Contact Email for Invoices</Label>
                <Input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                  placeholder="billing@example.com"
                  className={underlineInputClass}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="label-caps">WhatsApp Sender Number</Label>
                <div className="relative">
                  <Phone className="size-3.5 text-muted-foreground absolute left-0 top-2.5" />
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+2348012345678"
                    className={cn(underlineInputClass, "pl-6")}
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label className="label-caps">Business Address</Label>
                <Textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street, City, Country"
                  className={underlineTextareaClass}
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label className="label-caps">Bank &amp; Payment Details</Label>
                <Textarea
                  rows={3}
                  value={form.bank_details}
                  onChange={(e) => setForm({ ...form, bank_details: e.target.value })}
                  placeholder="Bank name, account name, account number, IBAN…"
                  className={cn(underlineTextareaClass, "font-mono")}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="label-caps">Default Currency</Label>
                <div className="relative">
                  <Coins className="size-3.5 text-muted-foreground absolute left-0 top-2.5" />
                  <Input
                    value={form.default_currency}
                    onChange={(e) => setForm({ ...form, default_currency: e.target.value.toUpperCase() })}
                    placeholder="NGN, USD, EUR, GBP"
                    className={cn(underlineInputClass, "pl-6 font-mono uppercase")}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 sm:col-span-2 border-t border-border/60 pt-4 mt-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <BellRing className="size-4 text-primary" />
                    <p className="label-caps font-bold">Automatic Invoice Chasing</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Duely automatically reminds unpaid clients every 3 days.
                  </p>
                </div>
                <Switch
                  checked={form.reminders_enabled}
                  onCheckedChange={(v) => setForm({ ...form, reminders_enabled: v })}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border/60 flex justify-end">
              <Button onClick={saveProfile} disabled={busy} size="sm" className="gap-2 font-bold text-xs cursor-pointer">
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                <span>Save All Changes</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
