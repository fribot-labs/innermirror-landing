-- Migration 007
-- Enforce authenticated ownership access for learner-owned reflections.

revoke all
on table public.reflections
from anon;

revoke truncate, references, trigger
on table public.reflections
from authenticated;

grant select, insert, update, delete
on table public.reflections
to authenticated;

create policy "reflections_select_own"
on public.reflections
for select
to authenticated
using (
    (select auth.uid()) = user_id
);

create policy "reflections_insert_own"
on public.reflections
for insert
to authenticated
with check (
    (select auth.uid()) = user_id
);

create policy "reflections_update_own"
on public.reflections
for update
to authenticated
using (
    (select auth.uid()) = user_id
)
with check (
    (select auth.uid()) = user_id
);

create policy "reflections_delete_own"
on public.reflections
for delete
to authenticated
using (
    (select auth.uid()) = user_id
);
