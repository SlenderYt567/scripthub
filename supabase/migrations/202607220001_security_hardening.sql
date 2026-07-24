-- Run this migration in the Supabase SQL editor before deploying the client changes.
-- Ensure the intended owner already exists in public.admin_users with role = 'Owner'.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where email = (select email from auth.users where id = auth.uid())
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where email = (select email from auth.users where id = auth.uid())
      and role = 'Owner'
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_owner() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles
add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

drop policy if exists "Admin users are viewable by everyone" on public.admin_users;
drop policy if exists "Admins can insert" on public.admin_users;
drop policy if exists "Admins can delete" on public.admin_users;
create policy "Admins can view admin users" on public.admin_users for select using (public.is_admin());
create policy "Owners can add admins" on public.admin_users for insert with check (public.is_owner());
create policy "Owners can remove admins" on public.admin_users for delete using (public.is_owner() and role <> 'Owner');

drop policy if exists "Only authenticated can insert games" on public.supported_games;
drop policy if exists "Only authenticated can delete games" on public.supported_games;
create policy "Admins can manage games" on public.supported_games for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Authenticated users can create scripts." on public.scripts;
drop policy if exists "Authenticated users can update scripts." on public.scripts;
drop policy if exists "Authenticated users can delete scripts." on public.scripts;
create policy "Users can create their own scripts" on public.scripts for insert to authenticated with check (
  auth.uid() = author_id and verified = false and is_official = false
);
create policy "Authors and admins can update scripts" on public.scripts for update to authenticated using (
  auth.uid() = author_id or public.is_admin()
) with check (auth.uid() = author_id or public.is_admin());
create policy "Authors and admins can delete scripts" on public.scripts for delete to authenticated using (
  auth.uid() = author_id or public.is_admin()
);

create or replace function public.protect_script_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() and (
    new.author_id is distinct from old.author_id or
    new.verified is distinct from old.verified or
    new.is_official is distinct from old.is_official
  ) then
    raise exception 'Only admins can change script ownership or status';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_script_fields on public.scripts;
create trigger protect_script_fields before update on public.scripts
for each row execute function public.protect_script_fields();

drop policy if exists "Authenticated users can create tasks." on public.tasks;
drop policy if exists "Authenticated users can update tasks." on public.tasks;
drop policy if exists "Authenticated users can delete tasks." on public.tasks;
create policy "Authors and admins can manage tasks" on public.tasks for all to authenticated using (
  public.is_admin() or exists (select 1 from public.scripts where scripts.id = tasks.script_id and scripts.author_id = auth.uid())
) with check (
  public.is_admin() or exists (select 1 from public.scripts where scripts.id = tasks.script_id and scripts.author_id = auth.uid())
);

drop policy if exists "Authenticated users can modify executors." on public.executors;
create policy "Admins can manage executors" on public.executors for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Public image access" on storage.objects;
drop policy if exists "Users can upload own images" on storage.objects;
drop policy if exists "Users can update own images" on storage.objects;
drop policy if exists "Users can delete own images" on storage.objects;
create policy "Public image access" on storage.objects for select using (bucket_id = 'images');
create policy "Users can upload own images" on storage.objects for insert to authenticated with check (
  bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "Users can update own images" on storage.objects for update to authenticated using (
  bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text
) with check (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete own images" on storage.objects for delete to authenticated using (
  bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text
);
