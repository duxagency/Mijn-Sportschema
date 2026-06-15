# Mijn Sportschema

Web-app voor krachttraining. Gebruikers loggen in, bouwen trainingsschema's uit
een gedeelde oefeningenbibliotheek en leggen hun prestaties per set vast.

Dit is **fase 1: de fundering**. In deze fase werken alleen het opzetten van het
project, het volledige datamodel met RLS, en authenticatie (registreren,
inloggen, beveiligd dashboard, uitloggen). De schema-builder, training-flow en
progressie-logica volgen in latere fasen — die tabellen staan al wél in de
database.

## Stack

- [Next.js](https://nextjs.org/) (App Router) met TypeScript (strict)
- [Supabase](https://supabase.com/) voor Postgres, auth en row level security
- [Tailwind CSS](https://tailwindcss.com/) v4
- [`@supabase/ssr`](https://supabase.com/docs/guides/auth/server-side/nextjs)
  voor de server- en client-integratie

## Vereisten

- Node.js 20+ (ontwikkeld op Node 24)
- Een gratis [Supabase](https://supabase.com/)-account
- Optioneel: de [Supabase CLI](https://supabase.com/docs/guides/cli) om
  migrations en types vanaf de command line te beheren

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

Kopieer het voorbeeldbestand en vul je eigen waarden in:

```bash
cp .env.local.example .env.local
```

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://jouw-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw-anon-public-key
```

`.env.local` staat in `.gitignore` en wordt dus niet meegecommit.

## 4. Database opzetten (migrations + RLS)

Het volledige datamodel, de RLS-policies en de profiel-trigger staan als
migrations in [`supabase/migrations/`](supabase/migrations). Je kunt ze op twee
manieren toepassen.

### Optie A — via de Supabase CLI (aanbevolen)

```bash
# eenmalig: maak de Supabase-config aan (laat de bestaande migrations staan)
npx supabase init

# koppel je lokale repo aan je Supabase-project
npx supabase login
npx supabase link --project-ref jouw-project-ref

# pas alle migrations toe op de gekoppelde database
npx supabase db push
```

Werk je lokaal met `npx supabase start`, dan zet `npx supabase db reset` de
database op en draait het automatisch ook `supabase/seed.sql` met een paar
voorbeeldoefeningen.

### Optie B — handmatig via de SQL Editor

Open in het Supabase-dashboard de **SQL Editor** en voer de inhoud van deze
bestanden uit, in volgorde:

1. `supabase/migrations/20260615120000_create_tables.sql`
2. `supabase/migrations/20260615120100_enable_rls.sql`
3. `supabase/migrations/20260615120200_profile_trigger.sql`
4. *(optioneel)* `supabase/seed.sql` voor wat startoefeningen

## 5. E-mailbevestiging (belangrijk voor lokaal testen)

Supabase heeft standaard **Confirm email** aanstaan. Dan kun je pas inloggen
nadat je de bevestigingsmail hebt geopend. Voor snel lokaal testen kun je dit
uitzetten:

> **Authentication → Sign In / Providers → Email → Confirm email** uitzetten.

Met bevestiging uit kun je direct na registreren inloggen. Staat het aan, dan
stuurt de app je na registratie naar de loginpagina met de melding om je e-mail
te bevestigen.

## 6. App draaien

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Niet-ingelogde bezoekers
worden naar `/login` gestuurd. Maak een account aan via `/register`, log in en
je ziet je dashboard met je naam. Uitloggen kan met de knop op het dashboard.

## TypeScript-types genereren

[`src/types/database.types.ts`](src/types/database.types.ts) weerspiegelt het
schema en is met de hand geschreven in het formaat dat de Supabase CLI
genereert. Zodra je project gekoppeld is, kun je dit bestand opnieuw genereren
vanuit de echte database:

```bash
npm run gen:types
```

Doe dit telkens nadat je een nieuwe migration hebt toegepast.

## Projectstructuur

```
.
├── middleware.ts                 # ververst de sessie + beschermt routes
├── supabase/
│   ├── migrations/               # volledig datamodel, RLS, profiel-trigger
│   └── seed.sql                  # optionele startoefeningen
└── src/
    ├── app/
    │   ├── layout.tsx            # root layout
    │   ├── page.tsx              # redirect naar /dashboard
    │   ├── login/page.tsx        # inloggen
    │   ├── register/page.tsx     # registreren
    │   └── dashboard/page.tsx    # beveiligd, toont display_name
    ├── components/
    │   ├── auth/                 # AuthCard, Login/RegisterForm, SignOutButton
    │   └── ui/                   # kleine herbruikbare primitives
    ├── lib/
    │   ├── actions/auth.ts       # server actions: login, register, signOut
    │   └── supabase/             # browser-, server- en middleware-client
    └── types/database.types.ts   # gegenereerde schema-types
```

## Datamodel

| Tabel | Beschrijving | Eigenaarschap |
| --- | --- | --- |
| `profiles` | 1-op-1 met `auth.users`, bevat `display_name` | eigen rij |
| `exercises` | gedeelde oefeningenbibliotheek met `tracks_*`-booleans | gedeeld |
| `workouts` | een trainingsschema | per gebruiker |
| `workout_exercises` | oefening binnen een schema (`position`, `target_*`) | via `workouts` |
| `sessions` | een uitgevoerde training | per gebruiker |
| `session_sets` | één ingevoerde set tijdens een sessie | via `sessions` |

## Row level security

- **profiles** — een gebruiker leest en bewerkt alleen zijn eigen profiel. De
  rij wordt automatisch aangemaakt door een `security definer`-trigger
  (`handle_new_user`) bij registratie.
- **exercises** — volledig gedeeld: elke ingelogde gebruiker mag lezen,
  aanmaken, wijzigen en verwijderen.
- **workouts, sessions** — een gebruiker ziet en bewerkt alleen rijen waar
  `user_id` gelijk is aan zijn eigen id.
- **workout_exercises, session_sets** — toegang loopt via het bovenliggende
  schema respectievelijk de bovenliggende sessie.
