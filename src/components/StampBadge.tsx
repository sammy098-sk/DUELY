import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/lib/invoice";

const styles: Record<InvoiceStatus, string> = {
  paid: "text-stamp-paid border-stamp-paid",
  overdue: "text-stamp-overdue border-stamp-overdue",
  awaiting: "text-stamp-awaiting border-stamp-awaiting",
  draft: "text-stamp-draft border-stamp-draft",
};

const sizes = {
  sm: "text-[0.6rem] px-2 py-0.5 border-2 tracking-[0.2em]",
  md: "text-xs px-3 py-1 border-2 tracking-[0.22em]",
  lg: "text-xl px-6 py-2 border-4 tracking-[0.24em]",
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
        "inline-block -rotate-6 rounded-sm font-mono font-bold uppercase opacity-90 select-none",
        styles[status],
        sizes[size],
        className,
      )}
    >
      {status}
    </span>
  );
}
