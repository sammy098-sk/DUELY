import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  
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

  function validate() {
    const newErrors: { [key: string]: string } = {};
    if (!email.includes("@")) newErrors.email = "Please enter a valid email address.";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    if (mode === "signup") {
      if (!fullName.trim()) newErrors.fullName = "Please enter your full name.";
      if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
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
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      toast.error("Google sign-in failed. Try email instead.");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-12 selection:bg-primary/20 selection:text-primary">
      {/* Extremely faint ledger background pattern spanning entire viewport */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: "linear-gradient(var(--color-rule) 1px, transparent 1px), linear-gradient(90deg, var(--color-rule) 1px, transparent 1px)", 
          backgroundSize: "24px 24px",
        }} 
      />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Brand Header */}
        <div className="mb-10 text-center">
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground uppercase">Duely</h1>
        </div>

        {/* Authentication Card Area */}
        <div className="rounded-xl border border-border/60 bg-background/50 p-6 sm:p-10 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)] backdrop-blur-sm">
          
          <div className="mb-8">
            <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground">Welcome back.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signin" 
                ? "Sign in to keep your invoices moving."
                : "Create your workspace and stop chasing invoices manually."}
            </p>
          </div>

          {/* Modern SaaS Tabs */}
          <div className="mb-8 flex gap-6 border-b border-rule/50">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setErrors({}); }}
                className={`relative pb-3 text-sm font-semibold transition-colors hover:text-foreground ${
                  mode === m ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {m === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
                {mode === m && (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-foreground" />
                )}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4" noValidate>
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className={`h-12 w-full rounded-lg border px-4 text-sm transition-all outline-none ${errors.fullName ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive" : "border-border/80 focus:border-primary focus:ring-1 focus:ring-primary"} bg-background/80`}
                />
                {errors.fullName && <p className="mt-1 text-[11px] font-medium tracking-wide uppercase text-destructive">{errors.fullName}</p>}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`h-12 w-full rounded-lg border px-4 text-sm transition-all outline-none ${errors.email ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive" : "border-border/80 focus:border-primary focus:ring-1 focus:ring-primary"} bg-background/80`}
              />
              {errors.email && <p className="mt-1 text-[11px] font-medium tracking-wide uppercase text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="password">Password</label>
                {mode === "signin" && (
                  <button 
                    type="button" 
                    onClick={() => toast.info("Password reset is not yet configured.")}
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
                  className={`h-12 w-full rounded-lg border pl-4 pr-12 text-sm transition-all outline-none ${errors.password ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive" : "border-border/80 focus:border-primary focus:ring-1 focus:ring-primary"} bg-background/80`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:text-primary outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[11px] font-medium tracking-wide uppercase text-destructive">{errors.password}</p>}
            </div>

            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className={`h-12 w-full rounded-lg border pl-4 pr-12 text-sm transition-all outline-none ${errors.confirmPassword ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive" : "border-border/80 focus:border-primary focus:ring-1 focus:ring-primary"} bg-background/80`}
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-[11px] font-medium tracking-wide uppercase text-destructive">{errors.confirmPassword}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-foreground text-sm font-semibold text-background transition-all hover:bg-foreground/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
            >
              {busy ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-background/30 border-t-background" />
              ) : mode === "signin" ? (
                "SIGN IN"
              ) : (
                "CREATE ACCOUNT"
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-rule/70" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">OR</span>
            <span className="h-px flex-1 bg-rule/70" />
          </div>

          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-border/80 bg-background text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
        
        {/* Subtle footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground opacity-60">
          © {new Date().getFullYear()} Duely Workspace
        </div>
      </div>
    </div>
  );
}
