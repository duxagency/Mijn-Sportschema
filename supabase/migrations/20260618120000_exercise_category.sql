-- Voegt een categorie toe aan oefeningen zodat de bibliotheek gegroepeerd kan
-- worden (Kracht / Push / Pull / Benen / Cardio). Bestaande rijen krijgen de
-- default 'overig'. De toegestane waarden komen overeen met src/lib/categories.ts.

alter table public.exercises
  add column if not exists category text not null default 'overig';

alter table public.exercises
  drop constraint if exists exercises_category_check;

alter table public.exercises
  add constraint exercises_category_check
  check (category in ('kracht', 'push', 'pull', 'benen', 'cardio', 'overig'));
