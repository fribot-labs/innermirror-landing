-- Migration 004
-- Create the learner-owned InnerMirror project continuity table.

create table public.projects (

    id uuid primary key
        default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(user_id)
        on delete cascade,

    name text not null,

    repository_id text,

    repository_owner text,

    repository_name text,

    template_id text,

    course_id text,

    current_focus text,

    status text not null
        default 'active'
        check (
            status in (
                'active',
                'paused',
                'completed'
            )
        ),

    started_at timestamptz,

    created_at timestamptz not null
        default now(),

    updated_at timestamptz not null
        default now()

);

alter table public.projects
enable row level security;