-- Optionele startdata voor de gedeelde oefeningenbibliotheek.
-- created_by blijft null: dit zijn systeemoefeningen zonder eigenaar.
-- Wordt automatisch toegepast door `supabase db reset` (lokaal).

insert into public.exercises (name, tracks_weight, tracks_reps, tracks_time, tracks_distance)
values
  -- Algemeen / cardio
  ('Squat',            true,  true,  false, false),
  ('Deadlift',         true,  true,  false, false),
  ('Bench press',      true,  true,  false, false),
  ('Overhead press',   true,  true,  false, false),
  ('Pull-up',          false, true,  false, false),
  ('Plank',            false, false, true,  false),
  ('Hardlopen',        false, false, true,  true),
  ('Roeien',           false, false, true,  true),

  -- Krachttraining met gewichten (gewicht + reps)
  ('Back squat',       true,  true,  false, false),
  ('Lat pulldown',     true,  true,  false, false),
  ('Tricep extensions',true,  true,  false, false),
  ('Bicep curl',       true,  true,  false, false),

  -- Calisthenics duwen (reps; gewicht optioneel bij dips)
  ('Push-ups',         false, true,  false, false),
  ('Dips',             true,  true,  false, false),
  ('Pike push-ups',    false, true,  false, false),
  ('Handstand push-ups', false, true, false, false),
  ('Diamond push-ups', false, true,  false, false),

  -- Calisthenics trekken (reps; gewicht optioneel bij pull-ups)
  ('Pull-ups',         true,  true,  false, false),
  ('Chin-ups',         false, true,  false, false),
  ('Inverted rows (Australian pull-ups)', false, true, false, false),
  ('Muscle-ups',       false, true,  false, false),

  -- Calisthenics benen (reps)
  ('Bodyweight squats',     false, true, false, false),
  ('Pistol squats',         false, true, false, false),
  ('Bulgarian split squats',false, true, false, false),
  ('Walking lunges',        false, true, false, false),
  ('Calf raises',           false, true, false, false)
on conflict do nothing;
