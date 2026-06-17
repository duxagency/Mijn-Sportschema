# Mijn Sportschema

Web-app voor krachttraining. Gebruikers loggen in, bouwen trainingsschema's uit
een gedeelde oefeningenbibliotheek en leggen hun prestaties per set vast. Na
elke training worden de vorige waarden automatisch als uitgangspunt ingeladen.

## Stack

- [Next.js](https://nextjs.org/) 16 (App Router) met TypeScript (strict)
- [Supabase](https://supabase.com/) voor Postgres, auth en row level security
- [Tailwind CSS](https://tailwindcss.com/) v4
- [`@supabase/ssr`](https://supabase.com/docs/guides/auth/server-side/nextjs)
  voor de server- en client-integratie

## Vereisten

- Node.js 20+ (ontwikkeld op Node 24)
- Een [Supabase](https://supabase.com/)-account (gratis tier is voldoende)

## 1. Project installeren

```bash
npm install
```

## 2. Supabase-project opzetten

1. Maak een nieuw project aan op [app.supabase.com](https://app.supabase.com).
2. Ga naar **Project Settings → API** en noteer:
   - **Project URL** (bijv. `https://abcdxyz.supabase.co`)
   - de **anon public** API-key

## 3. Environment variables

Maak een `.env.local` aan in de projectroot (staat in `.gitignore`, wordt niet meegecommit):

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://jouw-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw-anon-public-key
```

## 4. Database opzetten (migrations + RLS)

Het volledige datamodel, de RLS-policies en de profiel-trigger staan als
migrations in [`supabase/migrations/`](supabase/migrations). Je kunt ze op twee
manieren toepassen.

### Optie A — via de Supabase CLI (aanbevolen)

```bash
# koppel je lokale repo aan je Supabase-project (eenmalig)
npx supabase login
npx supabase link --project-ref jouw-project-ref

# pas alle migrations toe op de gekoppelde database
npx supabase db push
```

### Optie B — handmatig via de SQL Editor

Open in het Supabase-dashboard de **SQL Editor** en voer de inhoud van deze
bestanden uit, in volgorde:

1. `supabase/migrations/20260615120000_create_tables.sql`
2. `supabase/migrations/20260615120100_enable_rls.sql`
3. `supabase/migrations/20260615120200_profile_trigger.sql`
4. *(optioneel)* `supabase/seed.sql` voor startoefeningen

## 5. E-mailbevestiging

Supabase heeft standaard **Confirm email** aanstaan. Voor lokaal testen kun je
dit uitzetten via:

> **Authentication → Sign In / Providers → Email → Confirm email** uitzetten.

## 6. App draaien (lokaal)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Niet-ingelogde bezoekers
worden naar `/login` gestuurd.

## 7. Deployen naar Vercel

### Eerste keer

1. Push de repo naar GitHub.
2. Ga naar [vercel.com/new](https://vercel.com/new) en importeer de repository.
3. Vercel detecteert Next.js automatisch — geen extra build-instellingen nodig.
4. Voeg de volgende **Environment Variables** toe in het Vercel-dashboard
   (Settings → Environment Variables), voor de omgevingen Production, Preview
   en Development:

   | Variabele | Waarde |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL van je productie-Supabase-project |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key van datzelfde project |

5. Klik **Deploy**. Vercel bouwt en deploy automatisch.

### Vervolgens

Elke push naar `main` triggert automatisch een nieuwe deploy. Nieuwe migrations
pas je toe via `npx supabase db push` (na `npx supabase link`) of handmatig via
de Supabase SQL Editor.

## Nuttige commando's

```bash
npm run dev          # dev-server op http://localhost:3000
npx tsc --noEmit     # typecheck
npx eslint .         # lint
npx next build       # productie-build lokaal testen
npm run gen:types    # database-types regenereren (na een nieuwe migration)
```

> **Let op (OneDrive):** de repo staat in een OneDrive-gesyncte map. Turbopack's
> file-watcher pakt edits daar niet altijd betrouwbaar op. Na wijzigingen:
> dev-server herstarten, bij twijfel eerst `rm -rf .next`.

## Projectstructuur

```
middleware.ts                      # ververst sessie + beschermt routes
supabase/
  migrations/                      # datamodel, RLS, profiel-trigger
  seed.sql                         # optionele startoefeningen
src/
  app/
    layout.tsx                     # root layout
    page.tsx                       # redirect naar /dashboard
    error.tsx                      # globale fout-boundary
    login/                         # inloggen
    register/                      # registreren
    dashboard/                     # startpagina na inloggen
    exercises/                     # oefeningenbibliotheek (gedeeld)
    workouts/                      # schema's per gebruiker
    sessions/                      # trainingen per gebruiker
  components/
    auth/                          # AuthCard, Login/RegisterForm, SignOutButton
    exercises/                     # ExerciseForm, DeleteExerciseButton
    sessions/                      # TrainingFlow, SessionReview, history
    workouts/                      # WorkoutForm, SortableExerciseList, e.a.
    ui/                            # herbruikbare primitives (Button, Input, …)
  lib/
    actions/                       # server actions per feature
    supabase/                      # browser-, server- en middleware-client
    measurements.ts                # definitie van meetvelden (reps/gewicht/…)
    format.ts                      # datum- en duurformattering
    targets.ts                     # type-hulp voor doelwaarden
  types/database.types.ts          # schema-types (regenereer met gen:types)
```

## Datamodel

| Tabel | Beschrijving | Eigenaarschap |
|---|---|---|
| `profiles` | 1-op-1 met `auth.users`, bevat `display_name` | eigen rij |
| `exercises` | gedeelde oefeningenbibliotheek met `tracks_*`-booleans | gedeeld |
| `workouts` | een trainingsschema | per gebruiker |
| `workout_exercises` | oefening in een schema (`position`, `target_*`) | via `workouts` |
| `sessions` | een uitgevoerde training | per gebruiker |
| `session_sets` | één ingevoerde set tijdens een sessie | via `sessions` |

## Row level security

- **profiles** — een gebruiker leest en bewerkt alleen zijn eigen profiel. De
  rij wordt automatisch aangemaakt door een `security definer`-trigger bij
  registratie.
- **exercises** — volledig gedeeld: elke ingelogde gebruiker mag lezen,
  aanmaken, wijzigen en verwijderen.
- **workouts, sessions** — een gebruiker ziet en bewerkt alleen rijen waar
  `user_id` gelijk is aan zijn eigen id.
- **workout_exercises, session_sets** — toegang loopt via het bovenliggende
  schema respectievelijk de bovenliggende sessie.
