import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Loader2, FileText } from "lucide-react";

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
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">

      {/* Almost invisible background grid */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.015]"
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

      {/* Subtle top bar accent */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-[2px] bg-foreground/5" />

      {/* ── DESKTOP LAYOUT (lg+): Cardless centered SaaS form ── */}
      <div className="relative z-10 hidden w-full max-w-[420px] lg:flex lg:flex-col">
        <div className="mb-10 text-center">
          <span className="inline-block font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Duely
          </span>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-[26px] font-bold leading-snug tracking-[-0.03em] text-foreground">
            {mode === "signin" ? "Welcome back." : "Create your account"}
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
            {mode === "signin"
              ? "Sign in to keep your invoices moving."
              : "Start chasing invoices automatically."}
          </p>
        </div>

        <DesktopTabs mode={mode} onSwitch={switchMode} />

        <AuthForm
          mode={mode}
          email={email} setEmail={setEmail}
          password={password} setPassword={setPassword}
          fullName={fullName} setFullName={setFullName}
          showPassword={showPassword} setShowPassword={setShowPassword}
          busy={busy} errors={errors}
          onSubmit={submit}
          onGoogle={google}
          onSwitchMode={switchMode}
        />
      </div>

      {/* ── MOBILE LAYOUT (<lg): Finora-inspired composition for Duely ── */}
      <div className="relative z-10 flex w-full flex-col items-center my-auto lg:hidden" style={{ maxWidth: "min(390px, 100%)" }}>

        {/* ── Main Mobile Auth Panel ── */}
        <div
          className="w-full rounded-[28px] border border-border/60 bg-card px-6 py-7 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] transition-all duration-200"
          style={{ boxShadow: "0 10px 36px -12px rgba(24, 32, 48, 0.08), 0 2px 6px -1px rgba(24, 32, 48, 0.03)" }}
        >
          {/* Top Brand Tag */}
          <div className="mb-4 text-center">
            <span className="inline-block font-sans text-[10.5px] font-bold uppercase tracking-[0.28em] text-muted-foreground/70">
              Duely
            </span>
          </div>

          {/* 1. Compact Top Visual Icon Badge (matches reference hierarchy) */}
          <div className="mb-5 flex justify-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-secondary/80 text-foreground ring-4 ring-muted/50">
              <FileText size={26} className="text-foreground/80 stroke-[1.75]" />
              <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background shadow-xs">
                +
              </div>
            </div>
          </div>

          {/* 2. Main Heading & Supporting Text */}
          <div className="mb-5 text-center">
            <h1 className="text-[21px] font-bold leading-tight tracking-[-0.03em] text-foreground">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground px-2">
              {mode === "signin"
                ? "Sign in to keep your invoices moving."
                : "Start chasing invoices automatically."}
            </p>
          </div>

          {/* 3. Compact Segmented Selector (Matches Reference Selector) */}
          <div className="mb-5 flex rounded-[10px] bg-muted/80 p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 rounded-[7px] py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-150 ${
                  mode === m
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground/70"
                }`}
              >
                {m === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* 4. Form Fields & Primary CTA */}
          <form onSubmit={submit} className="space-y-3.5" noValidate>
            {mode === "signup" && (
              <div className="space-y-1">
                <label htmlFor="mob-fullName" className="block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Full Name
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
              <label htmlFor="mob-email" className="block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Email
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
              <label htmlFor="mob-password" className="block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Password
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
              className="mt-2 flex h-[48px] w-full items-center justify-center gap-2 rounded-[10px] bg-foreground text-[12.5px] font-bold uppercase tracking-widest text-background transition-all duration-150 hover:bg-foreground/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
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

          {/* 5. Divider */}
          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-border/50" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/80">or</span>
            <span className="h-px flex-1 bg-border/50" />
          </div>

          {/* 6. Google Social Authentication */}
          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="flex h-[46px] w-full items-center justify-center gap-2.5 rounded-[10px] border border-border/70 bg-background text-[12.5px] font-semibold text-foreground transition-all duration-150 hover:bg-muted active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* 7. Bottom Account Switcher Link */}
          <p className="mt-5 text-center text-[12px] text-muted-foreground">
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

        {/* Small Footer */}
        <p className="mt-4 text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground/40">
          © {new Date().getFullYear()} Duely
        </p>
      </div>
    </div>
  );
}

/* ── Desktop Shared Sub-Components ──────────────────────────── */

function DesktopTabs({ mode, onSwitch }: { mode: "signin" | "signup"; onSwitch: (m: "signin" | "signup") => void }) {
  return (
    <div className="mb-8 flex items-end justify-center gap-8 border-b border-border/50">
      {(["signin", "signup"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onSwitch(m)}
          className={`relative pb-3 text-[11.5px] font-bold uppercase tracking-widest transition-colors duration-150 ${
            mode === m ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
          }`}
        >
          {m === "signin" ? "Sign In" : "Create Account"}
          {mode === m && (
            <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-full bg-foreground" />
          )}
        </button>
      ))}
    </div>
  );
}

interface AuthFormProps {
  mode: "signin" | "signup";
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  fullName: string; setFullName: (v: string) => void;
  showPassword: boolean; setShowPassword: (v: boolean) => void;
  busy: boolean;
  errors: { [key: string]: string };
  onSubmit: (e: React.FormEvent) => void;
  onGoogle: () => void;
  onSwitchMode: (m: "signin" | "signup") => void;
}

function AuthForm({ mode, email, setEmail, password, setPassword, fullName, setFullName, showPassword, setShowPassword, busy, errors, onSubmit, onGoogle, onSwitchMode }: AuthFormProps) {
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {mode === "signup" && (
          <Field id="fullName" label="Full Name" type="text" value={fullName} onChange={setFullName}
            placeholder="Jane Doe" autoComplete="name" error={errors.fullName} />
        )}
        <Field id="email" label="Email Address" type="email" value={email} onChange={setEmail}
          placeholder="you@example.com" autoComplete="email" error={errors.email} />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="desk-password" className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Password</label>
            {mode === "signin" && (
              <button type="button" onClick={() => toast.info("Password reset coming soon.")}
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors outline-none">
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
              placeholder="Enter your password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className={desktopInputClass(!!errors.password)}
              style={{ paddingRight: "3rem" }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors outline-none">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-[11px] font-medium text-destructive">{errors.password}</p>}
        </div>

        <button type="submit" disabled={busy}
          className="mt-2 flex h-[50px] w-full items-center justify-center gap-2 rounded-[9px] bg-foreground text-[13px] font-bold uppercase tracking-widest text-background transition-all duration-150 hover:bg-foreground/90 active:scale-[0.984] disabled:pointer-events-none disabled:opacity-60">
          {busy ? <Loader2 size={17} className="animate-spin" /> : mode === "signin" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-border/60" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border/60" />
      </div>

      <button type="button" onClick={onGoogle} disabled={busy}
        className="flex h-[48px] w-full items-center justify-center gap-2.5 rounded-[9px] border border-border/70 bg-background text-[13px] font-semibold text-foreground transition-all duration-150 hover:bg-muted active:scale-[0.984] disabled:pointer-events-none disabled:opacity-60">
        <GoogleIcon />
        Continue with Google
      </button>

      <p className="mt-8 text-center text-[12.5px] text-muted-foreground">
        {mode === "signup" ? (
          <>Already have an account?{" "}<button type="button" onClick={() => onSwitchMode("signin")} className="font-semibold text-foreground hover:underline underline-offset-2 outline-none">Sign in</button></>
        ) : (
          <>Don't have an account?{" "}<button type="button" onClick={() => onSwitchMode("signup")} className="font-semibold text-foreground hover:underline underline-offset-2 outline-none">Create one</button></>
        )}
      </p>

      <p className="mt-12 text-center text-[10.5px] font-medium uppercase tracking-widest text-muted-foreground opacity-50">
        © {new Date().getFullYear()} Duely
      </p>
    </>
  );
}

/* ── Helper Functions & Components ───────────────────────────── */

function desktopInputClass(hasError: boolean) {
  return [
    "h-[50px] w-full rounded-[9px] border px-4 font-sans text-[13.5px] transition-all duration-150 outline-none placeholder:text-muted-foreground/50 bg-background",
    hasError
      ? "border-destructive/70 focus:border-destructive focus:ring-2 focus:ring-destructive/20"
      : "border-border/70 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10",
  ].join(" ");
}

function mobileInputClass(hasError: boolean) {
  return [
    "h-[48px] w-full rounded-[10px] border px-3.5 font-sans text-[13.5px] transition-all duration-150 outline-none placeholder:text-muted-foreground/40 bg-background",
    hasError
      ? "border-destructive/70 focus:border-destructive focus:ring-2 focus:ring-destructive/20"
      : "border-border/65 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10",
  ].join(" ");
}

interface FieldProps {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  autoComplete?: string; error?: string;
}

function Field({ id, label, type, value, onChange, placeholder, autoComplete, error }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</label>
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} autoComplete={autoComplete} className={desktopInputClass(!!error)} />
      {error && <p className="text-[11px] font-medium text-destructive">{error}</p>}
    </div>
  );
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
