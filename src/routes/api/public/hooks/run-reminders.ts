import { createFileRoute } from "@tanstack/react-router";

/**
 * Cron endpoint: every 3 days, chase unpaid invoices whose last reminder is
 * at least 3 days old. Called by a scheduled job.
 */
export const Route = createFileRoute("/api/public/hooks/run-reminders")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { runReminderForInvoice } = await import("@/lib/reminder-runner.server");

        const cutoff = new Date(Date.now() - 3 * 86_400_000).toISOString();
        const today = new Date().toISOString().slice(0, 10);

        const { data: invoices, error } = await supabaseAdmin
          .from("invoices")
          .select("*")
          .in("status", ["awaiting", "overdue"])
          .lte("due_date", today)
          .or(`last_reminder_at.is.null,last_reminder_at.lte.${cutoff}`)
          .limit(100);

        if (error) {
          return Response.json({ ok: false, error: error.message }, { status: 500 });
        }

        let processed = 0;
        for (const invoice of invoices ?? []) {
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("id", invoice.user_id)
            .maybeSingle();
          if (profile && profile.reminders_enabled === false) continue;
          try {
            await runReminderForInvoice(invoice, profile ?? null);
            processed++;
          } catch (e) {
            console.error("reminder failed", invoice.id, e);
          }
        }

        return Response.json({ ok: true, processed, considered: invoices?.length ?? 0 });
      },
    },
  },
});
