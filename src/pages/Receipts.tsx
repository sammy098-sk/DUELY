import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Receipt, Plus } from "lucide-react";
import { toast } from "sonner";

export default function ReceiptsPage() {
  const handleNewReceipt = () => {
    toast.info("Receipts are generated automatically when invoices are marked as paid.");
  };

  return (
    <AppShell pageTitle="Receipts">
      <div className="flex-1 p-4 lg:p-8 bg-background">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
                Receipts
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Every paid invoice generates a receipt automatically.
              </p>
            </div>
            <Button
              onClick={handleNewReceipt}
              variant="outline"
              size="sm"
              className="gap-1.5 font-bold text-xs cursor-pointer"
            >
              <Plus className="size-4" />
              <span>New Receipt</span>
            </Button>
          </div>

          {/* Empty State Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-8 sm:p-12 text-center shadow-paper space-y-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Receipt className="size-7 text-primary" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h2 className="font-serif text-lg font-bold text-foreground">
                No receipts yet
              </h2>
              <p className="text-xs text-muted-foreground">
                Receipts will appear here when invoices are paid.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
