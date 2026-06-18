---
name: push
description: Het volledige push-naar-productie proces voor Mijn Sportschema. Hoogt het versienummer op, draait typecheck + lint + productie-build (met de OneDrive-veilige .next-dans), commit en pusht naar GitHub (Vercel deployt automatisch). Gebruik deze skill wanneer de gebruiker vraagt om te pushen, deployen, of "zet het live".
---

# Push naar productie

Voer deze stappen in volgorde uit. Stop en meld het de gebruiker zodra een
stap faalt — nooit committen of pushen met rode typecheck/lint/build.

## 1. Versie ophogen

Hoog het **patch**-cijfer op in `src/lib/version.ts` (bijv. `1.0.0` → `1.0.1`).
Bij grotere wijzigingen mag het minor-cijfer omhoog (`1.0.x` → `1.1.0`) — vraag
dat alleen als het onduidelijk is, anders gewoon patch.

Dit nieuwe nummer verschijnt rechtsonder op het dashboard en de loginpagina,
zodat de gebruiker kan zien dat de deploy is doorgekomen.

## 2. Typecheck + lint

```bash
npx tsc --noEmit && npx eslint .
```

Beide moeten schoon zijn. Bij fouten: oplossen vóór je verder gaat.

## 3. Productie-build (OneDrive-veilig)

De repo staat in een OneDrive-gesyncte map; Turbopack's file-watcher en de
`.next`-map raken in de war als de dev-server draait tijdens een build. Daarom
deze vaste volgorde — dev stoppen, schoon builden, dev schoon herstarten:

```bash
pkill -f "next dev" 2>/dev/null; sleep 1
rm -rf .next
npx next build
rm -rf .next
(npm run dev > /tmp/sportschema-dev.log 2>&1 &)
sleep 4
tail -3 /tmp/sportschema-dev.log
```

De build moet slagen ("Compiled successfully"). Controleer in de log dat de
dev-server weer "Ready" is.

## 4. Commit + push

- Werk je op `main`, dan is dat hier prima (persoonlijk project, Vercel volgt `main`).
- Schrijf een Nederlandse commit-message in de bestaande stijl
  (`feat(...)`, `fix(...)`, `chore(...)`, `docs: ...`), één logische stap.
- Sluit de commit-message af met de Co-Authored-By-trailer.

```bash
git add -A
git commit -m "<type>(<scope>): <omschrijving>

Co-Authored-By: Claude <noreply@anthropic.com>"
git push
```

## 5. Bevestigen

- Meld de gebruiker het nieuwe versienummer (uit stap 1) en de korte commit-hash.
- Vercel deployt `main` automatisch. Na ~1 minuut is op
  https://mijn-sportschema.vercel.app rechtsonder het nieuwe `v<versie> · <hash>`
  zichtbaar — zo weet de gebruiker dat de push is doorgekomen.

## Databasewijzigingen (indien van toepassing)

Zit er een nieuwe migratie in `supabase/migrations/`? Pas die ook toe op de live
database via de Supabase-connector (`apply_migration` of `execute_sql` met
project-id `bolfickrxeoeuhofguai`) en draai daarna `get_advisors` (security +
performance) om te controleren of er niets is opengevallen.
