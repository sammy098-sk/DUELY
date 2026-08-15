import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { formatMoney, getCurrencySymbol, type InvoiceRecord } from "@/lib/invoice";
import { TrendingUp, Loader2, Calendar, AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ForecastPeriod {
  label: string;
  amount: number;
  count: number;
}

export default function RevenueForecastPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [forecastData, setForecastData] = useState<ForecastPeriod[]>([]);
  const [totalProjected, setTotalProjected] = useState(0);
  const [overdueAmount, setOverdueAmount] = useState(0);

  useEffect(() => {
    if (!user) return;

    async function loadForecast() {
      setLoading(true);
      setError(null);

      try {
        // Fetch user default currency from profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("default_currency")
          .eq("id", user.id)
          .maybeSingle();

        const userCurrency = profile?.default_currency || "USD";
        setCurrency(userCurrency);

        // Query real unpaid invoices (sent, awaiting, overdue) with due dates
        const { data: invoices, error: fetchError } = await supabase
          .from("invoices")
          .select("*")
          .eq("user_id", user.id)
          .in("status", ["sent", "awaiting", "overdue"]);

        if (fetchError) throw fetchError;

        const validInvoices = (invoices as InvoiceRecord[] || []).filter(
          (inv) => inv.due_date && inv.status !== "draft" && inv.status !== "paid"
        );

        if (validInvoices.length === 0) {
          setForecastData([]);
          setTotalProjected(0);
          setOverdueAmount(0);
          setLoading(false);
          return;
        }

        let total = 0;
        let overdueSum = 0;
        const now = new Date();

        // Grouping by relative timeline periods: Overdue, Week 1, Week 2, Week 3, Week 4, Later
        const periodMap: Record<string, { amount: number; count: number }> = {
          "Overdue": { amount: 0, count: 0 },
          "Week 1": { amount: 0, count: 0 },
          "Week 2": { amount: 0, count: 0 },
          "Week 3": { amount: 0, count: 0 },
          "Week 4": { amount: 0, count: 0 },
          "Later": { amount: 0, count: 0 },
        };

        validInvoices.forEach((inv) => {
          const invTotal = Number(inv.total) || 0;
          total += invTotal;

          const dueDate = new Date(`${inv.due_date}T00:00:00Z`);
          const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / 86_400_000);

          if (diffDays < 0 || inv.status === "overdue") {
            overdueSum += invTotal;
            periodMap["Overdue"].amount += invTotal;
            periodMap["Overdue"].count += 1;
          } else if (diffDays <= 7) {
            periodMap["Week 1"].amount += invTotal;
            periodMap["Week 1"].count += 1;
          } else if (diffDays <= 14) {
            periodMap["Week 2"].amount += invTotal;
            periodMap["Week 2"].count += 1;
          } else if (diffDays <= 21) {
            periodMap["Week 3"].amount += invTotal;
            periodMap["Week 3"].count += 1;
          } else if (diffDays <= 28) {
            periodMap["Week 4"].amount += invTotal;
            periodMap["Week 4"].count += 1;
          } else {
            periodMap["Later"].amount += invTotal;
            periodMap["Later"].count += 1;
          }
        });

        const formattedChartData: ForecastPeriod[] = Object.keys(periodMap)
          .filter((key) => periodMap[key].amount > 0 || periodMap[key].count > 0)
          .map((key) => ({
            label: key,
            amount: periodMap[key].amount,
            count: periodMap[key].count,
          }));

        setTotalProjected(total);
        setOverdueAmount(overdueSum);
        setForecastData(formattedChartData);
      } catch (err: any) {
        console.error("Failed to load revenue forecast:", err);
        setError(err.message || "Failed to load forecast data.");
      } finally {
        setLoading(false);
      }
    }

    loadForecast();
  }, [user]);

  return (
    <AppShell pageTitle="Revenue Forecast">
      <div className="flex-1 p-4 lg:p-8 bg-background">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header Bar */}
          <div>
            <h1 className="font-serif text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
              Revenue Forecast
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              See what revenue is expected from your outstanding invoices.
            </p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="rounded-2xl border border-border/80 bg-card p-12 text-center shadow-paper flex flex-col items-center justify-center gap-3">
              <Loader2 className="size-6 text-primary animate-spin" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Calculating projected revenue…
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-center space-y-2">
              <AlertCircle className="size-6 text-destructive mx-auto" />
              <p className="text-xs font-bold text-destructive">{error}</p>
            </div>
          ) : forecastData.length === 0 ? (
            /* Clean Empty State */
            <div className="rounded-2xl border border-border/80 bg-card p-8 sm:p-12 text-center shadow-paper space-y-4">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <TrendingUp className="size-7 text-primary" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h2 className="font-serif text-lg font-bold text-foreground">
                  No projected revenue yet
                </h2>
                <p className="text-xs text-muted-foreground">
                  Revenue projections will appear here when you have unpaid invoices with due dates.
                </p>
              </div>
            </div>
          ) : (
            /* Populated State with Real Supabase Data */
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-paper space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <TrendingUp className="size-4 text-emerald-500" />
                    <span>Total Projected Revenue</span>
                  </div>
                  <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
                    {formatMoney(totalProjected, currency)}
                  </p>
                  <p className="text-2xs text-muted-foreground">
                    Expected from active &amp; overdue invoices
                  </p>
                </div>

                <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-paper space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Calendar className="size-4 text-amber-500" />
                    <span>Overdue Invoices Amount</span>
                  </div>
                  <p className="font-mono text-2xl font-bold tracking-tight text-foreground">
                    {formatMoney(overdueAmount, currency)}
                  </p>
                  <p className="text-2xs text-muted-foreground">
                    Requires follow-up chasing
                  </p>
                </div>
              </div>

              {/* Responsive Recharts Bar Chart */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-paper space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-foreground">
                    Projected Cash Flow Timeline
                  </h3>
                  <span className="font-mono text-xs text-muted-foreground font-semibold">
                    Currency: {currency} ({getCurrencySymbol(currency)})
                  </span>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "currentColor" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "currentColor" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => `${getCurrencySymbol(currency)}${val}`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as ForecastPeriod;
                            return (
                              <div className="rounded-lg border border-border bg-card p-3 shadow-lg text-xs space-y-1">
                                <p className="font-bold text-foreground">{data.label}</p>
                                <p className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                                  {formatMoney(data.amount, currency)}
                                </p>
                                <p className="text-muted-foreground text-2xs">
                                  {data.count} invoice{data.count !== 1 ? "s" : ""}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                        {forecastData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.label === "Overdue"
                                ? "#f59e0b"
                                : "#10b981"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Breakdown List */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-paper space-y-3">
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-foreground border-b border-border/60 pb-2">
                  Period Breakdown
                </h3>
                <div className="divide-y divide-border/40 text-xs">
                  {forecastData.map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`size-2 rounded-full ${
                            item.label === "Overdue" ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                        />
                        <span className="font-semibold text-foreground">{item.label}</span>
                        <span className="text-muted-foreground text-2xs">
                          ({item.count} invoice{item.count !== 1 ? "s" : ""})
                        </span>
                      </div>
                      <span className="font-mono font-bold text-foreground">
                        {formatMoney(item.amount, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
