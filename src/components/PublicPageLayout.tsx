import { Link } from "react-router-dom";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { DuelyFooter } from "@/components/DuelyFooter";
import { cn } from "@/lib/utils";

interface PublicPageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function PublicPageLayout({
  children,
}: PublicPageLayoutProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={cn(
        "min-h-screen w-full font-sans transition-colors duration-200 flex flex-col justify-between select-none",
        isDark ? "bg-[#0A0F0D] text-white" : "bg-[#FBFAF7] text-slate-900"
      )}
    >
      {/* Background Subtle Radial Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          className={cn(
            "h-[400px] w-[600px] rounded-full blur-[140px]",
            isDark ? "bg-emerald-500/15" : "bg-emerald-500/10"
          )}
        />
      </div>

      {/* Top Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
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

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-bold transition-colors",
              isDark ? "text-neutral-300 hover:text-white" : "text-slate-700 hover:text-slate-900"
            )}
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to home</span>
          </Link>

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
        </div>
      </header>

      {/* Centered Main Content Column */}
      <main className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16 w-full flex-1 space-y-8 text-left">
        {children}
      </main>

      {/* Reusable Shared Footer */}
      <DuelyFooter isDark={isDark} />
    </div>
  );
}
