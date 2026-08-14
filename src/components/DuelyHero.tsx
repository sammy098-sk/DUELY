import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  TrendingUp,
  Sun,
  Moon,
  Sparkles,
  Send,
  X,
  Zap,
  MessageCircle,
  Shield,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { DuelyFooter } from "@/components/DuelyFooter";
import { cn } from "@/lib/utils";

interface DuelyHeroProps {
  context: "landing" | "welcome";
}

export function DuelyHero({ context }: DuelyHeroProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [showDemoModal, setShowDemoModal] = useState(false);

  const isLanding = context === "landing";
  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={cn(
        "relative min-h-screen w-full font-sans transition-colors duration-200 select-none pb-16",
        isLanding
          ? isDark
            ? "bg-[#0A0F0D] text-white"
            : "bg-[#FBFAF7] text-slate-900"
          : "bg-background text-foreground"
      )}
    >
      {/* Background Subtle Radial Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          className={cn(
            "h-[500px] w-[700px] rounded-full blur-[130px]",
            isDark ? "bg-emerald-500/20" : "bg-emerald-500/10"
          )}
        />
      </div>

      {/* Public Landing Top Navbar (Theme Toggle + Logo + Sign In Button) */}
      {isLanding && (
        <header className="relative z-20 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <span
              className={cn(
                "font-sans text-lg font-extrabold uppercase tracking-[0.25em]",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              DUELY
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Small Top-Right Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
              className={cn(
                "flex size-9 items-center justify-center rounded-full border transition-colors shadow-2xs cursor-pointer",
                isDark
                  ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              )}
            >
              {isDark ? (
                <Sun className="size-4 text-amber-400" />
              ) : (
                <Moon className="size-4 text-emerald-600" />
              )}
            </button>

            {/* Sign In Header Link */}
            <Button
              asChild
              size="sm"
              className="h-9 px-4 rounded-full font-bold text-xs bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-xs cursor-pointer"
            >
              <Link to="/auth?mode=signin">Sign In</Link>
            </Button>
          </div>
        </header>
      )}

      {/* Main Hero Container */}
      <div
        className={cn(
          "relative z-10 mx-auto max-w-6xl px-4 sm:px-6 text-center space-y-12 sm:space-y-16",
          isLanding ? "pt-8 sm:pt-12 pb-16" : "py-8 sm:py-12"
        )}
      >
        {/* 1. HERO BADGE (Two-tone split pill badge) */}
        <div className="animate-hero-fade flex justify-center" style={{ animationDelay: "0ms" }}>
          <div className="inline-flex items-center rounded-full p-0.5 border border-emerald-500/30 bg-emerald-500/10 text-[10.5px] font-extrabold uppercase tracking-wider shadow-2xs">
            <span className="rounded-full bg-emerald-500 text-neutral-950 px-3 py-1 font-extrabold tracking-wide">
              AI-ASSISTED
            </span>
            <span
              className={cn(
                "px-3 py-1 font-extrabold tracking-wide",
                isDark ? "text-emerald-400" : "text-emerald-700"
              )}
            >
              FREELANCER-BUILT
            </span>
          </div>
        </div>

        {/* 2. HERO HEADLINE */}
        <div className="animate-hero-fade space-y-4" style={{ animationDelay: "100ms" }}>
          <h1
            className={cn(
              "mx-auto max-w-3xl text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12]",
              isLanding ? (isDark ? "text-white" : "text-slate-900") : "text-foreground"
            )}
          >
            From invoice to inbox in seconds, without lifting a finger again
          </h1>

          {/* 3. HERO SUBHEADLINE */}
          <p
            className={cn(
              "mx-auto max-w-2xl text-sm sm:text-base leading-relaxed",
              isLanding ? (isDark ? "text-neutral-400" : "text-slate-600") : "text-muted-foreground"
            )}
          >
            Create invoices, chase payment automatically over email and WhatsApp, and get paid faster.
            Local-first drafting, AI-assisted reminders, built for freelancers.
          </p>
        </div>

        {/* 4. HERO CTA BUTTONS */}
        <div
          className="animate-hero-fade flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2"
          style={{ animationDelay: "200ms" }}
        >
          {isLanding ? (
            <>
              {/* Landing Primary CTA: Get started free */}
              <Button
                asChild
                size="lg"
                className="h-12 px-7 rounded-xl font-extrabold text-sm gap-2 bg-emerald-500 text-neutral-950 hover:bg-emerald-400 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Link to="/auth?mode=signup">
                  <span>Get started free</span>
                  <ArrowRight className="size-4 stroke-[2.5]" />
                </Link>
              </Button>

              {/* Landing Secondary CTA: Watch demo */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setShowDemoModal(true)}
                className={cn(
                  "h-12 px-6 rounded-xl font-bold text-sm gap-2 border transition-all cursor-pointer",
                  isDark
                    ? "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30"
                    : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100 hover:border-slate-400 shadow-2xs"
                )}
              >
                <Play className="size-4 fill-current text-emerald-500" />
                <span>Watch demo</span>
              </Button>
            </>
          ) : (
            <>
              {/* Welcome Primary CTA: Go to Dashboard */}
              <Button
                asChild
                size="lg"
                className="h-12 px-7 rounded-xl font-extrabold text-sm gap-2 bg-emerald-500 text-neutral-950 hover:bg-emerald-400 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Link to="/dashboard">
                  <span>Go to Dashboard</span>
                  <ArrowRight className="size-4 stroke-[2.5]" />
                </Link>
              </Button>

              {/* Welcome Secondary CTA: New Invoice */}
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-6 rounded-xl font-bold text-sm gap-2 border-border bg-card text-foreground hover:bg-muted transition-all cursor-pointer"
              >
                <Link to="/invoices/new">
                  <Sparkles className="size-4 text-primary" />
                  <span>New Invoice</span>
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* 5. STATIC PRODUCT MOCKUP */}
        <InvoicePreviewMockup isDark={isDark} />

        {/* 6. WORKS-WHERE-YOUR-CLIENTS-ARE INTEGRATION STRIP */}
        <div
          className={cn(
            "animate-hero-fade pt-8 space-y-4 border-t",
            isDark ? "border-white/10" : "border-slate-200"
          )}
          style={{ animationDelay: "400ms" }}
        >
          <p
            className={cn(
              "text-[10px] font-bold uppercase tracking-[0.25em]",
              isDark ? "text-neutral-400" : "text-slate-500"
            )}
          >
            WORKS WHERE YOUR CLIENTS ARE
          </p>

          <div
            className={cn(
              "flex flex-wrap items-center justify-center gap-8 sm:gap-12 font-semibold",
              isDark ? "opacity-60 text-white" : "opacity-75 text-slate-700"
            )}
          >
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider">
              <Send className="size-4 text-emerald-500" />
              <span>Email / Resend</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider">
              <span className="size-2.5 rounded-full bg-emerald-500" />
              <span>WhatsApp</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider">
              <span className="font-mono font-extrabold text-sm">₦</span>
              <span>Bank Transfer / Paystack</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider">
              <span className="font-mono font-extrabold text-sm text-emerald-500">S</span>
              <span>Supabase</span>
            </div>
          </div>
        </div>

        {/* 7. NEW FEATURES SECTION */}
        <section className="pt-16 sm:pt-24 space-y-12 text-left">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2
              className={cn(
                "text-3xl sm:text-4xl font-extrabold tracking-tight font-serif",
                isLanding ? (isDark ? "text-white" : "text-slate-900") : "text-foreground"
              )}
            >
              Everything you need to get paid
            </h2>
            <p
              className={cn(
                "text-sm sm:text-base leading-relaxed font-sans",
                isLanding ? (isDark ? "text-neutral-400" : "text-slate-600") : "text-muted-foreground"
              )}
            >
              Create, send, and track invoices without living in your inbox.
            </p>
          </div>

          {/* Balanced 2-Column Desktop Grid (Visual on Left, 3 Feature Items on Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left 50% Column: Feature Visual Mockup */}
            <div className="lg:col-span-6">
              <InvoicePreviewMockup isDark={isDark} variant="feature" />
            </div>

            {/* Right 50% Column: 3 Feature Items */}
            <div className="lg:col-span-6 space-y-8">
              {/* Feature Item 1: Automated Reminders */}
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 mt-0.5">
                  <Zap className="size-5" />
                </div>
                <div className="space-y-1">
                  <h3
                    className={cn(
                      "text-base font-bold font-sans",
                      isLanding ? (isDark ? "text-white" : "text-slate-900") : "text-foreground"
                    )}
                  >
                    Automated reminders
                  </h3>
                  <p
                    className={cn(
                      "text-xs sm:text-sm leading-relaxed font-sans",
                      isLanding ? (isDark ? "text-neutral-400" : "text-slate-600") : "text-muted-foreground"
                    )}
                  >
                    Every unpaid invoice gets chased for you, every 3 days, until it's paid.
                  </p>
                </div>
              </div>

              {/* Feature Item 2: AI-Drafted, Always On-Brand */}
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 mt-0.5">
                  <MessageCircle className="size-5" />
                </div>
                <div className="space-y-1">
                  <h3
                    className={cn(
                      "text-base font-bold font-sans",
                      isLanding ? (isDark ? "text-white" : "text-slate-900") : "text-foreground"
                    )}
                  >
                    AI-drafted, always on-brand
                  </h3>
                  <p
                    className={cn(
                      "text-xs sm:text-sm leading-relaxed font-sans",
                      isLanding ? (isDark ? "text-neutral-400" : "text-slate-600") : "text-muted-foreground"
                    )}
                  >
                    Reminders escalate automatically — friendly first, then firm, then final notice.
                  </p>
                </div>
              </div>

              {/* Feature Item 3: Built for Freelancers */}
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 mt-0.5">
                  <Shield className="size-5" />
                </div>
                <div className="space-y-1">
                  <h3
                    className={cn(
                      "text-base font-bold font-sans",
                      isLanding ? (isDark ? "text-white" : "text-slate-900") : "text-foreground"
                    )}
                  >
                    Built for freelancers
                  </h3>
                  <p
                    className={cn(
                      "text-xs sm:text-sm leading-relaxed font-sans",
                      isLanding ? (isDark ? "text-neutral-400" : "text-slate-600") : "text-muted-foreground"
                    )}
                  >
                    No accounting degree required. Create and send an invoice in under a minute.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. NEW CTA BANNER */}
        <section className="pt-12 sm:pt-16">
          <div
            className={cn(
              "rounded-3xl border p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-xl space-y-5 relative overflow-hidden",
              isDark
                ? "border-emerald-500/30 bg-neutral-900/90 text-white"
                : "border-slate-300 bg-white text-slate-900"
            )}
          >
            {/* Subtle Inner Glow */}
            <div className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full bg-emerald-500/15 blur-3xl" />

            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">
              Start invoicing for free
            </h3>
            <p
              className={cn(
                "mx-auto max-w-xl text-xs sm:text-sm leading-relaxed font-sans",
                isDark ? "text-neutral-400" : "text-slate-600"
              )}
            >
              Create your first invoice, automate your follow-ups, and spend less time chasing payments.
            </p>
            <div className="pt-2">
              {isLanding ? (
                <Button
                  asChild
                  size="lg"
                  className="h-11 px-7 rounded-xl font-extrabold text-xs gap-2 bg-emerald-500 text-neutral-950 hover:bg-emerald-400 transition-all shadow-md cursor-pointer"
                >
                  <Link to="/auth?mode=signup">
                    <span>Get started free</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  size="lg"
                  className="h-11 px-7 rounded-xl font-extrabold text-xs gap-2 bg-emerald-500 text-neutral-950 hover:bg-emerald-400 transition-all shadow-md cursor-pointer"
                >
                  <Link to="/dashboard">
                    <span>Go to Dashboard</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* 9. MINIMAL FOOTER */}
        <DuelyFooter isDark={isDark} />
      </div>

      {/* Demo Modal (when clicking Watch Demo) */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/20 bg-neutral-900 p-6 text-white shadow-2xl space-y-4">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <h3 className="text-xl font-bold">Duely Workflow Demo</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              1. Type what you delivered or drop a project file.<br />
              2. Duely extracts line items, client info, and payment terms instantly.<br />
              3. Send your invoice. Duely monitors due dates and chases payment over WhatsApp &amp; Email automatically!
            </p>
            <div className="pt-3 flex justify-end">
              <Button asChild size="sm" className="bg-emerald-500 text-neutral-950 font-bold text-xs cursor-pointer">
                <Link to="/auth?mode=signup">Try Duely Free</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── ISOLATED STATIC PRODUCT PREVIEW MOCKUP (No iframe, No live app state) ── */
function InvoicePreviewMockup({
  isDark,
  variant = "hero",
}: {
  isDark: boolean;
  variant?: "hero" | "feature";
}) {
  const isFeature = variant === "feature";

  return (
    <div
      className={cn(
        "animate-hero-fade relative rounded-2xl border shadow-2xl p-2 sm:p-3 text-left transition-colors h-auto",
        isFeature ? "mt-0 scale-[0.98]" : "mt-8 sm:mt-12",
        isDark
          ? "border-white/15 bg-neutral-900/90"
          : "border-slate-200 bg-white/90 shadow-xl"
      )}
      style={{ animationDelay: isFeature ? "0ms" : "300ms" }}
    >
      {/* macOS Browser Chrome Controls Bar */}
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2 border-b rounded-t-xl",
          isDark
            ? "border-white/10 bg-neutral-950/80"
            : "border-slate-200 bg-slate-100/90"
        )}
      >
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-red-500/80" />
          <span className="size-3 rounded-full bg-amber-500/80" />
          <span className="size-3 rounded-full bg-emerald-500/80" />
        </div>
        <div
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-1 text-[11px] font-mono border",
            isDark
              ? "bg-white/5 text-neutral-400 border-white/10"
              : "bg-white text-slate-600 border-slate-200"
          )}
        >
          <span className="text-emerald-500 font-bold">https://</span>duely.app/invoices/new
        </div>
        <div className="w-12" />
      </div>

      {/* Screenshot Content (Duely Invoice Generator Layout Representation) */}
      <div
        className={cn(
          "rounded-b-xl p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 pb-12 sm:pb-14",
          isDark ? "bg-[#0E1217] text-neutral-100" : "bg-[#F8F9FA] text-slate-900"
        )}
      >
        {/* Left AI Generator Mock */}
        <div
          className={cn(
            "md:col-span-5 rounded-xl border p-4 space-y-3",
            isDark
              ? "border-white/10 bg-neutral-900"
              : "border-slate-200 bg-white shadow-2xs"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
              AI INVOICE GENERATOR
            </span>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
              Prompt Mode
            </span>
          </div>

          <div
            className={cn(
              "rounded-lg border p-3 text-xs font-mono space-y-1",
              isDark
                ? "border-white/10 bg-neutral-950 text-neutral-300"
                : "border-slate-200 bg-slate-50 text-slate-800"
            )}
          >
            <p className="text-emerald-500 font-bold">&gt; Prompt:</p>
            <p>
              Create an invoice for Acme Studio for ₦420,000 for website redesign, due in 14 days.
            </p>
          </div>

          <div
            className={cn(
              "flex items-center justify-between text-[10px] font-mono",
              isDark ? "text-neutral-400" : "text-slate-500"
            )}
          >
            <span>18 / 4,000 words</span>
            <span className="text-emerald-500 font-bold">AI Parsing Ready</span>
          </div>

          <div className="h-9 w-full rounded-lg bg-emerald-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm">
            <Sparkles className="size-3.5 fill-current" />
            <span>Generate Invoice</span>
          </div>
        </div>

        {/* Right Live Invoice Document Mock */}
        <div className="md:col-span-7 rounded-xl border border-slate-200 bg-white text-neutral-900 p-4 sm:p-5 space-y-3 shadow-2xs">
          <div className="flex justify-between items-start border-b border-slate-200 pb-2.5">
            <div>
              <h3 className="font-extrabold text-lg uppercase tracking-tight text-neutral-900">INVOICE</h3>
              <p className="text-[10px] text-neutral-500">Duely Studio · Lagos, Nigeria</p>
            </div>
            <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-mono font-bold text-neutral-600">
              #0048
            </span>
          </div>

          <div className="grid grid-cols-2 text-[10px] gap-2 text-neutral-600">
            <div>
              <p className="font-bold text-neutral-900 uppercase">Billed To:</p>
              <p className="font-semibold text-neutral-800">Acme Studio</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-neutral-900 uppercase">Total Due:</p>
              <p className="font-mono font-extrabold text-sm text-neutral-900">₦420,000.00</p>
            </div>
          </div>

          <div className="rounded border border-slate-200 text-[10px] overflow-hidden">
            <div className="bg-neutral-100 px-2 py-1 flex justify-between font-bold text-neutral-700">
              <span>Description</span>
              <span>Amount</span>
            </div>
            <div className="px-2 py-1.5 flex justify-between font-mono border-t border-slate-100">
              <span>Website Design &amp; Development</span>
              <span className="font-bold">₦420,000.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Product Stat Cards (Hero Only) */}
      {!isFeature && (
        <>
          <div
            className={cn(
              "absolute bottom-3 left-4 sm:bottom-4 sm:left-6 rounded-xl border p-3 text-left shadow-xl backdrop-blur-md flex items-center gap-3",
              isDark
                ? "border-emerald-500/30 bg-neutral-900/95 text-white"
                : "border-emerald-500/30 bg-white/95 text-slate-900"
            )}
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-500">
              <CheckCircle2 className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold flex items-center gap-1">
                <span>Reminder sent</span>
              </p>
              <p className={cn("text-[10px]", isDark ? "text-neutral-400" : "text-slate-500")}>
                3 invoices followed up via WhatsApp
              </p>
            </div>
          </div>

          <div
            className={cn(
              "hidden sm:flex absolute bottom-4 right-6 rounded-xl border p-3 text-left shadow-xl backdrop-blur-md items-center gap-3",
              isDark
                ? "border-emerald-500/30 bg-neutral-900/95 text-white"
                : "border-emerald-500/30 bg-white/95 text-slate-900"
            )}
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-500 font-bold text-xs">
              ₦
            </div>
            <div>
              <p className="text-xs font-mono font-extrabold">₦1.2M collected</p>
              <p className={cn("text-[10px] flex items-center gap-1", isDark ? "text-neutral-400" : "text-slate-500")}>
                <TrendingUp className="size-3 text-emerald-500" />
                <span>+24% this month</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
