-- Fase 1: volledig datamodel voor Mijn Sportschema.
-- Alle tabellen worden nu aangelegd, ook die pas in latere fasen gebruikt worden.

-- Profielen: 1-op-1 met auth.users. De rij wordt automatisch aangemaakt
-- door een trigger (zie aparte migration) zodra een gebruiker registreert.
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  created_at   timestamptz not null default now()
);

-- Gedeelde oefeningenbibliotheek. Welke metrics een oefening bijhoudt,
-- leggen we vast met booleans.
create table public.exercises (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  created_by      uuid references auth.users (id) on delete set null,
  tracks_weight   boolean not null default false,
  tracks_reps     boolean not null default false,
  tracks_time     boolean not null default false,
  tracks_distance boolean not null default false,
  created_at      timestamptz not null default now()
);

-- Een trainingsschema, hoort bij één gebruiker.
create table public.workouts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);

-- Een oefening binnen een schema. De target-velden zijn nullable, want
-- niet elke oefening houdt elke metric bij.
create table public.workout_exercises (
  id              uuid primary key default gen_random_uuid(),
  workout_id      uuid not null references public.workouts (id) on delete cascade,
  exercise_id     uuid not null references public.exercises (id) on delete restrict,
  position        integer not null,
  target_sets     integer,
  target_reps     integer,
  target_weight   numeric,
  target_minutes  numeric,
  target_distance numeric
);

create index workout_exercises_workout_id_idx on public.workout_exercises (workout_id);

-- Een uitgevoerde training (een sessie van een schema).
create table public.sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  workout_id  uuid not null references public.workouts (id) on delete cascade,
  started_at  timestamptz not null default now(),
  finished_at timestamptz
);

create index sessions_user_id_idx on public.sessions (user_id);

-- Eén ingevoerde set tijdens een sessie. De meetvelden zijn nullable.
create table public.session_sets (
  id                  uuid primary key default gen_random_uuid(),
  session_id          uuid not null references public.sessions (id) on delete cascade,
  workout_exercise_id uuid not null references public.workout_exercises (id) on delete cascade,
  set_number          integer not null,
  reps                integer,
  weight              numeric,
  minutes             numeric,
  distance            numeric
);

create index session_sets_session_id_idx on public.session_sets (session_id);
