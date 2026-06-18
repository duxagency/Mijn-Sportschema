-- Laat een gebruiker zijn eigen profielrij aanmaken (naast de signup-trigger).
-- Hierdoor kan het bijwerken van de naam als upsert werken, ook als de rij
-- ontbreekt (bv. accounts van vóór de trigger).
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);
