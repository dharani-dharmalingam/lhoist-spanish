# Lhoist North America — 2027 Benefits Microsite

A password-gated, content-driven employee benefits site for Lhoist North America (plan year 2027). It was generated in Lovable (template `tanstack_start_ts_current`) and is synced to this folder. All visible copy comes from a single JSON file, so a new plan year or a new client mostly means swapping that file, the brand assets and the video IDs.

## Stack

| Area | Choice |
| --- | --- |
| Framework | TanStack Start (React 19, SSR) with file-based TanStack Router |
| Language | TypeScript, strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) |
| Build | Vite 8 via `@lovable.dev/vite-tanstack-config`, which already bundles the TanStack Start, React, Tailwind, tsconfig-paths and Nitro plugins. Nitro builds for Cloudflare by default. |
| Styling | Tailwind CSS v4 (tokens in `src/styles.css`), shadcn/ui "new-york" style on Radix primitives, lucide icons |
| Data and forms | TanStack Query (provided in the root route), react-hook-form and zod (installed, little used) |
| Analytics | Mixpanel (`mixpanel-browser`) |
| Package manager | bun (`bun.lock`, `bunfig.toml`). `npm` also works per the README. |

## Commands

```sh
bun install
bun run dev        # vite dev
bun run build      # production build
bun run build:dev  # development-mode build
bun run preview
bun run lint       # eslint
bun run format     # prettier --write
```

`bunfig.toml` enforces a 24-hour minimum release age on new packages (supply-chain guard). It exempts a few `@lovable.dev/*` packages. Don't add more exemptions without checking with the user.

