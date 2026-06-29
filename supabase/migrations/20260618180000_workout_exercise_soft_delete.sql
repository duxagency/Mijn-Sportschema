-- Soft-delete voor oefeningen in een schema: i.p.v. de rij te verwijderen
-- (wat via ON DELETE CASCADE de gelogde session_sets meesleurt) markeren we
-- 'm als inactief. Zo blijft de trainingshistorie, PR's en grafieken behouden.
alter table public.workout_exercises
  add column if not exists is_active boolean not null default true;
