import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Input = z.object({ invoiceId: z.string().uuid() });

/** Drafts an AI reminder for one invoice and sends it on every available channel. */
export const sendReminderNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { runReminderForInvoice } = await import("./reminder-runner.server");

    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", data.invoiceId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!invoice) throw new Error("Invoice not found");

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    return runReminderForInvoice(invoice, profile ?? null);
  });
