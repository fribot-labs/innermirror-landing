-- Migration 010
-- Ensure one canonical InnerMirror project per user and GitHub repository.

create unique index
projects_user_repository_unique
on public.projects (
    user_id,
    repository_id
)
where repository_id is not null;