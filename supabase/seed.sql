-- Optionele startdata voor de gedeelde oefeningenbibliotheek.
-- created_by blijft null: dit zijn systeemoefeningen zonder eigenaar.
-- Wordt automatisch toegepast door `supabase db reset` (lokaal).

insert into public.exercises (name, category, tracks_weight, tracks_reps, tracks_time, tracks_distance)
values
  -- Algemeen / cardio
  ('Squat',            'kracht', true,  true,  false, false),
  ('Deadlift',         'kracht', true,  true,  false, false),
  ('Plank',            'overig', false, false, true,  false),
  ('Hardlopen',        'cardio', false, false, true,  true),
  ('Roeien',           'cardio', false, false, true,  true),

  -- Krachttraining met gewichten (gewicht + reps)
  ('Back squat',       'kracht', true,  true,  false, false),
  ('Bench press',      'kracht', true,  true,  false, false),
  ('Overhead press',   'kracht', true,  true,  false, false),
  ('Lat pulldown',     'kracht', true,  true,  false, false),
  ('Tricep extensions','kracht', true,  true,  false, false),
  ('Bicep curl',       'kracht', true,  true,  false, false),

  -- Calisthenics duwen (reps; gewicht optioneel bij dips)
  ('Push-ups',         'push',   false, true,  false, false),
  ('Dips',             'push',   true,  true,  false, false),
  ('Pike push-ups',    'push',   false, true,  false, false),
  ('Handstand push-ups', 'push', false, true,  false, false),
  ('Diamond push-ups', 'push',   false, true,  false, false),

  -- Calisthenics trekken (reps; gewicht optioneel bij pull-ups)
  ('Pull-ups',         'pull',   true,  true,  false, false),
  ('Chin-ups',         'pull',   false, true,  false, false),
  ('Inverted rows (Australian pull-ups)', 'pull', false, true, false, false),
  ('Muscle-ups',       'pull',   false, true,  false, false),

  -- Calisthenics benen (reps)
  ('Bodyweight squats',     'benen', false, true, false, false),
  ('Pistol squats',         'benen', false, true, false, false),
  ('Bulgarian split squats','benen', false, true, false, false),
  ('Walking lunges',        'benen', false, true, false, false),
  ('Calf raises',           'benen', false, true, false, false)
on conflict do nothing;
