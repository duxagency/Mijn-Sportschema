# Mijn Sportschema

Web-app voor krachttraining. Gefaseerde build. Fase 1 (auth + datamodel) en
fase 2 (oefeningenbibliotheek) staan. Schema-builder, training-flow en
progressie volgen later — bouw die nog niet, ook al staan de tabellen er al.

## Stack

- Next.js 16 (App Router) + React 19, TypeScript strict
- Supabase (Postgres, auth, RLS) via `@supabase/ssr`
- Tailwind CSS v4

## Mappenstructuur

```
middleware.ts                 # ververst sessie + beschermt routes
supabase/migrations/          # datamodel, RLS, profiel-trigger
supabase/seed.sql             # optionele startoefeningen
src/app/                      # routes (login, register, dashboard, exercises)
src/components/ui/            # kleine herbruikbare primitives
src/components/<feature>/     # feature-componenten (auth, exercises)
src/lib/actions/              # server actions ("use server")
src/lib/supabase/             # client.ts (browser), server.ts, middleware.ts
src/types/database.types.ts   # schema-types (regenereer met `npm run gen:types`)
```

## Datamodel (steekwoorden)

- `profiles` — id→auth.users, display_name. Auto-aangemaakt via trigger bij signup.
- `exercises` — gedeeld. name, created_by, tracks_weight/reps/time/distance (bool).
- `workouts` — per user: user_id, name.
- `workout_exercises` — workout_id, exercise_id (**FK ON DELETE RESTRICT**),
  position, target_sets/reps/weight/minutes/distance (nullable).
- `sessions` — per user: workout_id, started_at, finished_at.
- `session_sets` — session_id, workout_exercise_id, set_number, reps/weight/minutes/distance.

## RLS (steekwoorden)

- `exercises` — volledig gedeeld: elke ingelogde user mag select/insert/update/delete.
- `profiles` — alleen eigen rij.
- `workouts`, `sessions` — alleen eigen rijen (`user_id = auth.uid()`).
- `workout_exercises`, `session_sets` — via de bovenliggende workout/session.

## Conventies

- TypeScript strict; types uit het Supabase-schema (`npm run gen:types`).
- Server-mutaties via server actions in `src/lib/actions/` (`"use server"`-bestanden
  exporteren alléén async functies — constanten/types apart, zie `auth-types.ts`).
- Forms: client component met `useActionState`; herbruik `ui/`-primitives
  (Input, Button, FormError, SubmitButton, Checkbox).
- Nederlandse UI-teksten. Kleine, herbruikbare componenten.
- Eén git commit per logische stap.

## Commando's

- `npm run dev` — dev-server (http://localhost:3000)
- `npx tsc --noEmit` — typecheck
- `npx eslint .` — lint (let op: `next lint` bestaat niet meer in Next 16)
- `npx next build` — productie-build

## Let op: dev-omgeving

De repo staat in een **OneDrive-gesyncte map**. Turbopack's file-watcher pakt
edits daar niet betrouwbaar op; `next dev` serveert dan stale output. Na
wijzigingen: dev-server herstarten, bij twijfel eerst `rm -rf .next`.
