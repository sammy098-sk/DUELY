import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Plus } from "lucide-react";
import { toast } from "sonner";

export default function EstimatesPage() {
  const handleNewEstimate = () => {
    toast.info("Estimates feature is coming soon.");
  };

  return (
    <AppShell pageTitle="Estimates">
      <div className="flex-1 p-4 lg:p-8 bg-background">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
                Estimates
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Send a quote before the work begins — convert it to an invoice once approved.
              </p>
            </div>
            <Button
              onClick={handleNewEstimate}
              size="sm"
              className="gap-1.5 font-bold text-xs cursor-pointer"
            >
              <Plus className="size-4" />
              <span>New Estimate</span>
            </Button>
          </div>

          {/* Empty State Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-8 sm:p-12 text-center shadow-paper space-y-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <FileSpreadsheet className="size-7 text-primary" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h2 className="font-serif text-lg font-bold text-foreground">
                No estimates yet
              </h2>
              <p className="text-xs text-muted-foreground">
                Create estimates for clients before turning approved work into invoices.
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewEstimate}
                className="gap-1.5 text-xs font-semibold"
              >
                <Plus className="size-3.5" />
                <span>Create your first estimate</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
