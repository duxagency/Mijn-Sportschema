-- Hardening naar aanleiding van de Supabase-adviseurs.

-- 1. handle_new_user() hoort alleen als trigger te draaien, niet als publiek
--    aanroepbare RPC. EXECUTE intrekken sluit dat aanvalsvlak; de trigger
--    (SECURITY DEFINER) blijft gewoon werken bij registratie.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 2. Indexen op de foreign keys. Helpen o.a. de RLS-policies die via een
--    EXISTS-join naar de bovenliggende tabel controleren.
create index if not exists exercises_created_by_idx
  on public.exercises (created_by);
create index if not exists workouts_user_id_idx
  on public.workouts (user_id);
create index if not exists workout_exercises_exercise_id_idx
  on public.workout_exercises (exercise_id);
create index if not exists sessions_workout_id_idx
  on public.sessions (workout_id);
create index if not exists session_sets_workout_exercise_id_idx
  on public.session_sets (workout_exercise_id);
