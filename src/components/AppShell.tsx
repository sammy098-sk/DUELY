import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import { LogOut, Menu, FilePlus2, LayoutList, Settings as SettingsIcon, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const nav = [
  { to: "/", label: "Ledger", icon: LayoutList },
  { to: "/invoices/new", label: "New invoice", icon: FilePlus2 },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("business_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setName(
          data?.business_name ||
            (user.user_metadata?.["business_name"] as string) ||
            user.email?.split("@")[0] ||
            "there",
        );
      });
  }, [user]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="label-caps">Opening the ledger…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="no-print sticky top-0 z-40 border-b border-border bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label="Open menu"
              className="inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="flex w-[19rem] flex-col gap-0 p-0">
              <div className="shrink-0 border-b border-border bg-muted/50 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <User className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold">{name || "Your profile"}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Link
                  to="/settings"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  View profile
                </Link>
              </div>

              <nav className="flex-1 overflow-y-auto p-3">
                <p className="label-caps px-3 pt-2 pb-1">Menu</p>
                {nav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      pathname === item.to
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="shrink-0 border-t border-border p-3">
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate("/auth");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <LogOut className="size-4" /> Sign out
                </button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="ml-auto text-right leading-tight">
            <p className="label-caps">{greeting()}</p>
            <p className="max-w-[14rem] truncate text-sm font-semibold sm:max-w-none">
              {name || "…"}
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
    </div>
  );
}
