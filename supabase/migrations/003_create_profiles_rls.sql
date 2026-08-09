-- Migration 003
-- Allow authenticated InnerMirror users
-- to read only their own profile.

grant select
on table public.profiles
to authenticated;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) = user_id
);