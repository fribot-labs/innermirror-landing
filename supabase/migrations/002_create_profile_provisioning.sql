-- Migration 002
-- Automatically provision one InnerMirror profile
-- when a new Supabase Auth user is created.

create or replace function public.handle_new_inner_mirror_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    user_id
  )
  values (
    new.id
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_inner_mirror_user();