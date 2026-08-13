import { useEffect, useState, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  User,
  Building2,
  Mail,
  LogOut,
  Settings as SettingsIcon,
  Upload,
  FileSignature,
  Loader2,
  Save,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { uploadBrandingImage, type ExtendedProfile } from "@/lib/branding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ExtendedProfile>({ id: "" });
  const [businessName, setBusinessName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");
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
          setProfile(ext);
          setBusinessName(ext.business_name || ext.company_name || "");
          setLogoUrl(ext.company_logo_url || "");
          setSignatureUrl(ext.signature_url || "");
        }
      });
  }, [user]);

  async function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0] || !user) return;
    setUploadingLogo(true);
    try {
      const url = await uploadBrandingImage(user.id, e.target.files[0], "logo");
      setLogoUrl(url);
      toast.success("Company logo uploaded successfully!");
    } catch {
      toast.error("Failed to upload logo.");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSignatureChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0] || !user) return;
    setUploadingSig(true);
    try {
      const url = await uploadBrandingImage(user.id, e.target.files[0], "signature");
      setSignatureUrl(url);
      toast.success("Signature uploaded successfully!");
    } catch {
      toast.error("Failed to upload signature.");
    } finally {
      setUploadingSig(false);
    }
  }

  async function saveProfile() {
    if (!user) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        business_name: businessName,
        company_logo_url: logoUrl,
        signature_url: signatureUrl,
        updated_at: new Date().toISOString(),
      } as any);

      if (error) throw error;
      toast.success("Profile & branding saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile.");
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
    businessName ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <AppShell pageTitle="Profile">
      <div className="flex-1 p-4 lg:p-8 bg-background">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                Workspace Profile
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Manage your personal details, company branding, and signature.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                <Link to="/settings">
                  <SettingsIcon className="size-3.5" />
                  Settings
                </Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-xs font-semibold"
              >
                <LogOut className="size-3.5" />
                Log out
              </Button>
            </div>
          </div>

          {/* Card 1: Personal Information */}
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
                <p className="font-semibold text-sm text-foreground py-1">{fullName}</p>
              </div>
              <div className="space-y-1">
                <Label className="label-caps">Email Address</Label>
                <div className="flex items-center gap-2 py-1 text-muted-foreground">
                  <Mail className="size-3.5 text-muted-foreground" />
                  <span className="font-medium text-foreground">{user?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Business & Branding Information */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-paper space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Building2 className="size-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Company & Invoice Branding
              </h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="label-caps">Company / Business Name</Label>
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Duely Studio"
                  className="h-10 text-xs font-semibold"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2 pt-2">
                {/* Company Logo Upload & Preview */}
                <div className="space-y-2">
                  <Label className="label-caps">Company Logo</Label>
                  <div className="rounded-xl border border-border bg-background p-4 flex flex-col items-center justify-center text-center space-y-3">
                    {logoUrl ? (
                      <div className="relative group">
                        <img
                          src={logoUrl}
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
                      <span>{logoUrl ? "Change Logo" : "Upload Logo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Signature Upload & Preview */}
                <div className="space-y-2">
                  <Label className="label-caps">Authorized Signature</Label>
                  <div className="rounded-xl border border-border bg-background p-4 flex flex-col items-center justify-center text-center space-y-3">
                    {signatureUrl ? (
                      <div className="relative group">
                        <img
                          src={signatureUrl}
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
                      <span>{signatureUrl ? "Change Signature" : "Upload Signature"}</span>
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

            <div className="pt-3 border-t border-border/60 flex justify-end">
              <Button onClick={saveProfile} disabled={busy} size="sm" className="gap-2 font-bold text-xs">
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                <span>Save Profile Changes</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
