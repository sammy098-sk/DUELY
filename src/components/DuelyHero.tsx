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
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DuelyHeroProps {
  context: "landing" | "welcome";
}

export function DuelyHero({ context }: DuelyHeroProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [showDemoModal, setShowDemoModal] = useState(false);

  const isLanding = context === "landing";

  return (
    <div
      className={cn(
        "relative min-h-screen w-full font-sans transition-colors duration-200 overflow-hidden select-none",
        isLanding
          ? "bg-[#0A0F0D] text-white dark:bg-[#0A0F0D] dark:text-white"
          : "bg-background text-foreground"
      )}
    >
      {/* Background Subtle Radial Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          className={cn(
            "h-[500px] w-[700px] rounded-full opacity-20 blur-[130px]",
            isLanding ? "bg-emerald-500" : "bg-emerald-500 dark:bg-emerald-600 opacity-15"
          )}
        />
      </div>

      {/* Public Landing Top Navbar (Theme Toggle + Logo) */}
      {isLanding && (
        <header className="relative z-20 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-sans text-lg font-extrabold uppercase tracking-[0.25em] text-white">
              DUELY
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Small Top-Right Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
              className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10 transition-colors shadow-2xs"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="size-4 text-amber-400" />
              ) : (
                <Moon className="size-4 text-emerald-400" />
              )}
            </button>

            <Button
              asChild
              size="sm"
              className="h-9 px-4 rounded-full font-bold text-xs bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-xs"
            >
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </header>
      )}

      {/* Main Hero Container */}
      <div
        className={cn(
          "relative z-10 mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-8",
          isLanding ? "pt-8 sm:pt-12 pb-20" : "py-8 sm:py-12"
        )}
      >
        {/* 1. HERO BADGE */}
        <div className="animate-hero-fade flex justify-center" style={{ animationDelay: "0ms" }}>
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider border shadow-2xs",
              isLanding
                ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-300"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            )}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI-Assisted Reminders · Freelancer-Built</span>
          </div>
        </div>

        {/* 2. HERO HEADLINE */}
        <div className="animate-hero-fade space-y-4" style={{ animationDelay: "100ms" }}>
          <h1
            className={cn(
              "mx-auto max-w-3xl text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12]",
              isLanding ? "text-white" : "text-foreground"
            )}
          >
            From invoice to inbox in seconds, without lifting a finger again
          </h1>

          {/* 3. HERO SUBHEADLINE */}
          <p
            className={cn(
              "mx-auto max-w-2xl text-sm sm:text-base leading-relaxed",
              isLanding ? "text-neutral-400" : "text-muted-foreground"
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
                className="h-12 px-7 rounded-xl font-extrabold text-sm gap-2 bg-emerald-500 text-neutral-950 hover:bg-emerald-400 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link to="/auth">
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
                className="h-12 px-6 rounded-xl font-bold text-sm gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 transition-all"
              >
                <Play className="size-4 fill-current text-emerald-400" />
                <span>Watch demo</span>
              </Button>
            </>
          ) : (
            <>
              {/* Welcome Primary CTA: Go to Dashboard */}
              <Button
                asChild
                size="lg"
                className="h-12 px-7 rounded-xl font-extrabold text-sm gap-2 bg-emerald-500 text-neutral-950 hover:bg-emerald-400 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link to="/invoices">
                  <span>Go to Dashboard</span>
                  <ArrowRight className="size-4 stroke-[2.5]" />
                </Link>
              </Button>

              {/* Welcome Secondary CTA: New Invoice */}
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-6 rounded-xl font-bold text-sm gap-2 border-border bg-card text-foreground hover:bg-muted transition-all"
              >
                <Link to="/invoices/new">
                  <Sparkles className="size-4 text-primary" />
                  <span>New Invoice</span>
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* 5. HERO PRODUCT PREVIEW (Elevated macOS Browser Chrome Frame) */}
        <div
          className="animate-hero-fade relative mt-8 sm:mt-12 rounded-2xl border border-white/15 bg-neutral-900/90 shadow-2xl p-2 sm:p-3 text-left overflow-hidden group"
          style={{ animationDelay: "300ms" }}
        >
          {/* macOS Browser Chrome Controls Bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-neutral-950/80 rounded-t-xl">
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-red-500/80" />
              <span className="size-3 rounded-full bg-amber-500/80" />
              <span className="size-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-1 text-[11px] font-mono text-neutral-400 border border-white/10">
              <span className="text-emerald-400">https://</span>duely.app/invoices/new
            </div>
            <div className="w-12" />
          </div>

          {/* Screenshot Content (Duely Invoice Generator Layout Representation) */}
          <div className="bg-[#0E1217] rounded-b-xl p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 text-neutral-100">
            {/* Left AI Generator Mock */}
            <div className="md:col-span-5 rounded-xl border border-white/10 bg-neutral-900 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                  AI Invoice Generator
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                  Prompt Mode
                </span>
              </div>

              <div className="rounded-lg border border-white/10 bg-neutral-950 p-3 text-xs font-mono text-neutral-300 space-y-1">
                <p className="text-emerald-400">&gt; Prompt:</p>
                <p className="text-neutral-300">
                  Create an invoice for Acme Studio for ₦420,000 for website redesign, due in 14 days.
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                <span>18 / 4,000 words</span>
                <span className="text-emerald-400">AI Parsing Ready</span>
              </div>

              <div className="h-9 w-full rounded-lg bg-emerald-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm">
                <Sparkles className="size-3.5 fill-current" />
                <span>Generated Invoice</span>
              </div>
            </div>

            {/* Right Live Invoice Document Mock */}
            <div className="md:col-span-7 rounded-xl border border-white/10 bg-white text-neutral-900 p-4 sm:p-5 space-y-3">
              <div className="flex justify-between items-start border-b pb-2.5">
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
                  <p className="font-bold text-neutral-900 uppercase">Invoice to:</p>
                  <p className="font-semibold text-neutral-800">Acme Studio</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-neutral-900 uppercase">Total Due:</p>
                  <p className="font-mono font-extrabold text-sm text-neutral-900">₦420,000.00</p>
                </div>
              </div>

              <div className="rounded border text-[10px] overflow-hidden">
                <div className="bg-neutral-100 px-2 py-1 flex justify-between font-bold text-neutral-700">
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                <div className="px-2 py-1.5 flex justify-between font-mono">
                  <span>Website Redesign &amp; Development</span>
                  <span className="font-bold">₦420,000.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. FLOATING PRODUCT STAT CARDS */}
          {/* Floating Card 1: Bottom Left */}
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 rounded-xl border border-emerald-500/30 bg-neutral-900/95 p-3 text-left shadow-xl backdrop-blur-md flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1">
                <span>Reminder sent</span>
              </p>
              <p className="text-[10px] text-neutral-400">3 invoices followed up via WhatsApp</p>
            </div>
          </div>

          {/* Floating Card 2: Bottom Right */}
          <div className="hidden sm:flex absolute bottom-6 right-6 rounded-xl border border-emerald-500/30 bg-neutral-900/95 p-3 text-left shadow-xl backdrop-blur-md items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs">
              ₦
            </div>
            <div>
              <p className="text-xs font-mono font-extrabold text-white">₦1.2M collected</p>
              <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                <TrendingUp className="size-3 text-emerald-400" />
                <span>+24% this month</span>
              </p>
            </div>
          </div>
        </div>

        {/* 7. WORKS-WHERE-YOUR-CLIENTS-ARE INTEGRATION STRIP */}
        <div
          className="animate-hero-fade pt-8 space-y-4 border-t border-white/10"
          style={{ animationDelay: "400ms" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">
            WORKS WHERE YOUR CLIENTS ARE
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider">
              <Send className="size-4 text-emerald-400" />
              <span>Email / Resend</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider">
              <span className="size-2.5 rounded-full bg-emerald-400" />
              <span>WhatsApp</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider">
              <span className="font-mono font-extrabold text-sm">₦</span>
              <span>Bank Transfer / Paystack</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider">
              <span className="font-mono font-extrabold text-sm text-emerald-400">S</span>
              <span>Supabase</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Modal (when clicking Watch Demo) */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/20 bg-neutral-900 p-6 text-white shadow-2xl space-y-4">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-white"
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
              <Button asChild size="sm" className="bg-emerald-500 text-neutral-950 font-bold text-xs">
                <Link to="/auth">Try Duely Free</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
