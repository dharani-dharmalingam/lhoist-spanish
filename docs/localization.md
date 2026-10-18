# Spanish localization: implementation and change log

Lhoist North America 2027 Benefits Microsite

This document explains how the English / Spanish support works, how it was built, and every change made to the project in the same work session. Changes are grouped as: localization, access gate, brand assets, and tooling.

## 1. Summary

| Area | Before | After |
| --- | --- | --- |
| Language | English only | English and Spanish, switched with a toggle at the top of the home page hero |
| Page content | `site.ts` read the JSON once at import time | `getSite(locale)` builds the site per language and caches it |
| UI text (buttons, nav, footer) | Hard-coded English in components | Typed dictionaries in `src/i18n/dictionaries.ts` |
| Password gate | Always on | Paused with one switch (`GATE_ENABLED = false`) |
| Logo, hero, guide PDF | Lovable-hosted URLs (404 locally) | Files served from `public/` |
| Logo size | 20 px (header), 24 px (footer) | 36 / 44 px (header), 56 px (footer) |

Not changed: `src/content/site-content.json` (English content), `src/content/content-types.ts`, `package.json`, and the route files other than `__root.tsx`, `login.tsx` and `index.tsx`.

## 2. How the i18n works

### 2.1 Design

The English JSON stays the only content source. Spanish is produced from it, not stored as a second copy of the document. This keeps the two languages structurally identical, so there is nothing to drift apart.

Four layers translate different kinds of text:

| Layer | Text it covers | Where | How it is applied |
| --- | --- | --- | --- |
| UI dictionary | Buttons, nav, footer, search, home page strings, 404 page | `src/i18n/dictionaries.ts` | `const { t } = useLocale()`, then `t.next`, `t.planYear(year)` |
| Content map | Every translatable string in `site-content.json` (679 entries) | `src/content/translations/es.json` | `localizeDoc()` swaps each string for its Spanish entry before the site is built |
| Label map | English text written inside `site.ts` (172 labels, 21 sentence templates) | `src/content/translations/labels.es.ts` | A final pass over each built page, plus `tpl()` for sentences with `{placeholders}` |
| Skip list | Ids, codes, proper names (44 field names) | `src/content/translations/skip-keys.json` | `localizeDoc()` never touches these fields |

### 2.2 Data flow

```
site-content.json (English)
        |
        |  locale = "en"                       locale = "es"
        |  used as is                          localizeDoc(): replace each string
        |                                      with its es.json entry (skip keys untouched)
        v                                              v
                createSite(locale): the existing builder code in site.ts
                (normalise, chapter -> blocks, tables, tabs, contacts ...)
                                   |
                                   v
              getPageData(): for "es", localizePage() translates the text
              that site.ts wrote itself (labels.es.ts)
                                   |
                                   v
                        useSite() in components  <--  locale from LocaleProvider
```

### 2.3 Runtime pieces

**`src/i18n/dictionaries.ts`**
- `Locale = "en" | "es"`, `LOCALES`, `DEFAULT_LOCALE = "en"`.
- `en` holds 41 UI keys. Some are functions, such as `planYear(year)` and `chapters(count)`.
- `es` is typed as `Dictionary` (the type of `en`), so a missing Spanish key fails `tsc`.
- `LOCALE_NAMES` gives the toggle's labels (English, Español).

**`src/i18n/LocaleContext.tsx`**
- `LocaleProvider` holds the current locale and is mounted in `src/routes/__root.tsx`, wrapping the `<Outlet />`.
- The server and the first client render always use English, so hydration matches. After mount, the saved choice is read from `localStorage` (key `lhoist-locale`) and applied. A visitor who chose Spanish therefore sees English for a moment on load.
- It sets `document.documentElement.lang` to the current locale.
- `useLocale()` returns `{ locale, setLocale, t }`.

**`src/i18n/useSite.ts`**
- `useSite()` returns `getSite(locale)`, the full content API (`siteMeta`, `pageOrder`, `navPages`, `homepage`, `contactsList`, `getPageDataBySlug`, `searchIndex`, and so on) for the current language.

**`src/components/LanguageToggle.tsx`**
- An English / Español segmented switch with `aria-pressed`, a language icon and an `onDark` style used over the hero image.
- It is rendered only in the hero of `src/routes/index.tsx`. Chapter pages have no toggle; they follow the saved choice.

**`src/content/site.ts`**
- The old module-level code is now inside `createSite(locale)`. `getSite(locale)` calls it once per locale and caches the result.
- It still exports `siteMeta` (English) for code that runs outside React, such as route `<head>` metadata and the login page.
- Helpers defined inside `createSite`:
  - `T(text)`: Spanish for a content string (used in comparisons).
  - `L(text)`: Spanish for an English label written in the file.
  - `tpl("Template with {x}", { x })`: fills a sentence template, using the Spanish template when needed.
  - `eq(value, "English")`: true if a value is the English text or its Spanish translation.
  - `matcher("English")`: a case-insensitive regex for the English text or its Spanish translation.
