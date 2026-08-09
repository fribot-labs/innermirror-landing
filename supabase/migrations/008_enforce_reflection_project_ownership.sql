-- Migration 008
-- Enforce ownership consistency between Reflections and their Projects.

alter table public.projects
add constraint projects_id_user_id_unique
unique (id, user_id);

alter table public.reflections
add constraint reflections_project_user_fkey
foreign key (project_id, user_id)
references public.projects(id, user_id)
on delete cascade;
