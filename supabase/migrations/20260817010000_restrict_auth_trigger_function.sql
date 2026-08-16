-- Prevent direct API/RPC execution of the auth bootstrap trigger function.
--
-- The function must remain SECURITY DEFINER so the auth.users trigger can
-- create profile and preference rows, but browser-facing roles should never
-- call it directly through PostgREST RPC.

revoke execute on function public.handle_new_auth_user() from public;
revoke execute on function public.handle_new_auth_user() from anon;
revoke execute on function public.handle_new_auth_user() from authenticated;
