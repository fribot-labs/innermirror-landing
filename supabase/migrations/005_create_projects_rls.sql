-- Migration 005
-- Enforce authenticated ownership access for learner-owned projects.

revoke all
on table public.projects
from anon;

revoke truncate, references, trigger
on table public.projects
from authenticated;

grant select, insert, update, delete
on table public.projects
to authenticated;

create policy "projects_select_own"
on public.projects
for select
to authenticated
using (
    (select auth.uid()) = user_id
);

create policy "projects_insert_own"
on public.projects
for insert
to authenticated
with check (
    (select auth.uid()) = user_id
);

create policy "projects_update_own"
on public.projects
for update
to authenticated
using (
    (select auth.uid()) = user_id
)
with check (
    (select auth.uid()) = user_id
);

create policy "projects_delete_own"
on public.projects
for delete
to authenticated
using (
    (select auth.uid()) = user_id
);
