-- Notitie per oefening binnen een schema. Hangt aan de workout_exercise,
-- dus de notitie blijft bij dat schema en komt terug bij elke training ervan.
-- Een nieuw schema krijgt verse (lege) notities.
alter table public.workout_exercises
  add column if not exists note text;
