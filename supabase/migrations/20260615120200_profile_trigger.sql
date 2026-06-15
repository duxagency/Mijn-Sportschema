-- Maak automatisch een profiles-rij aan zodra een gebruiker registreert.
-- De functie draait als SECURITY DEFINER zodat ze de RLS op profiles mag
-- omzeilen. We zetten een leeg search_path zodat de functie niet door
-- onverwachte schema's beïnvloed kan worden.

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    -- display_name komt mee als user-metadata bij het registreren.
    -- Valt terug op het deel van het e-mailadres vóór de @ als het ontbreekt.
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
