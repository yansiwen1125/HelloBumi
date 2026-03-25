-- Run in Supabase: SQL Editor → New query → Run once.
create table if not exists public.waitlist_submissions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  constraint waitlist_submissions_email_key unique (email)
);

alter table public.waitlist_submissions enable row level security;

-- Rows are inserted only via service role from Vercel (/api/submit), which bypasses RLS.
-- Optional: add a read policy for authenticated admins only if you query from the app.
