import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Loader2, FileText, ArrowRight, CheckCircle2, Clock } from "lucide-react";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!loading && user) navigate("/");
  }, [loading, user, navigate]);

  function switchMode(m: "signin" | "signup") {
    setMode(m);
    setErrors({});
    setEmail("");
    setPassword("");
    setFullName("");
  }

  function validate() {
    const newErrors: { [key: string]: string } = {};
    if (!email || !email.includes("@")) newErrors.email = "Enter a valid email address.";
    if (!password || password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    if (mode === "signup" && !fullName.trim()) newErrors.fullName = "Please enter your full name.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    setErrors({});
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, business_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created — welcome to Duely.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error("Google sign-in failed. Try email instead.");
  }

  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center overflow-x-hidden p-4 sm:p-6 lg:p-10">

      {/* Subtle page background grid */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.012]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="ledger-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.75" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ledger-grid)" />
      </svg>

      {/* Top accent line */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-[2px] bg-foreground/5" />

      {/* ── DESKTOP LAYOUT (lg+): Unified 2-Column Outer Container (Reference Structure) ── */}
      <div className="relative z-10 hidden w-full max-w-[1060px] lg:block">
        <div
          className="grid w-full grid-cols-12 rounded-[28px] border border-border/60 bg-card p-3 shadow-[0_12px_48px_-12px_rgba(20,28,45,0.08)]"
          style={{ boxShadow: "0 16px 56px -16px rgba(20, 28, 45, 0.09), 0 2px 8px -2px rgba(20, 28, 45, 0.03)" }}
        >
          {/* LEFT PANEL: Duely Product Story & Workflow Visualization (Col 6) */}
          <div className="col-span-6 flex flex-col justify-between rounded-[22px] bg-foreground p-8 xl:p-10 text-background relative overflow-hidden">
            {/* Subtle inner grid watermark */}
            <div 
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
                backgroundSize: "28px 28px"
              }}
            />

            {/* Top Brand & Descriptor */}
            <div className="relative z-10">
              <span className="inline-block font-sans text-[11px] font-bold uppercase tracking-[0.28em] text-background/60">
                DUELY
              </span>
              <p className="mt-1 text-[12px] font-medium text-background/80">
                Invoice chasing, without the chasing.
              </p>
            </div>

            {/* Center Visual Workflow (Invoice Chasing Flow) */}
            <div className="relative z-10 my-8 space-y-3">
              {/* Step 1: Invoice Created */}
              <div className="rounded-[12px] border border-background/10 bg-background/5 p-3.5 backdrop-blur-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-medium text-background/90">INVOICE #0048</span>
                  <span className="font-mono text-background/60">DUE AUG 18</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-serif text-[15px] font-semibold text-background">Acme Studio</span>
                  <span className="font-mono text-[14px] font-medium text-background">₦420,000</span>
                </div>
              </div>

              {/* Step Flow Indicator */}
              <div className="flex items-center justify-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-background/50 py-0.5">
                <Clock size={12} className="text-background/50" />
                <span>Automated Reminder Escalation</span>
                <ArrowRight size={12} className="text-background/50" />
              </div>

              {/* Step 2: Reminder Sent Notification */}
              <div className="rounded-[12px] border border-background/15 bg-background/10 p-3.5 backdrop-blur-xs">
                <div className="flex items-center justify-between text-[10.5px] font-semibold uppercase tracking-wider text-background/60">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    REMINDER SENT
                  </span>
                  <span className="font-mono text-[10px]">Email & WhatsApp</span>
                </div>
                <p className="mt-1.5 text-[11.5px] italic text-background/85 line-clamp-1">
                  "Friendly check-in regarding Invoice #0048 due soon..."
                </p>
              </div>

              {/* Step 3: Status Stamp Badge */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-[11px] font-medium text-background/80">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span>Payment Tracked</span>
                </div>
                {/* Rubber Stamp */}
                <div className="rotate-[-3deg] rounded-[5px] border-2 border-emerald-400/80 px-2.5 py-0.5 opacity-90">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    PAID
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Copy */}
            <div className="relative z-10">
              <h2 className="text-[20px] font-bold tracking-tight text-background">
                Stop chasing invoices.
              </h2>
              <p className="mt-1 text-[12.5px] leading-relaxed text-background/75 max-w-sm">
                Create invoices, automate payment reminders, and know exactly when your clients have been contacted.
              </p>
            </div>
          </div>

          {/* RIGHT PANEL: Authentication Form (Col 6) */}
          <div className="col-span-6 flex flex-col justify-center px-8 py-8 xl:px-12 xl:py-10">
            <div className="mx-auto w-full max-w-[400px]">
              
              {/* Form Heading & Subtitle */}
              <div className="mb-6">
                <h1 className="text-[24px] font-bold leading-tight tracking-[-0.03em] text-foreground">
                  {mode === "signin" ? "Welcome back" : "Create your account"}
                </h1>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  {mode === "signin"
                    ? "Sign in to keep your invoices moving."
                    : "Start chasing invoices automatically."}
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="mb-6 flex border-b border-border/50">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className={`relative pb-3 pr-6 text-[11.5px] font-bold uppercase tracking-widest transition-colors duration-150 ${
                      mode === m ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
                    }`}
                  >
                    {m === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
                    {mode === m && (
                      <span className="absolute bottom-[-1px] left-0 right-6 h-[2px] rounded-full bg-foreground" />
                    )}
                  </button>
                ))}
              </div>

              {/* Google Social Auth (Top position per reference) */}
              <button
                type="button"
                onClick={google}
                disabled={busy}
                className="flex h-[48px] w-full items-center justify-center gap-2.5 rounded-[9px] border border-border/70 bg-background text-[13px] font-semibold text-foreground transition-all duration-150 hover:bg-muted active:scale-[0.984] disabled:pointer-events-none disabled:opacity-60"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              {/* Divider */}
              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-border/60" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">OR</span>
                <span className="h-px flex-1 bg-border/60" />
              </div>

              {/* Form Fields */}
              <form onSubmit={submit} className="space-y-3.5" noValidate>
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <label htmlFor="desk-fullName" className="block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      FULL NAME
                    </label>
                    <input
                      id="desk-fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      autoComplete="name"
                      className={desktopInputClass(!!errors.fullName)}
                    />
                    {errors.fullName && <p className="text-[10.5px] font-medium text-destructive mt-0.5">{errors.fullName}</p>}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="desk-email" className="block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    EMAIL ADDRESS
                  </label>
                  <input
                    id="desk-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={desktopInputClass(!!errors.email)}
                  />
                  {errors.email && <p className="text-[10.5px] font-medium text-destructive mt-0.5">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="desk-password" className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      PASSWORD
                    </label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={() => toast.info("Password reset coming soon.")}
                        className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors outline-none"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="desk-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "signup" ? "Create a password" : "Enter your password"}
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      className={desktopInputClass(!!errors.password)}
                      style={{ paddingRight: "3rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors outline-none"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-[10.5px] font-medium text-destructive mt-0.5">{errors.password}</p>}
                </div>

                {/* Primary CTA Button */}
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-2 flex h-[50px] w-full items-center justify-center gap-2 rounded-[9px] bg-foreground text-[12.5px] font-bold uppercase tracking-widest text-background transition-all duration-150 hover:bg-foreground/90 active:scale-[0.984] disabled:pointer-events-none disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : mode === "signin" ? (
                    "SIGN IN"
                  ) : (
                    "CREATE ACCOUNT"
                  )}
                </button>
              </form>

              {/* Bottom Account Switcher Link */}
              <p className="mt-6 text-center text-[12.5px] text-muted-foreground">
                {mode === "signup" ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("signin")}
                      className="font-semibold text-foreground hover:underline underline-offset-2 outline-none"
                    >
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("signup")}
                      className="font-semibold text-foreground hover:underline underline-offset-2 outline-none"
                    >
                      Create account
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE LAYOUT (<lg): Preserved Purpose-Built Mobile Surface ── */}
      <div className="relative z-10 flex w-full flex-col items-center my-auto lg:hidden" style={{ maxWidth: "min(390px, 100%)" }}>
        
        {/* Mobile Authentication Surface Card */}
        <div
          className="w-full rounded-[28px] border border-border/50 bg-card px-5 py-6 sm:px-6 sm:py-7 shadow-[0_6px_28px_-6px_rgba(20,28,45,0.06)] transition-all duration-200"
          style={{ boxShadow: "0 8px 32px -10px rgba(20, 28, 45, 0.07), 0 2px 6px -1px rgba(20, 28, 45, 0.02)" }}
        >
          {/* 1. DUELY WORDMARK */}
          <div className="mb-3 text-center">
            <span className="inline-block font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground/80">
              DUELY
            </span>
          </div>

          {/* 2. TOP ILLUSTRATION */}
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/70 text-foreground ring-4 ring-muted/40">
              <FileText size={26} className="text-foreground/80 stroke-[1.75]" />
            </div>
          </div>

          {/* 3. HEADING & SUPPORTING TEXT */}
          <div className="mb-4 text-center">
            <h1 className="text-[20px] font-bold leading-tight tracking-[-0.03em] text-foreground">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground px-1">
              {mode === "signin"
                ? "Sign in to keep your invoices moving."
                : "Start chasing invoices automatically."}
            </p>
          </div>

          {/* 4. COMPACT SELECTOR TABS */}
          <div className="mb-4 flex h-[46px] rounded-[10px] bg-muted/70 p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 rounded-[7px] text-[11px] font-bold uppercase tracking-wider transition-all duration-150 ${
                  mode === m
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground/70"
                }`}
              >
                {m === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
              </button>
            ))}
          </div>

          {/* 5. FORM FIELDS & PRIMARY CTA */}
          <form onSubmit={submit} className="space-y-3" noValidate>
            {mode === "signup" && (
              <div className="space-y-1">
                <label htmlFor="mob-fullName" className="block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  FULL NAME
                </label>
                <input
                  id="mob-fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  className={mobileInputClass(!!errors.fullName)}
                />
                {errors.fullName && <p className="text-[10.5px] font-medium text-destructive mt-0.5">{errors.fullName}</p>}
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="mob-email" className="block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                EMAIL
              </label>
              <input
                id="mob-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className={mobileInputClass(!!errors.email)}
              />
              {errors.email && <p className="text-[10.5px] font-medium text-destructive mt-0.5">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="mob-password" className="block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  id="mob-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Create a password" : "Enter your password"}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  className={mobileInputClass(!!errors.password)}
                  style={{ paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors outline-none"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-[10.5px] font-medium text-destructive mt-0.5">{errors.password}</p>}
              
              {mode === "signin" && (
                <div className="pt-0.5 text-right">
                  <button
                    type="button"
                    onClick={() => toast.info("Password reset coming soon.")}
                    className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground outline-none"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            {/* Primary Action CTA */}
            <button
              type="submit"
              disabled={busy}
              className="mt-1.5 flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-foreground text-[12px] font-bold uppercase tracking-widest text-background transition-all duration-150 hover:bg-foreground/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
            >
              {busy ? (
                <Loader2 size={16} className="animate-spin" />
              ) : mode === "signin" ? (
                "SIGN IN"
              ) : (
                "CREATE ACCOUNT"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-3.5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border/50" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">OR</span>
            <span className="h-px flex-1 bg-border/50" />
          </div>

          {/* Google Social Auth */}
          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[10px] border border-border/70 bg-background text-[12.5px] font-semibold text-foreground transition-all duration-150 hover:bg-muted active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Bottom Account Switcher Link */}
          <p className="mt-4 text-center text-[12px] text-muted-foreground">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="font-semibold text-foreground hover:underline underline-offset-2 outline-none"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="font-semibold text-foreground hover:underline underline-offset-2 outline-none"
                >
                  Create account
                </button>
              </>
            )}
          </p>
        </div>

        {/* Footnote */}
        <p className="mt-4 text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground/40">
          © {new Date().getFullYear()} Duely
        </p>
      </div>
    </div>
  );
}

/* ── Helper Functions & Components ───────────────────────────── */

function desktopInputClass(hasError: boolean) {
  return [
    "h-[48px] w-full rounded-[9px] border px-4 font-sans text-[13.5px] transition-all duration-150 outline-none placeholder:text-muted-foreground/40 bg-background",
    hasError
      ? "border-destructive/70 focus:border-destructive focus:ring-2 focus:ring-destructive/20"
      : "border-border/70 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10",
  ].join(" ");
}

function mobileInputClass(hasError: boolean) {
  return [
    "h-[52px] w-full rounded-[10px] border px-3.5 font-sans text-[13.5px] transition-all duration-150 outline-none placeholder:text-muted-foreground/40 bg-background",
    hasError
      ? "border-destructive/70 focus:border-destructive focus:ring-2 focus:ring-destructive/20"
      : "border-border/65 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10",
  ].join(" ");
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
