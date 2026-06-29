-- Warming-up-sets: een set kan als warming-up gemarkeerd worden. Die tellen
-- niet mee voor PR's, volume en de "vorige keer"-referentie.
alter table public.session_sets
  add column if not exists is_warmup boolean not null default false;
