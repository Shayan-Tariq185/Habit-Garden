-- Fix: grant table-level access to the `authenticated` role.
--
-- This is needed because "Automatically expose new tables" was turned off
-- when the project was created (a reasonable security choice — it means new
-- tables start locked down instead of open by default). But it also means
-- the standard grants that let logged-in users touch a table at all were
-- never applied to `habits`. Row Level Security policies (already in place)
-- control WHICH rows a user can see; these GRANTs control whether the
-- `authenticated` role can interact with the table AT ALL. Both layers are
-- required together.

grant select, insert, update, delete on public.habits to authenticated;

-- Also grant usage on the sequence/default if needed for the id column
-- (safe to run even if not strictly required for uuid defaults).
grant usage on schema public to authenticated;