- `getPageData()` runs the built page through `localizePage()` when the locale is Spanish. It skips the keys `id`, `kind`, `layout`, `href` and `slug`.

**`src/content/localize.ts`**
- `localizeDoc(doc)` deep-copies the content document with each translatable string replaced.
- `translateContent`, `translateLabel`, `translateTemplate` look up the maps.
- `isLabel(label, "English")` compares a label with the English text or its Spanish translation. Components use it.

### 2.4 Code that used to depend on English text

Several places matched on English wording. Once the content is Spanish they would silently stop working, so each was changed to accept both languages.

| Location | What it matches | Change |
| --- | --- | --- |
| `site.ts` pharmacy tables | Table titles "retail", "mail", "non-preventive"; row suffix `- NON PREVENTIVE`; column `"PPO In-Network"` | Regexes extended with `minorista`, `correo`, `no preventivo`. Column lookup uses `T("PPO In-Network")`. |
| `site.ts` cost rows | `/deductible\|coinsurance\|out-of-pocket/` | Added `deducible`, `coseguro`, `bolsillo` |
| `site.ts` dental and vision tables | Column labels `Frequency`, `In-Network`, `Out-of-Network` | Compared through `T()` |
| `site.ts` wellness, retirement | Section headings "Program Overview", "401(k) Supplemental Contribution", "Wellness Incentive", "Tobacco User Surcharge" | `eq()` and `matcher()` |
| `site.ts` survivor benefits | Coverage names, rate table title, `COVERAGE` and age headings, `Benefits payable:` and `EOI Required: No` in notes | `eq()`, `T()` and regexes that accept the Spanish wording. The row label now comes from the content, not the code's English list. |
| `site.ts` contacts | Category names decide merging and hidden categories | Contacts are built from the **English** document, then translated afterwards |
| `videos.ts` tab video rules | Tab label (`hsa`, `fsa`, `identity`, `education`, `wellness`) | Spanish alternatives added |
| `BlockRenderer.tsx` tab icon rules | Tab label words | Spanish alternatives added |
| `blocks/IconFactGrid.tsx` | Fact labels "Dependent Care Eligible", "Plan Type"; icon words | `isLabel()` and Spanish regex alternatives |
| `blocks/ContactCards.tsx` | Fact label "Address" | `isLabel()` |
| `blocks/GridTable.tsx` | Standard asterisk footnotes | Translated when the locale is Spanish |

### 2.5 Verification

`scripts/i18n/parity.ts` builds every page in English and Spanish and compares them. It reports a problem when the structure differs (block counts, row counts, tabs, or a cell empty in one language but not the other). That is the signature of logic that stopped matching translated text. It also lists multi-word strings that are still identical in Spanish.

Results at the end of this work:
- 0 structure problems.
- The English output is identical to the output of the original `site.ts` (checked by building both and comparing all pages, the home page, contacts, search index and site metadata).
- The only identical strings are proper names and the address (BCBS, Navia, Enhanced Advantage plans, and so on).
- `tsc --noEmit` passes. `vite build` succeeds. All pages return 200 on the dev server.

## 3. Everything that changed

### 3.1 New files

| File | Purpose |
| --- | --- |
| `src/i18n/dictionaries.ts` | Locale type, English and Spanish UI strings, toggle labels |
| `src/i18n/LocaleContext.tsx` | `LocaleProvider`, `useLocale()` |
| `src/i18n/useSite.ts` | `useSite()` hook |
| `src/components/LanguageToggle.tsx` | The language switch |
| `src/content/localize.ts` | `localizeDoc`, `translateLabel`, `isLabel` and friends |
| `src/content/translations/es.json` | 679 English to Spanish content strings |
| `src/content/translations/labels.es.ts` | Spanish for text written in `site.ts` |
| `src/content/translations/skip-keys.json` | Fields never translated |
| `src/lib/gate.config.ts` | `GATE_ENABLED` switch |
| `scripts/i18n/glossary.md` | Translation glossary and style guide |
| `scripts/i18n/extract.py` | Extracts the unique translatable strings from the JSON |
| `scripts/i18n/missing.py` | Lists strings that have no Spanish entry yet |
| `scripts/i18n/parity.ts` | English / Spanish structure check |
| `project.md` | Project overview, with a Localization section |
| `docs/localization.md` | This document |

### 3.2 Modified files

