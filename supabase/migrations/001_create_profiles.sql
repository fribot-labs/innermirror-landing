-- Migration 001
-- Create the minimal InnerMirror profile ownership table.

create table public.profiles (

    user_id uuid primary key
        references auth.users(id)
        on delete cascade,

    account_status text not null
        default 'active'
        check (
            account_status in (
                'active',
                'inactive',
                'deletion_pending'
            )
        ),

    last_activity_at timestamptz not null
        default now(),

    created_at timestamptz not null
        default now(),

    updated_at timestamptz not null
        default now()

);

alter table public.profiles
enable row level security;