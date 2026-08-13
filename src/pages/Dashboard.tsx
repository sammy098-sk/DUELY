import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StampBadge } from "@/components/StampBadge";
import { supabase } from "@/integrations/supabase/client";
import { effectiveStatus, formatMoney, type InvoiceRecord } from "@/lib/invoice";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
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

  const stats = [
    { label: "Outstanding", value: sum((i) => i.eff === "awaiting" || i.eff === "overdue") },
    { label: "Overdue", value: sum((i) => i.eff === "overdue"), alert: true },
    { label: "Paid", value: sum((i) => i.eff === "paid") },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl">The ledger</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Duely checks unpaid invoices every 3 days and follows up for you.
            </p>
          </div>
          <Button asChild>
            <Link to="/invoices/new">
              <Plus className="size-4" /> New invoice
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="ledger-panel p-5">
              <p className="label-caps">{s.label}</p>
              <p
                className={
                  s.alert
                    ? "money mt-2 text-3xl text-stamp-overdue"
                    : "money mt-2 text-3xl text-foreground"
                }
              >
                {formatMoney(s.value, currency)}
              </p>
            </div>
          ))}
        </div>

        <div className="ledger-panel overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <p className="label-caps">Invoices</p>
          </div>
          {isLoading ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">Loading…</p>
          ) : withStatus.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="font-serif text-xl">No entries yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Write your first invoice and Duely takes it from there.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {withStatus.map((inv) => (
                <li key={inv.id}>
                  <Link
                    to={`/invoices/${inv.id}`}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 transition-colors hover:bg-accent/40"
                  >
                    <span className="money w-32 text-xs text-muted-foreground">{inv.number}</span>
                    <span className="min-w-40 flex-1 font-medium">
                      {inv.client_name || "Unnamed client"}
                    </span>
                    <span className="label-caps w-28">due {inv.due_date}</span>
                    <span className="money w-28 text-right">
                      {formatMoney(Number(inv.total), inv.currency)}
                    </span>
                    <span className="w-24 text-right">
                      <StampBadge status={inv.eff} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
