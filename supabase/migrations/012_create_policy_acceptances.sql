-- Migration 012
-- Create minimal learner-owned policy acceptance records.
--
-- Policy Acceptances record which policy version
-- an authenticated InnerMirror user explicitly accepted.
--
-- This table stores acceptance evidence only.
-- Policy document content and policy management are
-- outside the MVP persistence boundary.

create table public.policy_acceptances (

    id uuid primary key
        default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(user_id)
        on delete cascade,

    policy_type text not null
        check (
            length(trim(policy_type)) > 0
        ),

    policy_version text not null
        check (
            length(trim(policy_version)) > 0
        ),

    accepted_at timestamptz not null
        default now(),

    created_at timestamptz not null
        default now(),

    constraint policy_acceptances_user_policy_version_unique
        unique (
            user_id,
            policy_type,
            policy_version
        )
);


create index
policy_acceptances_user_id_accepted_at_idx
on public.policy_acceptances (
    user_id,
    accepted_at desc
);


alter table public.policy_acceptances
enable row level security;


revoke all
on table public.policy_acceptances
from anon;


revoke all
on table public.policy_acceptances
from authenticated;


grant select, insert
on table public.policy_acceptances
to authenticated;


create policy "policy_acceptances_select_own"
on public.policy_acceptances
for select
to authenticated
using (
    (select auth.uid()) = user_id
);


create policy "policy_acceptances_insert_own"
on public.policy_acceptances
for insert
to authenticated
with check (
    (select auth.uid()) = user_id
);