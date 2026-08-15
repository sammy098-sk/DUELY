-- Make due_date column nullable on invoices table to support paid status (due_date = null)
ALTER TABLE public.invoices
  ALTER COLUMN due_date DROP NOT NULL;
