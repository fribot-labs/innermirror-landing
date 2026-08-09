-- Migration 009
-- Allow learner-owned Reflections without an active Project association.

alter table public.reflections
alter column project_id drop not null;
