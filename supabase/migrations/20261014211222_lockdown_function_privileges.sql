-- Supabase may grant EXECUTE directly to API roles through default privileges.
-- Revoking only from PUBLIC does not remove those direct grants.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_script_insert() from public, anon, authenticated;
revoke execute on function public.protect_script_fields() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_owner() from public, anon;
revoke execute on function public.save_script(uuid, jsonb, jsonb) from public, anon;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_owner() to authenticated;
grant execute on function public.save_script(uuid, jsonb, jsonb) to authenticated;
