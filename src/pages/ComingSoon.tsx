import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, type LucideIcon } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  pageTitle?: string;
}

export default function ComingSoonPage({
  title,
  description,
  icon: Icon,
  pageTitle,
}: ComingSoonProps) {
  return (
    <AppShell pageTitle={pageTitle || title}>
      <div className="flex-1 p-6 lg:p-10 flex items-center justify-center">
        <div className="mx-auto max-w-lg w-full text-center space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card p-8 sm:p-10 shadow-paper space-y-5">
            {/* Icon & Coming Soon Chip */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                <Icon className="size-7" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/60 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground border border-accent">
                <Clock className="size-3.5" />
                Coming Soon
              </span>
            </div>

            {/* Title & Explanation */}
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                {description}
              </p>
            </div>

            <div className="pt-2 border-t border-border/60">
              <Button asChild variant="outline" size="sm" className="gap-2 text-xs font-semibold">
                <Link to="/invoices/new">
                  <ArrowLeft className="size-3.5" />
                  Return to Invoice Generator
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
