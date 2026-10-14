-- Repair owner permissions and allow administrators to publish verified scripts.
grant execute on function public.is_owner() to authenticated;

drop policy if exists "Users can create their own scripts" on public.scripts;
create policy "Users and admins can create scripts" on public.scripts
for insert to authenticated
with check (
  (select auth.uid()) = author_id
  and (
    (verified = false and is_official = false)
    or (select public.is_admin())
  )
);

create or replace function public.protect_script_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select username into new.author
  from public.profiles where id = new.author_id;
  if new.author is null then
    raise exception 'Author profile is missing';
  end if;
  new.views := 0;
  return new;
end;
$$;

revoke all on function public.protect_script_insert() from public;
drop trigger if exists protect_script_insert on public.scripts;
create trigger protect_script_insert
before insert on public.scripts
for each row execute function public.protect_script_insert();

create or replace function public.protect_script_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() and (
    new.author_id is distinct from old.author_id or
    new.author is distinct from old.author or
    new.views is distinct from old.views or
    new.verified is distinct from old.verified or
    new.is_official is distinct from old.is_official
  ) then
    raise exception 'Only admins can change script ownership or status';
  end if;
  return new;
end;
$$;

-- Every authenticated author needs a profile before scripts.author_id can reference it.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(nullif(split_part(new.email, '@', 1), ''), 'user') || '-' || replace(new.id::text, '-', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
drop trigger if exists create_user_profile on auth.users;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, username)
select u.id,
       coalesce(nullif(split_part(u.email, '@', 1), ''), 'user') || '-' || replace(u.id::text, '-', '')
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- One RPC call means a failed task insert rolls back the script changes too.
create or replace function public.save_script(
  p_script_id uuid,
  p_payload jsonb,
  p_tasks jsonb
)
returns public.scripts
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_script public.scripts;
  v_task jsonb;
  v_profile public.profiles;
  v_admin boolean;
begin
  if (select auth.uid()) is null then
    raise exception 'Sign in to publish a script';
  end if;
  if jsonb_typeof(p_tasks) is distinct from 'array' then
    raise exception 'Tasks must be an array';
  end if;

  select * into v_profile from public.profiles where id = (select auth.uid());
  if not found then
    raise exception 'User profile is missing';
  end if;
  v_admin := (select public.is_admin());

  if p_script_id is null then
    insert into public.scripts (
      title, game_name, description, image_url, author, author_id,
      raw_link, shortener_link, verified, is_official, key_system
    ) values (
      p_payload->>'title', p_payload->>'game_name', p_payload->>'description',
      p_payload->>'image_url', v_profile.username, (select auth.uid()),
      p_payload->>'raw_link', p_payload->>'shortener_link',
      case when v_admin then coalesce((p_payload->>'verified')::boolean, false) else false end,
      case when v_admin then coalesce((p_payload->>'is_official')::boolean, false) else false end,
      coalesce((p_payload->>'key_system')::boolean, false)
    ) returning * into v_script;
  else
    update public.scripts s set
      title = p_payload->>'title',
      game_name = p_payload->>'game_name',
      description = p_payload->>'description',
      image_url = p_payload->>'image_url',
      raw_link = p_payload->>'raw_link',
      shortener_link = p_payload->>'shortener_link',
      verified = case when v_admin then coalesce((p_payload->>'verified')::boolean, s.verified) else s.verified end,
      is_official = case when v_admin then coalesce((p_payload->>'is_official')::boolean, s.is_official) else s.is_official end,
      key_system = coalesce((p_payload->>'key_system')::boolean, false)
    where s.id = p_script_id
    returning * into v_script;
    if not found then
      raise exception 'Script not found or editing is not allowed';
    end if;
  end if;

  delete from public.tasks where script_id = v_script.id;
  for v_task in select value from jsonb_array_elements(p_tasks)
  loop
    insert into public.tasks (script_id, type, url, text)
    values (v_script.id, v_task->>'type', v_task->>'url', v_task->>'text');
  end loop;
  return v_script;
end;
$$;

revoke all on function public.save_script(uuid, jsonb, jsonb) from public;
grant execute on function public.save_script(uuid, jsonb, jsonb) to authenticated;
