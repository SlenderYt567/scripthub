-- Indexed discovery across the public directory.
alter table public.scripts add column if not exists search_vector tsvector
generated always as (
  to_tsvector('simple'::regconfig,
    coalesce(title, '') || ' ' || coalesce(game_name, '') || ' ' ||
    coalesce(author, '') || ' ' || coalesce(description, ''))
) stored;

create index if not exists scripts_search_vector_idx on public.scripts using gin (search_vector);
create index if not exists scripts_created_at_idx on public.scripts (created_at desc, id desc);
create index if not exists scripts_views_idx on public.scripts (views desc, id desc);
create index if not exists scripts_game_name_idx on public.scripts (game_name);

alter table public.scripts add column if not exists last_verified_at timestamptz;
alter table public.executors add column if not exists last_verified_at timestamptz;

create table if not exists public.link_reports (
  id uuid primary key default gen_random_uuid(),
  script_id uuid references public.scripts(id) on delete cascade,
  executor_id uuid references public.executors(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (char_length(reason) between 10 and 500),
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  constraint link_reports_exactly_one_target check (num_nonnulls(script_id, executor_id) = 1)
);

create unique index if not exists link_reports_open_script_idx
  on public.link_reports (reporter_id, script_id)
  where status = 'open' and script_id is not null;
create unique index if not exists link_reports_open_executor_idx
  on public.link_reports (reporter_id, executor_id)
  where status = 'open' and executor_id is not null;
create index if not exists link_reports_review_queue_idx
  on public.link_reports (status, created_at desc);

alter table public.link_reports enable row level security;
create policy "Reporters and admins can view reports" on public.link_reports
for select to authenticated
using (reporter_id = (select auth.uid()) or (select public.is_admin()));
create policy "Users can report a link" on public.link_reports
for insert to authenticated
with check (
  reporter_id = (select auth.uid())
  and status = 'open' and reviewed_at is null and reviewed_by is null
);
create policy "Admins can review reports" on public.link_reports
for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

-- A user cannot claim a fresh verification timestamp by editing their script.
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
    new.is_official is distinct from old.is_official or
    new.last_verified_at is distinct from old.last_verified_at
  ) then
    raise exception 'Only admins can change script ownership or status';
  end if;
  return new;
end;
$$;

revoke execute on function public.protect_script_fields() from public, anon, authenticated;
