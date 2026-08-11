-- Migration 011
-- Create learner-owned canonical Project lifecycle event history.
--
-- Reflections preserve learner thinking.
-- Project Events preserve structural Project state transitions.

create table public.project_events (

    id uuid primary key
        default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(user_id)
        on delete cascade,

    project_id uuid not null,

    event_type text not null
        check (
            length(trim(event_type)) > 0
        ),

    event_data jsonb not null
        default '{}'::jsonb
        check (
            jsonb_typeof(event_data) = 'object'
        ),

    occurred_at timestamptz not null
        default now(),

    created_at timestamptz not null
        default now(),

    constraint project_events_project_user_fkey
        foreign key (
            project_id,
            user_id
        )
        references public.projects(
            id,
            user_id
        )
        on delete cascade

);

create index
project_events_project_id_occurred_at_idx
on public.project_events (
    project_id,
    occurred_at desc
);

create index
project_events_user_id_occurred_at_idx
on public.project_events (
    user_id,
    occurred_at desc
);

alter table public.project_events
enable row level security;

revoke all
on table public.project_events
from anon;

revoke all
on table public.project_events
from authenticated;

grant select, insert
on table public.project_events
to authenticated;

create policy "project_events_select_own"
on public.project_events
for select
to authenticated
using (
    (select auth.uid()) = user_id
);

create policy "project_events_insert_own"
on public.project_events
for insert
to authenticated
with check (
    (select auth.uid()) = user_id
);
