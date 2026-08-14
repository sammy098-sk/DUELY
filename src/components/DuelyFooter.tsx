import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DuelyFooterProps {
  isDark?: boolean;
  context?: "landing" | "authenticated";
}

export function DuelyFooter({ isDark = false, context = "landing" }: DuelyFooterProps) {
  const isAuthenticated = context === "authenticated";

  const companyLinks = {
    about: isAuthenticated ? "/app/about" : "/about",
    contact: isAuthenticated ? "/app/contact" : "/contact",
    terms: isAuthenticated ? "/app/terms" : "/terms",
    privacy: isAuthenticated ? "/app/privacy" : "/privacy",
  };

  return (
    <footer
      className={cn(
        "pt-16 sm:pt-20 space-y-12 text-left font-sans select-none border-t",
        isDark ? "border-white/10 text-white" : "border-slate-200 text-slate-900"
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Left Side: Brand Wordmark & Tagline */}
        <div className="md:col-span-5 space-y-3">
          <Link to={isAuthenticated ? "/welcome" : "/"} className="inline-block">
            <span className="font-serif italic text-2xl font-extrabold tracking-tight">
              Duely
            </span>
          </Link>
          <p
            className={cn(
              "text-xs leading-relaxed max-w-xs font-sans",
              isDark ? "text-neutral-400" : "text-slate-600"
            )}
          >
            Invoices that chase payment for you.
          </p>
        </div>

        {/* Right Side: 3 Navigation Columns */}
        <div className="md:col-span-7 grid grid-cols-3 gap-6 text-xs font-sans">
          {/* Col 1: Product */}
          <div className="space-y-3">
            <p className="font-extrabold text-[11px] uppercase tracking-wider text-emerald-500">
              Product
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/dashboard"
                  className={cn(
                    "transition-colors",
                    isDark ? "text-neutral-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/invoices/new"
                  className={cn(
                    "transition-colors",
                    isDark ? "text-neutral-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  New Invoice
                </Link>
              </li>
              <li>
                <Link
                  to="/invoices"
                  className={cn(
                    "transition-colors",
                    isDark ? "text-neutral-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Clients
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Company */}
          <div className="space-y-3">
            <p className="font-extrabold text-[11px] uppercase tracking-wider text-emerald-500">
              Company
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  to={companyLinks.about}
                  className={cn(
                    "transition-colors",
                    isDark ? "text-neutral-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to={companyLinks.contact}
                  className={cn(
                    "transition-colors",
                    isDark ? "text-neutral-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal */}
          <div className="space-y-3">
            <p className="font-extrabold text-[11px] uppercase tracking-wider text-emerald-500">
              Legal
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  to={companyLinks.terms}
                  className={cn(
                    "transition-colors",
                    isDark ? "text-neutral-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link
                  to={companyLinks.privacy}
                  className={cn(
                    "transition-colors",
                    isDark ? "text-neutral-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bottom Text */}
      <div
        className={cn(
          "pt-8 pb-12 text-xs font-sans max-w-6xl mx-auto px-4 sm:px-6",
          isDark ? "text-neutral-500" : "text-slate-500"
        )}
      >
        <p>© 2026 Duely — All rights reserved.</p>
      </div>
    </footer>
  );
}
