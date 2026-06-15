-- Optionele startdata voor de gedeelde oefeningenbibliotheek.
-- created_by blijft null: dit zijn systeemoefeningen zonder eigenaar.
-- Wordt automatisch toegepast door `supabase db reset` (lokaal).

insert into public.exercises (name, tracks_weight, tracks_reps, tracks_time, tracks_distance)
values
  ('Squat',            true,  true,  false, false),
  ('Deadlift',         true,  true,  false, false),
  ('Bench press',      true,  true,  false, false),
  ('Overhead press',   true,  true,  false, false),
  ('Pull-up',          false, true,  false, false),
  ('Plank',            false, false, true,  false),
  ('Hardlopen',        false, false, true,  true),
  ('Roeien',           false, false, true,  true)
on conflict do nothing;
