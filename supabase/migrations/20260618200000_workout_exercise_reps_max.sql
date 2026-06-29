-- Rep-range als target: target_reps is de ondergrens, target_reps_max de
-- bovengrens. Beide gezet → "6–10 reps"; alleen target_reps → één waarde.
alter table public.workout_exercises
  add column if not exists target_reps_max integer;
