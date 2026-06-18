-- Self-service account verwijderen. De gewone client mag auth.users niet
-- aanraken, dus een SECURITY DEFINER-functie die uitsluitend de ingelogde
-- gebruiker (auth.uid()) verwijdert. Alle eigen data (profiles, workouts,
-- sessions, ...) verdwijnt mee via ON DELETE CASCADE.
create or replace function public.delete_user()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = (select auth.uid());
$$;

-- Alleen ingelogde gebruikers mogen dit aanroepen (en dan enkel voor zichzelf).
revoke execute on function public.delete_user() from public, anon;
grant execute on function public.delete_user() to authenticated;
