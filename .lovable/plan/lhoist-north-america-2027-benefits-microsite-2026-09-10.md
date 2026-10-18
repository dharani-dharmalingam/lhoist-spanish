# Lhoist North America — 2027 Benefits Microsite

A premium, content-driven benefits site. Every word on the site comes from one content file, so next year (or another employer) only that file changes.

## Brand and feel

- Primary colour #0094CE with tints and shades, Arial typography, generous whitespace, soft shadows, subtle motion.
- Lhoist logo in the header and footer; the quarry photo as the hero background with a dark-to-clear gradient so the eyebrow, heading and paragraph stay readable at every size, plus the thin blue vertical rule beside the text block.
- Logo also becomes the site favicon.
- The hero image, logo and the benefits guide PDF are hosted as project assets; the footer download link points at the real PDF.

## Content system

- `src/content/site-content.json` — the supplied content file, used exactly as given.
- `src/content/content-types.ts` — one shared Chapter type, one type per renderer shape, and a fixed union of the 15 chapter keys. Only genuinely optional fields are optional.
- `src/content/site.ts` — the single module that reads the JSON. It normalises everything first (missing text becomes empty text, missing lists become empty lists, missing objects become null), then exports `siteMeta`, `branding`, `chapters`, `contactsList`, `pageOrder`, `homepage`, plus `getNavBySlug`, `getAdjacentNav` and `getPageData`. Components never check for missing content.

## The five renderers


| Renderer      | Used for                                                                                                                   |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| GridTable     | Every table: coverage, pharmacy tiers, premiums (tiers as rows, cost headings as columns), rate tables, HSA/FSA comparison |
| CardList      | Named items with a description: benefit programs, member resources, supplemental products, EAP services                    |
| KeyValueList  | Facts about one thing: carrier, plan type, network, administrator                                                          |
| BulletList    | Plain phrases: eligible dependents, life events, footnotes                                                                 |
| NameValueList | Short pairs: glossary terms, service frequencies, contribution limits                                                      |
| Section text  | Heading plus paragraph and optional bullets                                                                                |


Every field in every chapter maps to exactly one of these. Nothing prints raw keys. If an unmapped field shape appears, I will ask instead of guessing.

Table styling: column headings in uppercase primary colour, left-aligned table title, everything inside centre-aligned, width driven by the number of columns, and on small screens each row stacks into a label/value card.

## Pages (in the content file's order)

Overview, Eligibility & Enrollment, PPO, HDHP, Dental, Vision, Wellness, HSA & FSA, Employee Assistance Program, Supplemental Health, Income Protection, Survivor Benefits, Retirement, Additional Benefits, Contacts, Glossary.

- PPO and HDHP are separate pages, each with its own plan tables; the shared pharmacy tables appear on both.
- HSA & FSA uses three tabs: HSA, FSA (the other three accounts as cards), and FSA vs HSA (comparison table).
- Additional Benefits builds its tabs from the benefit type values found in the content — no hardcoded tab names.
- Contacts renders every carrier with phone as `tel:`, email as `mailto:`, website opening in a new tab. That rule holds site-wide.

Each chapter page: back button (returns to the previous page visited), title card in a light blue tint with a soft circular accent in the top-right, a 16:9 rounded video block ready for a Synthesia embed later, the chapter content, then Previous/Next navigation and the footer.

## Home page

Hero → Annual Enrollment card (video placeholder left, details right, button to Contacts) and the New Hire card → two callout cards (download the guide, carrier contacts), icon left, details right, both working → "Explore your benefits" 2x2 grid of four grouped cards with icon, title, subtitle and arrow → Next button → footer.

## Navigation

- Sticky header: logo and hamburger on the left, command-palette search in the centre (click or Cmd/Ctrl+K, grouped results), plan year badge on the right.
- Left slide-out drawer: site title with circular close button, chapter counter, thin reading-progress bar, highlighted Home item, then a numbered list of every page with a number badge, title and blue status dot.
- Floating pill "Guide" button, bottom-left on every page, opens the same drawer and never overlaps the footer.
- Footer, three columns: company name with plan year; Quick Links with Home and the guide download; Contact Benefits with email, phone and address rendered only when present. Centre-aligned on mobile.

## Build order

Types → content module → all route files → layout (header, footer, drawer, search, floating button) → the five renderers → page content. Routes come first so the drawer, search, pagination and Explore cards all have real destinations. A typecheck runs at the end and anything it reports gets fixed.

## Notes

- Internal page numbers from the printed guide stay hidden.
- No horizontal scrolling, clipping or overlap at any screen size.