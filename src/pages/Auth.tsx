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
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Left Area: Ledger Brand (Desktop Only) */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between border-r border-border p-12 xl:p-20 relative overflow-hidden bg-background">
        {/* Subtle ledger grid pattern */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{ 
            backgroundImage: "linear-gradient(var(--color-rule) 1px, transparent 1px), linear-gradient(90deg, var(--color-rule) 1px, transparent 1px)", 
            backgroundSize: "32px 32px",
            backgroundPosition: "-1px -1px"
          }} 
        />
        
        <div className="relative z-10">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground uppercase">Duely</h1>
          <p className="mt-4 max-w-sm text-base text-muted-foreground font-sans leading-relaxed">
            Invoice chasing, without the chasing.
          </p>
        </div>

        <div className="relative z-10 max-w-md w-full ledger-panel p-8 rotate-[-1deg] transform transition-transform hover:rotate-0 duration-500 ease-out origin-bottom-left">
          {/* Faux Invoice Visual */}
          <div className="flex justify-between items-start mb-10 border-b border-rule pb-6">
            <div>
              <p className="label-caps mb-1">Invoice</p>
              <p className="money text-lg text-foreground">#0048</p>
            </div>
            <div className="text-right">
              <p className="label-caps mb-1">Due Date</p>
              <p className="money text-sm text-muted-foreground">AUG 18, 2026</p>
            </div>
          </div>
          
          <div className="mb-10">
            <p className="label-caps mb-2">Client</p>
            <p className="font-serif text-xl text-foreground">Acme Studio</p>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="label-caps mb-2">Total</p>
              <p className="money text-3xl font-medium tracking-tight text-foreground">₦420,000</p>
            </div>
            {/* Rubber Stamp */}
            <div className="rotate-[12deg] rounded-sm border-[3px] border-[var(--color-stamp-awaiting)] px-3 py-1 opacity-85 mix-blend-multiply origin-center">
              <p className="font-sans font-bold tracking-widest text-[var(--color-stamp-awaiting)] text-sm uppercase">Awaiting</p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-xs text-muted-foreground label-caps">
          © {new Date().getFullYear()} Duely
        </div>
      </div>

      {/* Right Area: Authentication */}
      <div className="flex w-full lg:w-[55%] items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px] mx-auto">
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="mb-12 lg:hidden flex flex-col items-center text-center">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground uppercase">Duely</h1>
            {/* Tiny decorative stamp for mobile */}
            <div className="mt-3 rotate-[-6deg] rounded-sm border-2 border-[var(--color-stamp-draft)] px-2 py-0.5 opacity-60">
              <p className="font-sans font-bold tracking-widest text-[var(--color-stamp-draft)] text-[10px] uppercase">Ledger</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold text-foreground">Welcome back.</h2>
            <p className="mt-2 text-muted-foreground font-sans text-sm">
              {mode === "signin" 
                ? "Sign in to keep your invoices moving."
                : "Create your Duely workspace and stop chasing invoices manually."}
            </p>
          </div>

          {/* Ledger Tabs */}
          <div className="flex mb-8 border-b border-rule">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setErrors({}); }}
                className={`label-caps px-1 py-3 mr-6 relative transition-colors hover:text-foreground ${
                  mode === m ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {m === "signin" ? "Sign in" : "Create account"}
                {mode === m && (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-foreground" />
                )}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-5" noValidate>
            {mode === "signup" && (
              <div className="space-y-2">
                <label className="label-caps block" htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className={`w-full h-12 px-4 rounded-sm border ${errors.fullName ? "border-destructive focus:ring-destructive" : "border-border focus:ring-primary"} bg-background font-sans text-sm outline-none transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-background`}
                />
                {errors.fullName && <p className="text-destructive text-[11px] font-medium tracking-wide uppercase mt-1">{errors.fullName}</p>}
              </div>
            )}

            <div className="space-y-2">
              <label className="label-caps block" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full h-12 px-4 rounded-sm border ${errors.email ? "border-destructive focus:ring-destructive" : "border-border focus:ring-primary"} bg-background font-sans text-sm outline-none transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-background`}
              />
              {errors.email && <p className="text-destructive text-[11px] font-medium tracking-wide uppercase mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="label-caps" htmlFor="password">Password</label>
                {mode === "signin" && (
                  <button 
                    type="button" 
                    onClick={() => toast.info("Password reset is not yet configured.")}
                    className="label-caps text-[10px] hover:text-foreground transition-colors outline-none focus-visible:underline"
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
                  className={`w-full h-12 pl-4 pr-12 rounded-sm border ${errors.password ? "border-destructive focus:ring-destructive" : "border-border focus:ring-primary"} bg-background font-sans text-sm outline-none transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-background`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors outline-none rounded-sm focus-visible:text-primary"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-[11px] font-medium tracking-wide uppercase mt-1">{errors.password}</p>}
            </div>

            {mode === "signup" && (
              <div className="space-y-2">
                <label className="label-caps block" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className={`w-full h-12 pl-4 pr-12 rounded-sm border ${errors.confirmPassword ? "border-destructive focus:ring-destructive" : "border-border focus:ring-primary"} bg-background font-sans text-sm outline-none transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-background`}
                  />
                </div>
                {errors.confirmPassword && <p className="text-destructive text-[11px] font-medium tracking-wide uppercase mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full h-12 mt-6 bg-foreground text-background font-sans font-medium text-sm rounded-sm transition-all hover:bg-foreground/90 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center"
            >
              {busy ? (
                <span className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              ) : mode === "signin" ? (
                "SIGN IN"
              ) : (
                "CREATE ACCOUNT"
              )}
            </button>
          </form>

          <div className="my-8 flex items-center gap-3">
            <span className="h-px flex-1 bg-rule" />
            <span className="label-caps">OR</span>
            <span className="h-px flex-1 bg-rule" />
          </div>

          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="w-full h-12 border border-border bg-background text-foreground font-sans font-medium text-sm rounded-sm transition-all hover:bg-muted active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
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
      </div>
    </div>
  );
}
