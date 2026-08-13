import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, type ReactNode } from "react";
import {
  LogOut,
  Menu,
  FileText,
  Sparkles,
  FileSpreadsheet,
  Receipt,
  TrendingUp,
  HelpCircle,
  User,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import type { ExtendedProfile } from "@/lib/branding";

interface AppShellProps {
  children: ReactNode;
  pageTitle?: string;
  headerActions?: ReactNode;
}

export const navItems = [
  { to: "/quibot", label: "Quibot AI", icon: Sparkles },
  { to: "/invoices/new", label: "Invoices", icon: FileText, matchPrefix: "/invoices" },
  { to: "/estimates", label: "Estimates", icon: FileSpreadsheet },
  { to: "/receipts", label: "Receipts", icon: Receipt },
  { to: "/revenue-forecast", label: "Revenue Forecast", icon: TrendingUp },
  { to: "/tutorial", label: "Tutorial", icon: GraduationCap },
  { to: "/profile", label: "Profile", icon: User },
];

export function AppShell({ children, pageTitle = "Invoice Generator", headerActions }: AppShellProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [name, setName] = useState<string>("");
  const [profile, setProfile] = useState<ExtendedProfile | null>(null);

  // Collapsible Sidebar State (persisted in sessionStorage)
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("duely_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem("duely_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

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
          setName(
            ext.business_name ||
              ext.company_name ||
              (user.user_metadata?.["business_name"] as string) ||
              user.email?.split("@")[0] ||
              "Workspace",
          );
        }
      });
  }, [user]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
          <p className="font-sans text-sm font-semibold tracking-wider uppercase text-muted-foreground">
            Opening Duely…
          </p>
        </div>
      </div>
    );
  }

  const isNavItemActive = (to: string, matchPrefix?: string) => {
    if (matchPrefix) {
      return pathname === to || pathname.startsWith(matchPrefix) || pathname === "/";
    }
    return pathname === to;
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error signing out.");
    } finally {
      navigate("/auth");
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col antialiased">
      {/* ── TOP NAVIGATION BAR (Fixed h-14) ─────────────────────────── */}
      <header className="no-print h-14 shrink-0 border-b border-border/80 bg-card/90 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between shadow-2xs z-40">
        {/* Left Side: DUELY Wordmark + Secondary Page Title */}
        <div className="flex items-center gap-3">
          {/* Mobile Sheet Trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              aria-label="Open navigation menu"
              className="lg:hidden inline-flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              <Menu className="size-5" />
            </SheetTrigger>

            <SheetContent side="left" className="flex w-[16.5rem] flex-col p-0 border-r border-border h-full">
              <SidebarContent
                name={name}
                pathname={pathname}
                collapsed={false}
                isNavItemActive={isNavItemActive}
                onSignOut={handleSignOut}
                logoUrl={profile?.company_logo_url}
              />
            </SheetContent>
          </Sheet>

          {/* DUELY Brand Wordmark */}
          <Link to="/invoices/new" className="flex items-center gap-2 group">
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
            onClick={() =>
              toast.info("Duely Help: Create an invoice by prompt or file, review live preview, and send.")
            }
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md"
          >
            <HelpCircle className="size-4 text-muted-foreground" />
            <span className="hidden md:inline">Do you need help?</span>
          </button>

          {headerActions}
        </div>
      </header>

      {/* ── WORKSPACE BODY LAYOUT (Fixed Sidebar + Main Independent Scroll Area) ─ */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* DESKTOP FIXED SIDEBAR (Visible on lg+) */}
        <aside
          className={cn(
            "hidden lg:flex h-full shrink-0 border-r border-border/80 bg-card flex-col select-none transition-all duration-200 overflow-hidden",
            collapsed ? "w-16" : "w-60"
          )}
        >
          <SidebarContent
            name={name}
            pathname={pathname}
            collapsed={collapsed}
            onToggleCollapse={toggleCollapsed}
            isNavItemActive={isNavItemActive}
            onSignOut={handleSignOut}
            logoUrl={profile?.company_logo_url}
          />
        </aside>

        {/* MAIN WORKSPACE CONTENT CONTAINER (INDEPENDENT SCROLLABLE MAIN) */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto flex flex-col">{children}</main>
      </div>
    </div>
  );
}

/* ── REUSABLE SIDEBAR CONTENT (Fixed Top, Scrollable Middle, Fixed Bottom) ─ */
function SidebarContent({
  name,
  collapsed,
  onToggleCollapse,
  isNavItemActive,
  onSignOut,
  logoUrl,
}: {
  name: string;
  pathname: string;
  collapsed: boolean;
  onToggleCollapse?: () => void;
  isNavItemActive: (to: string, matchPrefix?: string) => boolean;
  onSignOut: () => void;
  logoUrl?: string;
}) {
  const initial = (name || "W").charAt(0).toUpperCase();

  return (
    <div className="flex h-full w-full flex-col justify-between overflow-hidden">
      {/* 1. FIXED TOP: Workspace / Logo Header (Never Scrolls) */}
      <div className="shrink-0 border-b border-border/60 p-3.5">
        {collapsed ? (
          /* Collapsed Layout: Collapse button on top row, Workspace avatar below it */
          <div className="flex flex-col items-center gap-3">
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Expand Sidebar"
                className="size-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
              >
                <PanelLeftOpen className="size-4" />
              </button>
            )}

            <div
              title={name}
              className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background font-extrabold text-xs shrink-0 shadow-2xs overflow-hidden"
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="size-full object-contain bg-background" />
              ) : (
                initial
              )}
            </div>
          </div>
        ) : (
          /* Expanded Layout: Single horizontal row: [Avatar] Workspace Name on left, [←] on right */
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="size-8 rounded-lg object-contain bg-background border border-border shrink-0"
                />
              ) : (
                <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background font-extrabold text-xs shrink-0 shadow-2xs">
                  {initial}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Workspace
                </p>
                <p className="truncate text-xs font-extrabold text-foreground leading-snug">
                  {name || "Duely Studio"}
                </p>
              </div>
            </div>

            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Collapse Sidebar"
                className="size-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
              >
                <PanelLeftClose className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. SCROLLABLE MIDDLE NAVIGATION (flex-1 overflow-y-auto min-h-0) */}
      <nav className="flex-1 overflow-y-auto min-h-0 p-3 space-y-1">
        {navItems.map((item) => {
          const active = isNavItemActive(item.to, item.matchPrefix);

          return (
            <Link
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg py-2.5 text-xs font-semibold transition-all",
                collapsed ? "justify-center px-0" : "px-3",
                active
                  ? "bg-primary/12 text-primary font-bold shadow-2xs"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* 3. FIXED BOTTOM: Log out (Never Scrolls) */}
      <div className="shrink-0 border-t border-border/60 p-3">
        <button
          type="button"
          onClick={onSignOut}
          title={collapsed ? "Log out" : undefined}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg py-2 text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
            collapsed ? "justify-center px-0" : "px-3"
          )}
        >
          <LogOut className="size-3.5 shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </div>
  );
}
