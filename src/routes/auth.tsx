import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to Duely" },
      {
        name: "description",
        content: "Sign in to Duely to send invoices and let them chase payment for you.",
      },
      { property: "og:title", content: "Sign in to Duely" },
      {
        property: "og:description",
        content: "Access your invoice ledger and automatic payment reminders.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [business, setBusiness] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [loading, user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { business_name: business },
          },
        });
        if (error) throw error;
        toast.success("Account created — welcome to Duely.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Try email instead.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
      <div className="w-full max-w-md">
        <div className="relative mb-8 text-center">
          {/* Layered asymmetric 3D shapes, veiled by a soft white layer */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-32 h-56">
            <div className="relative mx-auto h-full w-full max-w-sm [perspective:900px]">
              <div className="absolute left-[10%] top-8 size-32 rounded-[2.25rem] bg-primary [transform:rotateX(48deg)_rotateZ(38deg)]" />
              <div className="absolute left-[36%] top-0 size-40 rounded-full bg-accent" />
              <div className="absolute right-[6%] top-14 size-28 rounded-[1.75rem] border border-primary/40 bg-secondary [transform:rotateX(55deg)_rotateZ(-25deg)]" />
              <div className="absolute left-[24%] top-24 size-24 rounded-full bg-primary/70" />

              <div className="absolute -inset-6 bg-background/20 backdrop-blur-md" />
              <div className="absolute -inset-6 bg-gradient-to-b from-transparent via-background/25 to-background" />

            </div>
          </div>


          <h1 className="relative font-serif text-5xl">Duely</h1>
          <p className="relative mt-2 text-sm text-muted-foreground">
            Boring, deadly accurate invoice chasing for freelancers.
          </p>
        </div>


        <div className="ledger-panel p-6">
          <div className="mb-5 flex gap-4">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={
                  mode === m
                    ? "text-sm font-medium uppercase underline decoration-accent decoration-2 underline-offset-8"
                    : "text-sm font-medium text-muted-foreground uppercase"
                }
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label className="label-caps" htmlFor="business">
                  Business name
                </Label>
                <Input
                  id="business"
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  placeholder="Studio Ijie"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="label-caps" htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="label-caps" htmlFor="password">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="label-caps">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={google}>
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