| File | Change |
| --- | --- |
| `src/routes/__root.tsx` | Mounts `LocaleProvider`. Skips the gate check when `GATE_ENABLED` is false. The 404 page is translated. (The root error page is still English because it renders outside the provider.) |
| `src/routes/login.tsx` | `beforeLoad` redirects to `/` while the gate is off |
| `src/routes/index.tsx` | Adds the toggle in the hero. All home page text uses the dictionary. Content comes from `useSite()`. Route metadata uses the English site. |
| `src/content/site.ts` | Wrapped in `createSite(locale)` with `getSite()` and a cache. Added the helpers, the page-level translation pass and the logic changes in section 2.4. |
| `src/content/videos.ts` | Tab video rules accept Spanish labels |
| `src/components/layout/SiteHeader.tsx` | Dictionary strings, `useSite()`, larger logo |
| `src/components/layout/SiteFooter.tsx` | Dictionary strings, `useSite()`, larger logo, localized guide file name |
| `src/components/layout/NavDrawer.tsx` | Dictionary strings, `useSite()` |
| `src/components/layout/PrevNext.tsx` | Dictionary strings, `useSite()` |
| `src/components/layout/FloatingGuideButton.tsx` | Dictionary strings |
| `src/components/layout/SearchPalette.tsx` | Dictionary strings, `useSite()` search index |
| `src/components/ChapterPage.tsx` | Back button text, `useSite()` |
| `src/components/VideoPlaceholder.tsx` | "Video coming soon" text |
| `src/components/BlockRenderer.tsx` | Tab icon rules accept Spanish |
| `src/components/blocks/GridTable.tsx` | Translates the standard asterisk footnotes |
| `src/components/blocks/IconFactGrid.tsx` | Language-neutral label checks |
| `src/components/blocks/ContactCards.tsx` | Language-neutral label check |
| `src/lib/brand.ts` | Now points at files in `public/` (see 3.4) |

### 3.3 Access gate

- `src/lib/gate.config.ts` exports `GATE_ENABLED = false`.
- With the flag off, `__root.tsx` does not call `checkGate()`, and `/login` redirects to `/`.
- The login page, `gate.functions.ts` and the session code are untouched. Set the flag to `true` to restore the gate.
- While it is off, `SESSION_SECRET` and `SITE_PASSWORD_HASH` are not needed.

### 3.4 Brand assets and logo

- Files in `public/`: `Lhoist_hero.png`, `Lhoist North America logo JPG.jpg`, `2027-Lhoist-Benefits-Guide.pdf`.
- `src/lib/brand.ts` now exports `/Lhoist_hero.png`, the encoded logo path and `/2027-Lhoist-Benefits-Guide.pdf`. Before this change it imported Lovable-hosted URLs (`/__l5e/assets-v1/...`) that return 404 outside Lovable.
- The three `src/assets/*.asset.json` files are no longer imported. They were left in place.
- Logo size: header `h-5` became `h-9 sm:h-11`. Footer `h-6` became `h-14`.

### 3.5 Environment

- `npm install` was run to type-check, which created `node_modules/`. A `package-lock.json` it created was deleted because the project uses bun.
- No dependency was added or changed (`package.json` is unchanged). The scripts run with `npx tsx`, which downloads on first use.

## 4. How to work with it

### Add or edit English content
1. Edit `src/content/site-content.json`.
2. Run `python3 scripts/i18n/missing.py`. It lists strings that have no Spanish entry.
3. Add those entries to `src/content/translations/es.json` (exact English string as the key).
4. If you added a new hard-coded label in `site.ts`, add it to `labels.es.ts`. For a sentence with variable parts, use `tpl("… {x} …", { x })` and add the template to `TEMPLATES_ES`.
5. Run `npx tsx scripts/i18n/parity.ts` and `npx tsc --noEmit`.

### Change a translation
Edit the value in `es.json`, `labels.es.ts` or `dictionaries.ts`. The same English string always maps to the same Spanish everywhere.

### Add a UI string
Add the key to `en` in `dictionaries.ts`. TypeScript then requires it in `es`. Use `t.yourKey` in the component.

### Keep a field in English
Add its JSON field name to `skip-keys.json`. This is for ids, codes, carrier names and plan names. Re-run `extract.py` if you need a fresh string list.

### Add another language
1. Add the code to `Locale`, `LOCALES` and `LOCALE_NAMES`, and add a typed dictionary.
2. Add `translations/<code>.json` and a labels file, and make `localize.ts` and `site.ts` choose by locale (today they assume `es`).
3. Extend the regexes listed in section 2.4 with the new language's words, or move that logic to keys, then run the parity script.

## 5. Known limitations

- Translations are machine-drafted. They need review by a native speaker, starting with the medical, HSA/FSA, income-protection and retirement chapters. The agents that drafted them flagged a few uncertain choices, for example "Health Advocacy Solutions", "Health Advocate" and gendered job titles for the named consultant.
- Still English-only: route `<head>` titles and descriptions, the guide PDF, the Synthesia videos, the chat widget, the root error page and the login page.
- The language choice is applied after mount, so Spanish visitors briefly see English. Moving to locale-prefixed URLs would remove this and make Spanish pages linkable and indexable.
- The toggle is only on the home page. A header toggle would let visitors switch from any page.
- `es.json` is bundled for every visitor, about 100 KB.
- `siteMeta.employerName` is empty in the content file, so the logo alt text and the guide's download file name lack the employer name. This was already the case before these changes.
- `Lhoist_hero.png` is 3.5 MB, and the logo is a JPG with a solid background.
- Prettier still flags some files edited here (the repo had formatting drift). Run `npm run format` to clean up.
