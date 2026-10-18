# Lhoist North America 2027 Benefits Microsite

A content-driven employee benefits site for Lhoist North America (plan year 2027), available in **English and Spanish**. All page text comes from one content file, so a new plan year or client mostly means swapping that file, the brand assets and the video IDs.


## Features

- 17 pages: Home, Overview, Eligibility, PPO, HDHP, Dental, Vision, Wellness, HSA & FSA, EAP, Supplemental Health, Income Protection, Survivor Benefits, Retirement, Additional Benefits, Contacts, Glossary
- English / Spanish toggle on the home page; the choice is saved in the browser
- Search palette (Cmd/Ctrl+K), slide-out chapter navigation, previous/next links
- Reusable renderers for tables, cards, key/value lists, bullet lists and tabs
- Embedded Synthesia videos per chapter
- Optional password gate (currently paused)
- Mixpanel page-view analytics

## Tech stack

TanStack Start (React 19, SSR) · TypeScript (strict) · Vite · Tailwind CSS v4 · shadcn/ui (Radix) · Mixpanel

## Getting started

Requirements: Node.js 20 or newer. The project uses bun (`bun.lock`), but npm works too.

```sh
npm install
npm run dev        # http://localhost:8080
```

Other commands:

| Command | What it does |
| --- | --- |
| `npm run build` | Production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

### Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_MIXPANEL_TOKEN` | Mixpanel project token |
| `VITE_TENANT_ID` | Added to every Mixpanel event |
| `SESSION_SECRET`, `SITE_PASSWORD_HASH` | Only needed when the password gate is on |

### Brand files

The logo, hero image and benefits guide PDF are served from `public/`
(`lhoist-logo.png`, `Lhoist_hero.png`, `2027-Lhoist-Benefits-Guide.pdf`). Their paths are set in `src/lib/brand.ts`.

## Project structure

```
src/
  routes/        One file per page (TanStack file-based routing)
  content/       site-content.json (English content), site.ts (builds pages per language),
                 translations/ (Spanish)
  i18n/          Language context, UI dictionaries, useSite hook
  components/    Layout, block renderers, shadcn/ui
  lib/           Brand assets, password gate, helpers
scripts/
  i18n/          Translation tooling and glossary
  export-pdf/    Exports the site to PDF
docs/            Localization documentation
```

## Content and translations

- English content lives in `src/content/site-content.json`. Components read it only through `src/content/site.ts`.
- Spanish is generated from the English content using `src/content/translations/es.json` (content), `labels.es.ts` (labels written in code) and `src/i18n/dictionaries.ts` (interface text).
- After editing the English content, list strings that still need Spanish with `python3 scripts/i18n/missing.py`, then add them to `es.json`.
- Check that both languages build the same pages with `npx tsx scripts/i18n/parity.ts`.

See [docs/localization.md](docs/localization.md) for how it works and a full change log.


## Known limitations

- The Spanish translations are machine-drafted and need native-speaker review.
- Page titles and descriptions (the `<head>` metadata) are English only.
- The guide PDF, Synthesia videos and chat widget are English only.
- The chat widget (`gen.acolytehealth.com`) loads on every page except `/login`.

Some claims here are worth checking before you publish them:
- Page count: I wrote 17 pages. That's the home page plus 16 content pages.
- Node version: "Node.js 20 or newer" is my assumption, because package.json doesn't state a version.
- Port: the 8080 port is what the dev server used here.
