-- Migration 013
-- Create the minimum authenticated InnerMirror data deletion workflow.
--
-- This function deletes learner-owned InnerMirror service data
-- while preserving the Supabase Auth user and the InnerMirror profile.
--
-- Deleted data:
-- - project_events
-- - project-owned reflections
-- - standalone reflections
-- - projects
-- - policy_acceptances
--
-- Preserved:
-- - auth.users
-- - public.profiles
--
-- Long-term deletion orchestration, recovery, retention automation,
-- and account deletion are outside the MVP boundary.


create or replace function public.delete_my_inner_mirror_data()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid;
begin
    current_user_id :=
        auth.uid();

    if current_user_id is null then
        raise exception
            'An authenticated user is required to delete InnerMirror data.';
    end if;


    -- Project Events are explicitly removed first.
    --
    -- Projects also cascade to Project Events,
    -- but the explicit deletion keeps the MVP deletion boundary clear.
    delete from public.project_events
    where user_id = current_user_id;


    -- Delete all learner-owned Reflections.
    --
    -- This includes:
    -- - project-owned Reflections
    -- - standalone Reflections
    delete from public.reflections
    where user_id = current_user_id;


    -- Delete learner-owned Projects.
    delete from public.projects
    where user_id = current_user_id;


    -- Delete Policy Acceptance records so that
    -- a learner starting InnerMirror again must explicitly
    -- accept the current policy version.
    delete from public.policy_acceptances
    where user_id = current_user_id;


    -- The profile is intentionally preserved.
    --
    -- Profile provisioning currently occurs when auth.users
    -- receives a new row. Keeping the profile allows the same
    -- authenticated user to restart InnerMirror without requiring
    -- account reprovisioning.
end;
$$;


revoke all
on function public.delete_my_inner_mirror_data()
from public;


revoke all
on function public.delete_my_inner_mirror_data()
from anon;


grant execute
on function public.delete_my_inner_mirror_data()
to authenticated;