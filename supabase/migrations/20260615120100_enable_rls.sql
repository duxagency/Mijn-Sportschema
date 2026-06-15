-- Row level security voor het volledige datamodel.
-- Standaard: zodra RLS aan staat is alles geblokkeerd tenzij een policy het toestaat.

alter table public.profiles          enable row level security;
alter table public.exercises         enable row level security;
alter table public.workouts          enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.sessions          enable row level security;
alter table public.session_sets      enable row level security;

-- ---------------------------------------------------------------------------
-- profiles: een gebruiker leest en bewerkt alleen zijn eigen profiel.
-- (Aanmaken gebeurt via de security-definer trigger, niet door de client.)
-- ---------------------------------------------------------------------------
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ---------------------------------------------------------------------------
-- exercises: de bibliotheek is volledig gedeeld. Elke ingelogde gebruiker
-- mag lezen, aanmaken, wijzigen en verwijderen.
-- ---------------------------------------------------------------------------
create policy "exercises_select_authenticated"
  on public.exercises for select
  to authenticated
  using (true);

create policy "exercises_insert_authenticated"
  on public.exercises for insert
  to authenticated
  with check (true);

create policy "exercises_update_authenticated"
  on public.exercises for update
  to authenticated
  using (true)
  with check (true);

create policy "exercises_delete_authenticated"
  on public.exercises for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- workouts: een gebruiker ziet en bewerkt alleen zijn eigen schema's.
-- ---------------------------------------------------------------------------
create policy "workouts_select_own"
  on public.workouts for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "workouts_insert_own"
  on public.workouts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "workouts_update_own"
  on public.workouts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "workouts_delete_own"
  on public.workouts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- workout_exercises: toegang loopt via het bovenliggende schema.
-- ---------------------------------------------------------------------------
create policy "workout_exercises_select_own"
  on public.workout_exercises for select
  to authenticated
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_exercises.workout_id
        and w.user_id = (select auth.uid())
    )
  );

create policy "workout_exercises_insert_own"
  on public.workout_exercises for insert
  to authenticated
  with check (
    exists (
      select 1 from public.workouts w
      where w.id = workout_exercises.workout_id
        and w.user_id = (select auth.uid())
    )
  );

create policy "workout_exercises_update_own"
  on public.workout_exercises for update
  to authenticated
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_exercises.workout_id
        and w.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.workouts w
      where w.id = workout_exercises.workout_id
        and w.user_id = (select auth.uid())
    )
  );

create policy "workout_exercises_delete_own"
  on public.workout_exercises for delete
  to authenticated
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_exercises.workout_id
        and w.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- sessions: een gebruiker ziet en bewerkt alleen zijn eigen sessies.
-- ---------------------------------------------------------------------------
create policy "sessions_select_own"
  on public.sessions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "sessions_insert_own"
  on public.sessions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "sessions_update_own"
  on public.sessions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "sessions_delete_own"
  on public.sessions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- session_sets: toegang loopt via de bovenliggende sessie.
-- ---------------------------------------------------------------------------
create policy "session_sets_select_own"
  on public.session_sets for select
  to authenticated
  using (
    exists (
      select 1 from public.sessions s
      where s.id = session_sets.session_id
        and s.user_id = (select auth.uid())
    )
  );

create policy "session_sets_insert_own"
  on public.session_sets for insert
  to authenticated
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = session_sets.session_id
        and s.user_id = (select auth.uid())
    )
  );

create policy "session_sets_update_own"
  on public.session_sets for update
  to authenticated
  using (
    exists (
      select 1 from public.sessions s
      where s.id = session_sets.session_id
        and s.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = session_sets.session_id
        and s.user_id = (select auth.uid())
    )
  );

create policy "session_sets_delete_own"
  on public.session_sets for delete
  to authenticated
  using (
    exists (
      select 1 from public.sessions s
      where s.id = session_sets.session_id
        and s.user_id = (select auth.uid())
    )
  );
