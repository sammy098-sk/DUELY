import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { DuelyFooter } from "@/components/DuelyFooter";

interface AuthenticatedInfoPageLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedInfoPageLayout({ children }: AuthenticatedInfoPageLayoutProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex-1 w-full min-h-full font-sans flex flex-col justify-between select-none bg-background text-foreground">
      {/* Main Content Area */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-10 w-full space-y-6 flex-1 text-left">
        {/* Top Header Row with Back to Home button */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <Link
            to="/welcome"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Reusable Content Component */}
        <div className="pt-2">
          {children}
        </div>
      </div>

      {/* Shared Authenticated Footer */}
      <DuelyFooter isDark={isDark} context="authenticated" />
    </div>
  );
}
