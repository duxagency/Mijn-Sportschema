-- Rusttijd (in seconden) per oefening binnen een schema. Wordt tijdens de
-- training als snelkoppeling in de rust-timer gebruikt.
alter table public.workout_exercises
  add column if not exists rest_seconds integer;
