-- Habit Garden — Supabase schema
-- Run this once in the Supabase SQL Editor (Settings → SQL Editor → New Query)

-- 1. The habits table.
-- Note: Supabase's built-in `auth.users` table already handles accounts,
-- so we don't create our own users table — we just reference auth.users.id.
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default 'General',
  frequency text not null default 'Daily',
  reminder_time text not null default '08:00',
  plant_type text not null default 'sunflower',
  streak integer not null default 0,
  total_completions integer not null default 0,
  completed_dates text[] not null default '{}',
  note text default '',
  created_at timestamptz not null default now()
);

-- 2. Index so "give me this user's habits" queries stay fast as the table grows.
create index if not exists habits_user_id_idx on public.habits(user_id);

-- 3. Turn on Row Level Security — without this, RLS policies below do nothing
-- and (depending on your project defaults) the table could be wide open.
alter table public.habits enable row level security;

-- 4. Policies: a user can only ever see/edit/delete their OWN rows.
-- This is enforced by Postgres itself, not by your app's code — so even if
-- someone crafts a raw API call, they physically cannot read anyone else's data.

create policy "Users can view their own habits"
  on public.habits for select
  using (auth.uid() = user_id);

create policy "Users can insert their own habits"
  on public.habits for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own habits"
  on public.habits for update
  using (auth.uid() = user_id);

create policy "Users can delete their own habits"
  on public.habits for delete
  using (auth.uid() = user_id);
