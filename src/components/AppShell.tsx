import { Link, useNavigate, useLocation } from "react";
import { useState, useEffect, type ReactNode } from "react";
import {
  LogOut,
  Menu,
  FileText,
  Settings as SettingsIcon,
  Sparkles,
  FileSpreadsheet,
  Receipt,
  TrendingUp,
  HelpCircle,
  User,
  GraduationCap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";

interface AppShellProps {
  children: ReactNode;
  pageTitle?: string;
  headerActions?: ReactNode;
}

const navItems = [
  { to: "/ai", label: "Quibot AI", icon: Sparkles },
  { to: "/", label: "Invoices", icon: FileText, exact: false },
  { to: "/estimates", label: "Estimates", icon: FileSpreadsheet },
  { to: "/receipts", label: "Receipts", icon: Receipt },
  { to: "/forecast", label: "Revenue Forecast", icon: TrendingUp },
  { to: "/tutorial", label: "Tutorial", icon: GraduationCap },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppShell({ children, pageTitle = "Invoice Generator", headerActions }: AppShellProps) {
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
            "Workspace",
        );
      });
  }, [user]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
          <p className="font-sans text-sm font-semibold tracking-wider uppercase text-muted-foreground">
            Opening Duely…
          </p>
        </div>
      </div>
    );
  }

  const handleNavClick = (to: string) => {
    if (to === "/ai" || to === "/estimates" || to === "/receipts" || to === "/forecast" || to === "/tutorial") {
      toast.info(`${to.replace("/", "").toUpperCase()} module ready in your Duely Workspace.`);
      return;
    }
  };

  const isNavItemActive = (to: string) => {
    if (to === "/") {
      return pathname === "/" || pathname.startsWith("/invoices");
    }
    return pathname === to;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
      {/* ── TOP NAVIGATION BAR ─────────────────────────────────────── */}
      <header className="no-print sticky top-0 z-40 h-14 border-b border-border/80 bg-card/90 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between shadow-2xs">
        {/* Left Side: DUELY Wordmark + Secondary Page Title */}
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label="Open navigation menu"
              className="lg:hidden inline-flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              <Menu className="size-5" />
            </SheetTrigger>

            <SheetContent side="left" className="flex w-[16.5rem] flex-col p-0 border-r border-border">
              <SidebarContent
                name={name}
                userEmail={user.email}
                pathname={pathname}
                isNavItemActive={isNavItemActive}
                handleNavClick={handleNavClick}
                onSignOut={async () => {
                  await supabase.auth.signOut();
                  navigate("/auth");
                }}
              />
            </SheetContent>
          </Sheet>

          {/* DUELY Brand Wordmark */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-sans text-base font-extrabold uppercase tracking-[0.22em] text-foreground transition-opacity group-hover:opacity-85">
              DUELY
            </span>
          </Link>

          <span className="hidden sm:inline-block text-border font-light">/</span>

          {/* Page Title (Secondary to Duely Brand) */}
          <span className="hidden sm:inline-block font-sans text-sm font-semibold text-muted-foreground">
            {pageTitle}
          </span>
        </div>

        {/* Right Side: Help affordance + Action CTA buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => toast.info("Duely Help: Create an invoice by prompt or file, review live preview, and send.")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md"
          >
            <HelpCircle className="size-4 text-muted-foreground" />
            <span className="hidden md:inline">Do you need help?</span>
          </button>

          {headerActions}
        </div>
      </header>

      {/* ── WORKSPACE BODY LAYOUT (Sidebar + Main Area) ─────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* DESKTOP NARROW SIDEBAR (Visible on lg+) */}
        <aside className="hidden lg:flex w-60 shrink-0 border-r border-border/80 bg-card flex-col justify-between select-none">
          <SidebarContent
            name={name}
            userEmail={user.email}
            pathname={pathname}
            isNavItemActive={isNavItemActive}
            handleNavClick={handleNavClick}
            onSignOut={async () => {
              await supabase.auth.signOut();
              navigate("/auth");
            }}
          />
        </aside>

        {/* MAIN WORKSPACE CONTENT AREA */}
        <main className="flex-1 min-w-0 flex flex-col">{children}</main>
      </div>
    </div>
  );
}

/* ── REUSABLE SIDEBAR CONTENT COMPONENT ─────────────────────────────── */
function SidebarContent({
  name,
  userEmail,
  isNavItemActive,
  handleNavClick,
  onSignOut,
}: {
  name: string;
  userEmail?: string;
  pathname: string;
  isNavItemActive: (to: string) => boolean;
  handleNavClick: (to: string) => void;
  onSignOut: () => void;
}) {
  const initial = (name || "W").charAt(0).toUpperCase();

  return (
    <div className="flex h-full w-full flex-col justify-between p-3.5">
      <div className="space-y-4">
        {/* Top: Workspace / Avatar Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex size-9 items-center justify-center rounded-xl bg-foreground text-background font-bold text-xs shadow-xs">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold uppercase tracking-wider text-muted-foreground">Workspace</p>
            <p className="truncate text-sm font-bold text-foreground leading-snug">{name || "Duely Studio"}</p>
          </div>
        </div>

        <div className="h-px bg-border/60" />

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = isNavItemActive(item.to);
            const isExternal = item.to !== "/" && item.to !== "/invoices/new" && item.to !== "/settings";

            if (isExternal) {
              return (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => handleNavClick(item.to)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all text-left",
                    "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.to}
                to={item.to === "/" ? "/invoices/new" : item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all",
                  active
                    ? "bg-primary/12 text-primary font-bold shadow-2xs"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Pinned User Profile Avatar & Signout */}
      <div className="border-t border-border/60 pt-3 space-y-2">
        <Link
          to="/settings"
          className="flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/60"
        >
          <div className="flex size-8 items-center justify-center rounded-full bg-muted text-foreground border border-border">
            <User className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-foreground">{name || "Profile"}</p>
            <p className="truncate text-[10px] text-muted-foreground">{userEmail}</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="size-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}
