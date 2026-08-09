-- Migration 006
-- Create the minimal learner-owned InnerMirror reflection persistence table.

create table public.reflections (

    id uuid primary key
        default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(user_id)
        on delete cascade,

    project_id uuid not null
        references public.projects(id)
        on delete cascade,

    content text not null,

    source text,

    created_at timestamptz not null
        default now(),

    updated_at timestamptz not null
        default now()

);

alter table public.reflections
enable row level security;
