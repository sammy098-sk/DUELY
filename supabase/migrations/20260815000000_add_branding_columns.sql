-- Add missing branding columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_logo_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS signature_url TEXT DEFAULT '';