## Environment

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_MIXPANEL_TOKEN` | `.env` | Mixpanel project token |
| `VITE_TENANT_ID` | `.env` | Added as `tenant_id` on every Mixpanel event |
| `SESSION_SECRET` | server env, not in `.env` | Password for the encrypted session cookie (only needed when the gate is on) |
| `SITE_PASSWORD_HASH` | server env, not in `.env` | SHA-256 hex of the site access password (only needed when the gate is on) |

With the gate on, it will not work locally unless `SESSION_SECRET` and `SITE_PASSWORD_HASH` are set. `.env` is committed to the folder, so treat its token and tenant ID as non-secret.

## Repository layout

```
.lovable/plan/…md        Original build plan (design and structure spec)
public/                  favicon.png, robots.txt
src/
  server.ts, start.ts    SSR error wrapper; request middleware (error page + CSRF for server fns)
  router.tsx             Router factory
  routeTree.gen.ts       Auto-generated. Do not edit.
  styles.css             Tailwind theme tokens, brand colours, shadows, animations
  routes/                One file per page (see below)
  content/
    site-content.json    The single source of all copy
    content-types.ts     Types, including the fixed union of 15 chapter keys
    site.ts              The only module that reads the JSON; `getSite(locale)` builds and caches the site per language
    localize.ts          Swaps content strings for their Spanish version
    translations/        es.json, labels.es.ts, skip-keys.json
    videos.ts            Synthesia embed IDs (homepage, per chapter, per tab)
  components/
    ChapterPage.tsx      Standard chapter layout
    BlockRenderer.tsx    Maps content blocks to renderers
    blocks/              The renderers (below)
    layout/              Header, footer, drawer, search, floating button, prev/next, nav context
    ui/                  shadcn/ui components
    MixPanel.tsx         Mixpanel init, `trackEvent`, page-view hook
    VideoPlaceholder.tsx Synthesia embed frame
    SmartText.tsx        Text with auto-linking
  i18n/                  Locale context, UI dictionaries (en/es), useSite hook
  lib/
    gate.config.ts       GATE_ENABLED switch (currently false)
    gate.functions.ts    Password gate server functions
    brand.ts             URLs for hero, logo and guide PDF assets
    download.ts          Forced file download with fallback to open-in-tab
    error-*.ts, lovable-error-reporting.ts   Error capture and reporting
  assets/*.asset.json    Pointers to Lovable-hosted logo, hero image and guide PDF
scripts/i18n/            glossary.md, extract.py, missing.py, parity.ts (translation tooling)
```

## Content system

`site-content.json` has five top-level keys: `siteMeta`, `branding`, `siteStructure` (homepage plus `pageOrder`), `chapters` and `contacts`.

- `siteMeta` holds employer name, plan year, titles and descriptions, enrollment type, support email, phone and address, and the disclaimer.
- `chapters` has 15 keys: overview, eligibility, medicalPlans, wellness, dentalPlans, visionPlans, spendingAccounts, eap, survivorBenefits, supplementalHealth, incomeProtection, retirement, additionalBenefits, enrollment, glossary.
- `site.ts` normalises everything on load: missing text becomes `""`, missing lists become `[]`, missing objects become `null`. Components therefore never use optional chaining or fallback copy. It exports `siteMeta`, `branding`, `chapters`, `contactsList`, `pageOrder`, `navPages`, `homepage`, `searchIndex`, `getChapter`, `getNavBySlug`, `getAdjacentNav`, `getPageData` and `getPageDataBySlug`.
- A chapter becomes a list of typed blocks, and `BlockRenderer.tsx` renders each one:

| Block type | Renderer |
| --- | --- |
| `section` | `SectionText` (heading, paragraph, optional bullets) |
| `table` | `GridTable` |
| `cards` | `CardList` |
| `accountCards` | `AccountCards` |
| `contacts` | `ContactCards` |
| `keyValues` | `KeyValueList` |
| `iconFacts` | `IconFactGrid` |
| `bullets` | `BulletList` |
| `nameValues` | `NameValueList` |
| `tabs` | Tabbed group of blocks (HSA/FSA, Additional Benefits) |

Rule from the plan: every content field maps to exactly one renderer, and raw keys are never printed. If a new field shape turns up, add a block type deliberately.

## Routes and pages

`/login` and `/` plus 16 content pages, one route file each. Each content route is a thin wrapper: `SiteShell` around `<ChapterPage slug="…" />`, with its own `<head>` metadata.

Pages in order: `overview`, `eligibility`, `ppo`, `hdhp`, `dentalplans`, `visionplans`, `wellness`, `spendingaccounts` (HSA & FSA tabs), `eap`, `supplementalhealth`, `incomeprotection`, `survivorbenefits`, `retirement`, `additionalbenefits`, `contacts`, `glossary`.

The slug in the route file, the key in `chapterVideos` (`videos.ts`) and the slug passed to `ChapterPage` must agree. To add a page, create the route file, add it to `pageOrder` in the JSON, and map it to a chapter in `site.ts`.

A chapter page has a Back button, a light-blue title card, an optional 16:9 Synthesia video, the blocks, and Previous/Next navigation.

The home page has the hero, an Annual Enrollment card with video, a New Hire card, two callouts (download guide, carrier contacts) and a 2x2 "Explore your benefits" grid.

## Layout and navigation

- `SiteShell` wraps every content page in `NavProvider`, then header, main, footer, drawer, search palette and floating guide button.
- Sticky header with logo and hamburger on the left, search in the centre, plan-year badge on the right.
- Command-palette search (Cmd/Ctrl+K) over `searchIndex`, grouped by section.
- Left slide-out drawer with a reading-progress bar and a numbered page list. A floating "Guide" pill opens the same drawer.
- Footer with company and plan year, quick links including the guide PDF, and benefits contact details shown only when present.
- Links: phone as `tel:`, email as `mailto:`, websites in a new tab, site-wide.

## Localization (English / Spanish)

The visitor picks a language with the English / Español toggle at the top of the home page hero. The choice is saved in `localStorage` (`lhoist-locale`) and applies site-wide. The server and first client render always use English, then the saved choice is applied after mount.

| Piece | Where |
| --- | --- |
| Locale state, `useLocale()` | `src/i18n/LocaleContext.tsx` (provider mounted in `__root.tsx`) |
| UI strings (header, buttons, footer, home page) | `src/i18n/dictionaries.ts`. `es` is typed against `en`, so a missing key fails `tsc`. |
| Toggle component | `src/components/LanguageToggle.tsx` |
| Content for the current language | `useSite()` in `src/i18n/useSite.ts`, which returns `getSite(locale)` from `src/content/site.ts` |
| Spanish for text in `site-content.json` | `src/content/translations/es.json` (exact English string to Spanish) |
| Spanish for text written in `site.ts` | `src/content/translations/labels.es.ts` (`LABELS_ES`, and `TEMPLATES_ES` for strings with `{placeholders}`) |
| Fields that must stay English (ids, codes, proper names) | `src/content/translations/skip-keys.json` |

How it works:

- `site.ts` exports `getSite(locale)`. It builds the site once per locale and caches it. The English JSON stays the only content source. For Spanish, `localizeDoc()` (`localize.ts`) swaps each string for its `es.json` entry, and the same builder code runs on the result.
- Text written in `site.ts` (table headings, field labels, sentence templates) is translated in a final pass over each built page, using `labels.es.ts`. Sentences assembled from parts use `tpl("…{x}…", { x })`.
- Code that used to match English text now accepts both languages: `eq(value, "English")` and `matcher("English")` in `site.ts`, plus Spanish alternatives in a few regexes (`videos.ts`, `BlockRenderer.tsx`, `IconFactGrid.tsx`, pharmacy and cost-row rules). Components compare labels with `isLabel()` from `localize.ts`.
- Contacts are built from the English document, because their merging and hiding rules depend on English category names, and the result is then translated.
- A string with no Spanish entry shows in English.

Adding or changing content:

1. Edit `site-content.json` (English).
2. Run `python3 scripts/i18n/missing.py` to list strings without a Spanish entry, and add them to `es.json`.
3. For a new hard-coded label in `site.ts`, add it to `labels.es.ts`.
4. Run `npx tsx scripts/i18n/parity.ts`. It builds every page in both languages, fails on structure differences (a sign some logic stopped matching translated text) and lists strings that are still English in Spanish.
5. Keep the glossary in `scripts/i18n/glossary.md` in mind (US Spanish, "usted", plan and carrier names stay English).

Not localized yet: route `<head>` titles and descriptions (English), the guide PDF, the Synthesia videos, the chat widget, the root error page, and the login page. Translations were machine-drafted and have not had a native-speaker review.

## Access gate

The gate is currently **paused**: `GATE_ENABLED = false` in `src/lib/gate.config.ts`. While it is off, `__root.tsx` skips the check and `/login` redirects to `/`. Set it back to `true` to restore the gate. The notes below describe the gate when enabled.

- `src/routes/__root.tsx` `beforeLoad` calls `checkGate()` on every route except `/login`. If the session isn't unlocked it redirects to `/login`. A module-level `clientUnlocked` flag skips the check after the first success in the browser.
- `src/lib/gate.functions.ts`:
  - `checkGate` (GET) reads an encrypted `lhoist-gate` session cookie (httpOnly, secure, sameSite=lax, 7 days).
  - `unlockSite` (POST) SHA-256-hashes the submitted password and compares it to `SITE_PASSWORD_HASH` in constant time. On success it sets `unlocked: true`.
- There is a single shared password, with no per-user accounts or rate limiting.

## Third-party integrations

- **Synthesia**: videos are embedded from `share.synthesia.io/embeds/videos/<id>`. `videos.ts` has IDs for the homepage and 11 chapters. Tab videos are matched by regex on the tab label (HSA, FSA, identity protection, education, wellness). The "FSA vs HSA" tab intentionally has none. Pages without an entry show no video.
- **Mixpanel**: initialised lazily on first page view. Autocapture and session recording are off. `usePageViewTracker` sends a `Page View` event with the path. Use `trackEvent` for custom events.
- **Acolyte Health chat widget**: `__root.tsx` injects `https://gen.acolytehealth.com/embed/widget.js` with a fixed `data-bot-id` on every page except `/login`.
- **Lovable assets**: the logo, hero image and guide PDF live at `/__l5e/assets-v1/...` URLs, referenced through `src/assets/*.asset.json`. They resolve only on Lovable hosting, so a local run may show broken images and a broken guide download.

## Design system

Defined in `src/styles.css`:

- Primary brand colour `#0094CE` (`oklch(0.653 0.126 234.3)`), with `primary-deep`, `primary-soft` and `primary-tint` variants.
- Arial typography, custom text sizes, `shadow-soft` and `shadow-lift`, and a `rise-in` entrance animation.
- Responsive rules: no horizontal scroll, and tables stack rows into label/value cards on small screens.

## Conventions and gotchas

- **Lovable sync**: `AGENTS.md` says not to rewrite published git history (no force-push, rebase, amend or squash of pushed commits). Keep the connected branch working, because pushed commits sync back into Lovable.
- Don't add the plugins `@lovable.dev/vite-tanstack-config` already includes (TanStack Start, React, Tailwind, tsconfig paths, Nitro) to `vite.config.ts`, or the build will break from duplicates. Extra config goes under `defineConfig({ vite: {...} })`.
- The server entry is redirected to `src/server.ts`. Keep it unless the error wrapper is being replaced.
- `src/start.ts` must keep `createCsrfMiddleware` for server functions, because defining the file opts out of the automatic one.
- Don't create `src/pages/`, `app/layout.tsx` or other Next.js or Remix structures. The only root layout is `src/routes/__root.tsx`. Don't edit `routeTree.gen.ts`.
- Components read content only through `useSite()` / `src/content/site.ts`. Don't import the JSON elsewhere.
- Don't put English-only text matching in logic. Compare with `eq()`, `matcher()` or `isLabel()` so Spanish keeps working.
- Page numbers from the printed guide are deliberately hidden.
- Path alias `@/*` points to `src/*`.

## Reusing for another client

The `lovable-benefits-prompt` skill generates the initial Lovable prompt for a new client from this site's template. In this codebase, the places to change are:

1. `src/content/site-content.json` (copy, branding, contacts, page order)
2. `src/assets/*.asset.json` (logo, hero, guide PDF)
3. `src/content/videos.ts` (Synthesia IDs)
4. Brand colour tokens in `src/styles.css`
5. `.env` values (`VITE_TENANT_ID`, `VITE_MIXPANEL_TOKEN`) and the server secrets
6. The chat widget bot ID in `__root.tsx`
7. The hard-coded title and description strings in each `src/routes/*.tsx` (they name Lhoist and 2027 directly)
