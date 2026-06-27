-- Supersets: een oefening kan gecombineerd zijn met de oefening erboven, zodat
-- opeenvolgende oefeningen samen één superset vormen (om en om uitvoeren).
alter table public.workout_exercises
  add column if not exists combined_with_previous boolean not null default false;
