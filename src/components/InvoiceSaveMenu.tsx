import { useState } from "react";
import { Save, Download, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface InvoiceSaveMenuProps {
  onSaveDraft?: () => void | Promise<void>;
  onDownloadPDF: () => void | Promise<void>;
  savingDraft?: boolean;
  downloadingPDF?: boolean;
  disabled?: boolean;
  align?: "start" | "center" | "end";
}

export function InvoiceSaveMenu({
  onSaveDraft,
  onDownloadPDF,
  savingDraft = false,
  downloadingPDF = false,
  disabled = false,
  align = "end",
}: InvoiceSaveMenuProps) {
  const [open, setOpen] = useState(false);

  const handleSaveDraft = async () => {
    setOpen(false);
    if (onSaveDraft) {
      await onSaveDraft();
    }
  };

  const handleDownloadPDF = async () => {
    setOpen(false);
    await onDownloadPDF();
  };

  const isBusy = savingDraft || downloadingPDF || disabled;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isBusy}
          aria-label="Save or download invoice"
          className="h-9 px-2.5 sm:px-3 text-xs font-semibold gap-1.5 border-border bg-card hover:bg-muted text-foreground cursor-pointer shrink-0 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Save className="size-4 sm:size-3.5 text-foreground shrink-0" />
          <span className="sr-only sm:not-sr-only sm:inline">Save / Download</span>
          <ChevronDown className="hidden sm:inline size-3.5 opacity-70 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={6}
        collisionPadding={8}
        className="w-48 z-50 bg-popover text-popover-foreground border border-border shadow-md rounded-md p-1"
      >
        {onSaveDraft && (
          <DropdownMenuItem
            onClick={handleSaveDraft}
            disabled={savingDraft || disabled}
            className="gap-2 cursor-pointer text-xs font-medium py-2 px-2.5 rounded-sm focus:bg-accent focus:text-accent-foreground"
          >
            {savingDraft ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <Save className="size-4 text-muted-foreground" />
            )}
            <span>{savingDraft ? "Saving Draft…" : "Save Draft"}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={handleDownloadPDF}
          disabled={downloadingPDF || disabled}
          className="gap-2 cursor-pointer text-xs font-medium py-2 px-2.5 rounded-sm focus:bg-accent focus:text-accent-foreground"
        >
          {downloadingPDF ? (
            <Loader2 className="size-4 animate-spin text-primary" />
          ) : (
            <Download className="size-4 text-muted-foreground" />
          )}
          <span>{downloadingPDF ? "Generating PDF…" : "Download PDF"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
