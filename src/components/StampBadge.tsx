import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/lib/invoice";

const styles: Record<InvoiceStatus, string> = {
  paid: "text-stamp-paid border-stamp-paid/30 bg-stamp-paid/10",
  overdue: "text-stamp-overdue border-stamp-overdue/30 bg-stamp-overdue/10",
  awaiting: "text-stamp-awaiting border-stamp-awaiting/30 bg-stamp-awaiting/10",
  draft: "text-stamp-draft border-stamp-draft/30 bg-stamp-draft/10",
};

const sizes = {
  sm: "text-[0.65rem] px-2.5 py-1 border tracking-wider",
  md: "text-xs px-3 py-1.5 border tracking-wider",
  lg: "text-base px-5 py-2 border-2 tracking-wide",
};

export function StampBadge({
  status,
  size = "sm",
  className,
}: {
  status: InvoiceStatus;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full font-semibold uppercase select-none",
        styles[status],
        sizes[size],
        className,
      )}
    >
      {status}
    </span>
  );
}
