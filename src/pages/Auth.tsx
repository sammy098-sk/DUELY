import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!loading && user) navigate("/");
  }, [loading, user, navigate]);

  function switchMode(m: "signin" | "signup") {
    setMode(m);
    setErrors({});
  }

  function validate() {
    const newErrors: { [key: string]: string } = {};
    if (!email || !email.includes("@")) newErrors.email = "Please enter a valid email address.";
    if (!password || password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    if (mode === "signup") {
      if (!fullName.trim()) newErrors.fullName = "Please enter your full name.";
      if (password && confirmPassword && password !== confirmPassword)
        newErrors.confirmPassword = "Passwords do not match.";
    }
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
    if (error) {
      toast.error("Google sign-in failed. Try email instead.");
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-5 py-14">
      {/* Faint ledger grid — entire viewport background */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.025]"
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

      {/* Subtle horizontal rule accent — top of page */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-[3px] bg-foreground/5" />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* ─── Brand ─── */}
        <div className="mb-10 text-center">
          <span className="inline-block font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Duely
          </span>
        </div>

        {/* ─── Auth heading ─── */}
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

        {/* ─── Tab switcher ─── */}
        <div className="mb-8 flex items-end justify-center gap-8 border-b border-border/50 pb-0">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`pb-3 text-[11.5px] font-bold uppercase tracking-widest transition-colors duration-150 relative ${
                mode === m
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/70"
              }`}
            >
              {m === "signin" ? "Sign In" : "Create Account"}
              {mode === m && (
                <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-full bg-foreground" />
              )}
            </button>
          ))}
        </div>

        {/* ─── Form ─── */}
        <form onSubmit={submit} className="space-y-4" noValidate>
          {mode === "signup" && (
            <Field
              id="fullName"
              label="Full Name"
              type="text"
              value={fullName}
              onChange={setFullName}
              placeholder="Jane Doe"
              error={errors.fullName}
            />
          )}

          <Field
            id="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
              >
                Password
              </label>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => toast.info("Password reset coming soon.")}
                  className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:underline outline-none"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                className={inputClass(!!errors.password)}
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
            {errors.password && <FieldError>{errors.password}</FieldError>}
          </div>

          {mode === "signup" && (
            <Field
              id="confirmPassword"
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm your password"
              autoComplete="new-password"
              error={errors.confirmPassword}
            />
          )}

          {/* ─── Primary CTA ─── */}
          <button
            type="submit"
            disabled={busy}
            className="mt-2 flex h-[50px] w-full items-center justify-center gap-2 rounded-[9px] bg-foreground text-[13px] font-bold uppercase tracking-widest text-background transition-all duration-150 hover:bg-foreground/90 active:scale-[0.984] disabled:pointer-events-none disabled:opacity-60"
          >
            {busy ? (
              <Loader2 size={17} className="animate-spin" />
            ) : mode === "signin" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* ─── Divider ─── */}
        <div className="my-7 flex items-center gap-4">
          <span className="h-px flex-1 bg-border/60" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            or
          </span>
          <span className="h-px flex-1 bg-border/60" />
        </div>

        {/* ─── Google ─── */}
        <button
          type="button"
          onClick={google}
          disabled={busy}
          className="flex h-[48px] w-full items-center justify-center gap-2.5 rounded-[9px] border border-border/70 bg-background text-[13px] font-semibold text-foreground transition-all duration-150 hover:bg-muted active:scale-[0.984] disabled:pointer-events-none disabled:opacity-60"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* ─── Mode switch link ─── */}
        <p className="mt-8 text-center text-[12.5px] text-muted-foreground">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="font-semibold text-foreground hover:underline underline-offset-2 transition-all outline-none focus-visible:underline"
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
                className="font-semibold text-foreground hover:underline underline-offset-2 transition-all outline-none focus-visible:underline"
              >
                Create one
              </button>
            </>
          )}
        </p>

        {/* ─── Footer ─── */}
        <p className="mt-12 text-center text-[10.5px] font-medium uppercase tracking-widest text-muted-foreground opacity-50">
          © {new Date().getFullYear()} Duely
        </p>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function inputClass(hasError: boolean) {
  return [
    "h-[50px] w-full rounded-[9px] border px-4 font-sans text-[13.5px] transition-all duration-150 outline-none placeholder:text-muted-foreground/50 bg-background",
    hasError
      ? "border-destructive/70 focus:border-destructive focus:ring-2 focus:ring-destructive/20"
      : "border-border/70 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10",
  ].join(" ");
}

interface FieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
}

function Field({ id, label, type, value, onChange, placeholder, autoComplete, error }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={inputClass(!!error)}
      />
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium text-destructive">{children}</p>
  );
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
