import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, FileText, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StampBadge } from "@/components/StampBadge";
import { supabase } from "@/integrations/supabase/client";
import { effectiveStatus, formatMoney, type InvoiceRecord } from "@/lib/invoice";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "outstanding" | "overdue" | "paid";

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

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

  const currency = invoices[0]?.currency ?? "USD";
  const withStatus = invoices.map((i) => ({ ...i, eff: effectiveStatus(i) }));

  const sum = (f: (i: (typeof withStatus)[number]) => boolean) =>
    withStatus.filter(f).reduce((s, i) => s + Number(i.total), 0);

  const outstandingTotal = sum((i) => i.eff === "awaiting" || i.eff === "overdue");
  const overdueTotal = sum((i) => i.eff === "overdue");
  const paidTotal = sum((i) => i.eff === "paid");
  const grandTotal = withStatus.reduce((s, i) => s + Number(i.total), 0);

  const filteredInvoices = withStatus.filter((inv) => {
    if (activeFilter === "outstanding") return inv.eff === "awaiting" || inv.eff === "overdue";
    if (activeFilter === "overdue") return inv.eff === "overdue";
    if (activeFilter === "paid") return inv.eff === "paid";
    return true;
  });

  const stats = [
    {
      label: "Outstanding",
      value: outstandingTotal,
      icon: Clock,
      color: "text-amber-500 dark:text-amber-400",
    },
    {
      label: "Overdue",
      value: overdueTotal,
      alert: overdueTotal > 0,
      icon: AlertCircle,
      color: "text-stamp-overdue",
    },
    {
      label: "Collected",
      value: paidTotal,
      icon: CheckCircle2,
      color: "text-stamp-paid",
    },
    {
      label: "Total Invoiced",
      value: grandTotal,
      icon: TrendingUp,
      color: "text-primary",
    },
  ];

  return (
    <AppShell pageTitle="Dashboard">
      <div className="flex-1 p-4 lg:p-8 space-y-6 bg-background">
        {/* Page Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Dashboard &amp; Ledger
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Duely monitors unpaid invoices every 3 days and chases payments automatically.
            </p>
          </div>
          <Button asChild size="sm" className="gap-2 font-bold text-xs">
            <Link to="/invoices/new">
              <Plus className="size-4" />
              <span>New Invoice</span>
            </Link>
          </Button>
        </div>

        {/* Financial Summary Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="ledger-panel p-5 space-y-2 transition-all hover:border-border/90"
              >
                <div className="flex items-center justify-between">
                  <span className="label-caps font-bold">{s.label}</span>
                  <Icon className={cn("size-4", s.color)} />
                </div>
                <p
                  className={cn(
                    "money text-2xl font-extrabold tracking-tight",
                    s.alert ? "text-stamp-overdue" : "text-foreground"
                  )}
                >
                  {formatMoney(s.value, currency)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Filter Chips & Table Panel */}
        <div className="ledger-panel overflow-hidden space-y-0">
          {/* Header & Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 px-5 py-4 bg-muted/30">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Invoices ({filteredInvoices.length})
              </h2>
            </div>

            {/* Filter Tab Chips */}
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border/60 text-xs">
              {(["all", "outstanding", "overdue", "paid"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFilter(tab)}
                  className={cn(
                    "px-3 py-1 rounded-md font-semibold capitalize transition-all cursor-pointer",
                    activeFilter === tab
                      ? "bg-card text-foreground shadow-2xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Invoice Table / List View */}
          {isLoading ? (
            <p className="px-5 py-12 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground animate-pulse">
              Loading invoices…
            </p>
          ) : filteredInvoices.length === 0 ? (
            <div className="px-5 py-16 text-center space-y-3">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground border border-border">
                <FileText className="size-6" />
              </div>
              <div>
                <p className="font-bold text-base text-foreground">No invoices found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {activeFilter === "all"
                    ? "Generate your first invoice with Duely AI to start automated chasing."
                    : `No ${activeFilter} invoices match your current filter.`}
                </p>
              </div>
              <div className="pt-2">
                <Button asChild size="sm" className="gap-1.5 font-bold text-xs">
                  <Link to="/invoices/new">
                    <Plus className="size-4" />
                    <span>Create Invoice</span>
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/10 label-caps">
                    <th className="py-3 px-5 font-bold">Number</th>
                    <th className="py-3 px-5 font-bold">Client</th>
                    <th className="py-3 px-5 font-bold">Due Date</th>
                    <th className="py-3 px-5 text-right font-bold">Total Amount</th>
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
                          {inv.due_date}
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
