import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, FileText, Search, Filter } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StampBadge } from "@/components/StampBadge";
import { supabase } from "@/integrations/supabase/client";
import { effectiveStatus, formatMoney, type InvoiceRecord } from "@/lib/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "awaiting" | "overdue" | "paid" | "draft";

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as InvoiceRecord[];
    },
  });

  const withStatus = invoices.map((i) => ({ ...i, eff: effectiveStatus(i) }));

  const filteredInvoices = withStatus.filter((inv) => {
    // Search filter
    const matchesSearch =
      inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.client_name ?? "").toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    let matchesStatus = true;
    if (statusFilter === "awaiting") matchesStatus = inv.eff === "awaiting";
    else if (statusFilter === "overdue") matchesStatus = inv.eff === "overdue";
    else if (statusFilter === "paid") matchesStatus = inv.eff === "paid";
    else if (statusFilter === "draft") matchesStatus = inv.eff === "draft";

    return matchesSearch && matchesStatus;
  });

  return (
    <AppShell pageTitle="Invoices">
      <div className="flex-1 p-4 lg:p-8 space-y-6 bg-background">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Invoice History
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Manage all generated invoices, track statuses, and issue reminders.
            </p>
          </div>
          <Button asChild size="sm" className="gap-2 font-bold text-xs">
            <Link to="/invoices/new">
              <Plus className="size-4" />
              <span>New Invoice</span>
            </Link>
          </Button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="ledger-panel p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="size-4 text-muted-foreground absolute left-3 top-2.5" />
            <Input
              type="text"
              placeholder="Search by client or invoice #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="size-3.5 text-muted-foreground mr-1 shrink-0" />
            {(["all", "awaiting", "overdue", "paid", "draft"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all shrink-0 cursor-pointer",
                  statusFilter === st
                    ? "bg-primary/15 text-primary font-bold shadow-2xs border border-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Invoice List Panel */}
        <div className="ledger-panel overflow-hidden">
          {isLoading ? (
            <p className="px-5 py-12 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground animate-pulse">
              Loading invoice history…
            </p>
          ) : filteredInvoices.length === 0 ? (
            <div className="px-5 py-16 text-center space-y-3">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground border border-border">
                <FileText className="size-6" />
              </div>
              <div>
                <p className="font-bold text-base text-foreground">No invoices found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "No invoices match your current search criteria."
                    : "Create your first invoice to view it here."}
                </p>
              </div>
              <div className="pt-2">
                <Button asChild size="sm" className="gap-1.5 font-bold text-xs">
                  <Link to="/invoices/new">
                    <Plus className="size-4" />
                    <span>Create New Invoice</span>
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/20 label-caps">
                    <th className="py-3 px-5 font-bold">Invoice #</th>
                    <th className="py-3 px-5 font-bold">Client</th>
                    <th className="py-3 px-5 font-bold">Issue Date</th>
                    <th className="py-3 px-5 font-bold">Due Date</th>
                    <th className="py-3 px-5 text-right font-bold">Total</th>
                    <th className="py-3 px-5 text-right font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="group hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-5 font-mono font-bold text-foreground">
                        <Link to={`/invoices/${inv.id}`} className="block hover:underline">
                          {inv.number}
                        </Link>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-foreground">
                        <Link to={`/invoices/${inv.id}`} className="block">
                          {inv.client_name || "Unnamed Client"}
                        </Link>
                      </td>
                      <td className="py-3.5 px-5 text-muted-foreground whitespace-nowrap">
                        <Link to={`/invoices/${inv.id}`} className="block">
                          {inv.issue_date || "—"}
                        </Link>
                      </td>
                      <td className="py-3.5 px-5 text-muted-foreground whitespace-nowrap">
                        <Link to={`/invoices/${inv.id}`} className="block">
                          {inv.due_date || "—"}
                        </Link>
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-foreground whitespace-nowrap">
                        <Link to={`/invoices/${inv.id}`} className="block">
                          {formatMoney(Number(inv.total), inv.currency)}
                        </Link>
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <Link to={`/invoices/${inv.id}`} className="inline-block">
                          <StampBadge status={inv.eff} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
