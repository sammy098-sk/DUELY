import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Loader2, FileText, CheckCircle2, ShieldCheck } from "lucide-react";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryMode = searchParams.get("mode");
  const [mode, setMode] = useState<"signin" | "signup">(
    queryMode === "signin" ? "signin" : "signup"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (queryMode === "signin" || queryMode === "signup") {
      setMode(queryMode);
    }
  }, [queryMode]);

  // If a user is already authenticated and visits /auth, send them to their authenticated workspace (/welcome)
  useEffect(() => {
    if (!loading && user) {
      navigate("/welcome", { replace: true });
    }
  }, [loading, user, navigate]);

  function switchMode(m: "signin" | "signup") {
    setMode(m);
    setErrors({});
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
  }

  function validate() {
    const newErrors: { [key: string]: string } = {};
    if (!email || !email.includes("@")) newErrors.email = "Enter a valid email address.";
    if (!password || password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    if (mode === "signup") {
      if (!fullName.trim()) newErrors.fullName = "Please enter your full name.";
      if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
      if (!agreeTerms) newErrors.terms = "You must agree to the Terms & Conditions.";
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
            emailRedirectTo: `${window.location.origin}/welcome`,
            data: { full_name: fullName, business_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created — welcome to Duely.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in successfully.");
      }
      navigate("/welcome", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/welcome` },
    });
    if (error) toast.error("Google sign-in failed. Try email instead.");
  }

  return (
    <div className="relative min-h-screen bg-[#f3f4f6] dark:bg-[#0E1217] flex flex-col items-center justify-center overflow-x-hidden p-4 sm:p-6 lg:p-10 transition-colors">
      {/* Decorative concentric rings in background corners */}
      <div className="pointer-events-none absolute -right-16 -top-16 opacity-30 text-border">
        <ConcentricRings />
      </div>
      <div className="pointer-events-none absolute -left-16 -bottom-16 opacity-30 text-border">
        <ConcentricRings />
      </div>

      {/* ── DESKTOP LAYOUT (lg+) ── */}
      <div className="relative z-10 hidden w-full max-w-[1060px] lg:block">
        <div className="grid w-full grid-cols-12 rounded-[28px] border border-border/60 bg-card p-3.5 shadow-[0_16px_50px_-12px_rgba(0,0,0,0.08)]">
          {/* LEFT PANEL */}
          <div className="col-span-5 flex flex-col justify-between rounded-[22px] bg-foreground p-8 text-background relative overflow-hidden min-h-[580px]">
            <div className="pointer-events-none absolute -left-12 -top-12 opacity-15 text-background">
              <ConcentricRings />
            </div>
            <div className="pointer-events-none absolute -right-12 -bottom-12 opacity-15 text-background">
              <ConcentricRings />
            </div>

            {/* Top Brand Header */}
            <div className="relative z-10">
              <span className="inline-block font-sans text-[11px] font-bold uppercase tracking-[0.28em] text-background/70">
                DUELY
              </span>
              <p className="mt-0.5 text-[12px] font-medium text-background/80">
                Invoice chasing, without the chasing.
              </p>
            </div>

            {/* Center Product Illustration */}
            <div className="relative z-10 my-auto py-6 flex flex-col items-center justify-center">
              <div className="relative flex flex-col items-center justify-center w-[220px] h-[250px] rounded-t-full bg-background/10 border border-background/10 p-4">
                <div className="absolute top-6 -left-4 rounded-full bg-background text-foreground px-2.5 py-1 text-[10px] font-bold shadow-md flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Reminder Sent
                </div>

                <div className="absolute top-16 -right-5 rounded-full bg-background text-foreground px-2.5 py-1 text-[10px] font-bold shadow-md flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  Paid
                </div>

                <div className="w-[190px] rounded-xl bg-background text-foreground p-4 shadow-xl border border-border/40 rotate-[-1deg]">
                  <div className="flex items-center justify-between border-b border-rule pb-2.5 mb-2.5">
                    <span className="font-mono text-[10px] font-bold text-muted-foreground">#0048</span>
                    <span className="font-mono text-[10px] text-muted-foreground">DUE AUG 18</span>
                  </div>
                  <p className="font-serif font-bold text-[13px] text-foreground">Acme Studio</p>
                  <p className="font-mono text-[17px] font-bold text-foreground mt-1">₦420,000</p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Status</span>
                    <span className="rounded-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                      Automated
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Product Quote */}
            <div className="relative z-10">
              <p className="text-[12.5px] leading-relaxed text-background/85">
                "Duely follows up on unpaid invoices automatically so freelancers get paid on time without awkward emails."
              </p>
              <div className="mt-3.5 flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background/20 text-background">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-background">Duely Workspace</p>
                  <p className="text-[10px] text-background/60">Automated Invoice Chasing</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Authentication Form */}
          <div className="col-span-7 flex flex-col justify-center px-8 py-6 xl:px-12 xl:py-8">
            <div className="mx-auto w-full max-w-[440px]">
              <div className="mb-5">
                <h1 className="text-[26px] font-bold leading-tight tracking-[-0.03em] text-foreground">
                  {mode === "signin" ? "Welcome Back" : "Create Your Account"}
                </h1>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {mode === "signin"
                    ? "Sign in to keep your invoices moving."
                    : "Start chasing invoices automatically."}
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="mb-5 flex border-b border-border/50">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className={`relative pb-2.5 pr-6 text-[11.5px] font-bold uppercase tracking-widest transition-colors duration-150 ${
                      mode === m ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
                    }`}
                  >
                    {m === "signup" ? "CREATE ACCOUNT" : "SIGN IN"}
                    {mode === m && (
                      <span className="absolute bottom-[-1px] left-0 right-6 h-[2.5px] rounded-full bg-foreground" />
                    )}
                  </button>
                ))}
              </div>

              {/* Social Login */}
              <button
                type="button"
                onClick={google}
                disabled={busy}
                className="flex h-[48px] w-full items-center justify-center gap-2.5 rounded-[10px] border border-border/80 bg-background text-[13px] font-semibold text-foreground transition-all duration-150 hover:bg-muted active:scale-[0.985] disabled:pointer-events-none disabled:opacity-60 shadow-2xs cursor-pointer"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="my-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-border/60" />
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Or</span>
                <span className="h-px flex-1 bg-border/60" />
              </div>

              <form onSubmit={submit} className="space-y-3.5" noValidate>
                {mode === "signup" && (
                  <div className="space-y-1">
                    <label htmlFor="desk-fullName" className="block text-[11px] font-semibold text-muted-foreground">
                      Full Name
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

                <div className="space-y-1">
                  <label htmlFor="desk-email" className="block text-[11px] font-semibold text-muted-foreground">
                    Email address
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

                {mode === "signup" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="desk-password" className="block text-[11px] font-semibold text-muted-foreground">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="desk-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          autoComplete="new-password"
                          className={desktopInputClass(!!errors.password)}
                          style={{ paddingRight: "2.25rem" }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors outline-none cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {errors.password && <p className="text-[10px] font-medium text-destructive mt-0.5">{errors.password}</p>}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="desk-confirmPassword" className="block text-[11px] font-semibold text-muted-foreground">
                        Confirm Password
                      </label>
                      <input
                        id="desk-confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        autoComplete="new-password"
                        className={desktopInputClass(!!errors.confirmPassword)}
                      />
                      {errors.confirmPassword && <p className="text-[10px] font-medium text-destructive mt-0.5">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="desk-password-single" className="text-[11px] font-semibold text-muted-foreground">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => toast.info("Password reset coming soon.")}
                        className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors outline-none cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="desk-password-single"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className={desktopInputClass(!!errors.password)}
                        style={{ paddingRight: "3rem" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors outline-none cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-[10.5px] font-medium text-destructive mt-0.5">{errors.password}</p>}
                  </div>
                )}

                {mode === "signup" && (
                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="h-4 w-4 rounded-xs border-border text-foreground focus:ring-foreground"
                      />
                      <span className="text-[11.5px] text-muted-foreground">
                        I agree to the <span className="underline font-medium text-foreground">Terms & Conditions</span>
                      </span>
                    </label>
                    {errors.terms && <p className="text-[10.5px] font-medium text-destructive mt-0.5">{errors.terms}</p>}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="mt-2 flex h-[50px] w-full items-center justify-center gap-2 rounded-[10px] bg-foreground text-[13px] font-bold text-background transition-all duration-150 hover:bg-foreground/90 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-60 shadow-xs cursor-pointer"
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

              <p className="mt-5 text-center text-[12.5px] text-muted-foreground">
                {mode === "signup" ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("signin")}
                      className="font-semibold text-foreground hover:underline underline-offset-2 outline-none cursor-pointer"
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
                      className="font-semibold text-foreground hover:underline underline-offset-2 outline-none cursor-pointer"
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

      {/* ── MOBILE LAYOUT (<lg) ── */}
      <div className="relative z-10 flex w-full flex-col items-center my-auto lg:hidden" style={{ maxWidth: "min(380px, 100%)" }}>
        <div
          className="w-full rounded-[24px] border border-border/50 bg-card px-4.5 py-4.5 sm:px-5 sm:py-5 shadow-[0_4px_24px_-4px_rgba(20,28,45,0.06)] transition-all duration-200"
          style={{ boxShadow: "0 6px 28px -8px rgba(20, 28, 45, 0.07), 0 2px 4px -1px rgba(20, 28, 45, 0.02)" }}
        >
          <div className="mb-2 text-center">
            <span className="inline-block font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/80">
              DUELY
            </span>
          </div>

          <div className="mb-2.5 flex justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/70 text-foreground ring-3 ring-muted/40">
              <FileText size={20} className="text-foreground/80 stroke-[1.75]" />
            </div>
          </div>

          <div className="mb-3 text-center">
            <h1 className="text-[18px] font-bold leading-tight tracking-[-0.025em] text-foreground">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground px-1">
              {mode === "signin"
                ? "Sign in to keep your invoices moving."
                : "Start chasing invoices automatically."}
            </p>
          </div>

          <div className="mb-3 flex h-[38px] rounded-[8px] bg-muted/70 p-0.5">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 rounded-[6px] text-[10.5px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  mode === m
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground/70"
                }`}
              >
                {m === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-2.5" noValidate>
            {mode === "signup" && (
              <div className="space-y-0.5">
                <label htmlFor="mob-fullName" className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
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
                {errors.fullName && <p className="text-[10px] font-medium text-destructive mt-0.5">{errors.fullName}</p>}
              </div>
            )}

            <div className="space-y-0.5">
              <label htmlFor="mob-email" className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
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
              {errors.email && <p className="text-[10px] font-medium text-destructive mt-0.5">{errors.email}</p>}
            </div>

            <div className="space-y-0.5">
              <label htmlFor="mob-password" className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
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
                  style={{ paddingRight: "2.5rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] font-medium text-destructive mt-0.5">{errors.password}</p>}
              
              {mode === "signin" && (
                <div className="pt-0.5 text-right">
                  <button
                    type="button"
                    onClick={() => toast.info("Password reset coming soon.")}
                    className="text-[10.5px] font-medium text-muted-foreground transition-colors hover:text-foreground outline-none cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-1 flex h-[44px] w-full items-center justify-center gap-2 rounded-[8px] bg-foreground text-[11.5px] font-bold uppercase tracking-widest text-background transition-all duration-150 hover:bg-foreground/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 cursor-pointer"
            >
              {busy ? (
                <Loader2 size={15} className="animate-spin" />
              ) : mode === "signin" ? (
                "SIGN IN"
              ) : (
                "CREATE ACCOUNT"
              )}
            </button>
          </form>

          <div className="my-2.5 flex items-center gap-2.5">
            <span className="h-px flex-1 bg-border/50" />
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">OR</span>
            <span className="h-px flex-1 bg-border/50" />
          </div>

          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[8px] border border-border/70 bg-background text-[12px] font-semibold text-foreground transition-all duration-150 hover:bg-muted active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 cursor-pointer"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="mt-3 text-center text-[11.5px] text-muted-foreground">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="font-semibold text-foreground hover:underline underline-offset-2 outline-none cursor-pointer"
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
                  className="font-semibold text-foreground hover:underline underline-offset-2 outline-none cursor-pointer"
                >
                  Create account
                </button>
              </>
            )}
          </p>
        </div>

        <p className="mt-3 text-center text-[9.5px] font-medium uppercase tracking-widest text-muted-foreground/40">
          © {new Date().getFullYear()} Duely
        </p>
      </div>
    </div>
  );
}

function ConcentricRings() {
  return (
    <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="120" cy="120" r="110" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="120" cy="120" r="90" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="120" cy="120" r="70" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="120" cy="120" r="50" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="120" cy="120" r="30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="120" cy="120" r="10" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function desktopInputClass(hasError: boolean) {
  return [
    "h-[48px] w-full rounded-[9px] border px-3.5 font-sans text-[13.5px] transition-all duration-150 outline-none placeholder:text-muted-foreground/40 bg-background text-foreground",
    hasError
      ? "border-destructive/70 focus:border-destructive focus:ring-2 focus:ring-destructive/20"
      : "border-border/70 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10",
  ].join(" ");
}

function mobileInputClass(hasError: boolean) {
  return [
    "h-[42px] w-full rounded-[8px] border px-3 font-sans text-[13px] transition-all duration-150 outline-none placeholder:text-muted-foreground/40 bg-background text-foreground",
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
