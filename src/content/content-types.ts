/**
 * Shared content types.
 *
 * One `Chapter` type is used by every chapter: fields that are not present in
 * every chapter (or in a future year's content file) are optional and may be
 * null. `site.ts` normalizes all of this before it reaches a component, so the
 * renderer-facing types below never contain optional or nullable fields.
 */

export const CHAPTER_KEYS = [
  "overview",
  "eligibility",
  "medicalPlans",
  "wellness",
  "dentalPlans",
  "visionPlans",
  "spendingAccounts",
  "eap",
  "survivorBenefits",
  "supplementalHealth",
  "incomeProtection",
  "retirement",
  "additionalBenefits",
  "enrollment",
  "glossary",
] as const;

export type ChapterKey = (typeof CHAPTER_KEYS)[number];

export type PageType = "standard" | "medicalPlanDetail" | "contacts";

/* ------------------------------------------------------------------ */
/* Raw content shapes (as authored in site-content.json)               */
/* ------------------------------------------------------------------ */

export type Maybe<T> = T | null | undefined;

export interface RawCell {
  columnLabel?: Maybe<string>;
  value?: Maybe<string>;
}

export interface RawRow {
  rowLabel?: Maybe<string>;
  cells?: Maybe<RawCell[]>;
  rowFootnote?: Maybe<string>;
}

export interface RawTable {
  tableTitle?: Maybe<string>;
  columnLabels?: Maybe<string[]>;
  rows?: Maybe<RawRow[]>;
  footnotes?: Maybe<string[]>;
  supplyLimit?: Maybe<string>;
  sourcePage?: Maybe<number>;
}

export interface RawTier {
  tierLabel?: Maybe<string>;
  costs?: Maybe<RawCell[]>;
}

export interface RawPremiums {
  frequency?: Maybe<string>;
  costColumns?: Maybe<string[]>;
  planColumns?: Maybe<string[]>;
  tiers?: Maybe<RawTier[]>;
  footnotes?: Maybe<string[]>;
  tableTitle?: Maybe<string>;
  benefitType?: Maybe<string>;
}

export interface RawSection {
  heading?: Maybe<string>;
  body?: Maybe<string>;
  bullets?: Maybe<string[]>;
}

export interface RawPlan {
  planKey?: Maybe<string>;
  planName?: Maybe<string>;
  pageSubtitle?: Maybe<string>;
  carrier?: Maybe<string>;
  planType?: Maybe<string>;
  networkName?: Maybe<string>;
  hasOutOfNetworkCoverage?: Maybe<boolean>;
  hsaEligible?: Maybe<boolean>;
  planDescription?: Maybe<string>;
  employerAccountContribution?: Maybe<string>;
  coverageTables?: Maybe<RawTable[]>;
  premiums?: Maybe<RawPremiums>;
  servicesIncluded?: Maybe<string[]>;
  serviceFrequencies?: Maybe<Record<string, Maybe<string>>[] | Maybe<string>[]>;
  allowanceNotes?: Maybe<string[]>;
  footnotes?: Maybe<string[]>;
}

/** Single shared chapter shape — every field beyond the key/title is optional. */
export interface Chapter {
  chapterKey?: Maybe<string>;
  chapterTitle?: Maybe<string>;
  chapterSubtitle?: Maybe<string>;
  summary?: Maybe<string>;
  siteGroup?: Maybe<string>;
  sections?: Maybe<RawSection[]>;
  tables?: Maybe<RawTable[]>;
  [field: string]: unknown;
}

export interface RawContact {
  category?: Maybe<string>;
  provider?: Maybe<string>;
  planNames?: Maybe<string[]>;
  phone?: Maybe<string>;
  alternatePhone?: Maybe<string>;
  email?: Maybe<string>;
  website?: Maybe<string>;
  address?: Maybe<string>;
  groupOrPolicyNumber?: Maybe<string>;
  hours?: Maybe<string>;
  additionalInfo?: Maybe<string>;
}

/* ------------------------------------------------------------------ */
/* Renderer-facing types (always fully populated)                      */
/* ------------------------------------------------------------------ */

export interface GridTableData {
  tableTitle: string;
  /** Heading shown above the row-label column (empty when not needed). */
  rowHeaderLabel: string;
  columnLabels: string[];
  rows: { rowLabel: string; cells: string[]; rowFootnote: string }[];
  footnotes: string[];
}

export interface CardLink {
  label: string;
  href: string;
}

export interface CardItem {
  title: string;
  subtitle: string;
  description: string;
  facts: KeyValueItem[];
  bullets: string[];
  links: CardLink[];
  table: GridTableData | null;
}

export interface KeyValueItem {
  label: string;
  value: string;
}

export interface NameValueItem {
  name: string;
  value: string;
}

export interface SectionTextData {
  heading: string;
  body: string;
  bullets: string[];
}

export type Block =
  | { id: string; kind: "section"; data: SectionTextData }
  | { id: string; kind: "table"; data: GridTableData }
  | {
      id: string;
      kind: "cards";
      title: string;
      data: CardItem[];
      /** "stack" renders full-width cards (one per row). Defaults to "grid". */
      layout?: "grid" | "stack";
    }
  | { id: string; kind: "keyValues"; title: string; data: KeyValueItem[] }
  | { id: string; kind: "iconFacts"; title: string; data: KeyValueItem[] }
  | { id: string; kind: "bullets"; title: string; data: string[] }
  | {
      id: string;
      kind: "nameValues";
      title: string;
      data: NameValueItem[];
      layout?: "list" | "cards";
    }
  | { id: string; kind: "contacts"; title: string; data: ContactCard[] }
  | {
      id: string;
      kind: "accountCards";
      title: string;
      subtitle: string;
      data: AccountCardItem[];
    }
  | { id: string; kind: "tabs"; title: string; data: TabItem[] };

export interface AccountCardItem {
  title: string;
  administrator: string;
  limitLabel: string;
  limitValue: string;
  bullets: string[];
}

export interface TabItem {
  label: string;
  blocks: Block[];
}

export interface NavEntry {
  pageSlug: string;
  pageTitle: string;
  chapterKey: string;
  pageType: PageType;
  parentChapterKey: string;
  showInNav: boolean;
}

export interface PageData {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  blocks: Block[];
}

export interface SiteMeta {
  employerName: string;
  brandDisplayName: string;
  planYear: string;
  siteTitle: string;
  siteDescription: string;
  homepageTitle: string;
  homepageSubtitle: string;
  homepageIntro: string;
  supportEmail: string;
  supportPhone: string;
  supportAddress: string;
  disclaimerText: string;
}

export interface HomeCard {
  title: string;
  window: string;
  body: string;
  ctaLabel: string;
  ctaTarget: string;
}

export interface ExploreGroup {
  groupKey: string;
  groupTitle: string;
  groupDescription: string;
  pages: { slug: string; title: string }[];
}

export interface Homepage {
  heroTitle: string;
  heroSubtitle: string;
  showOpenEnrollmentCard: boolean;
  openEnrollmentCard: HomeCard | null;
  showNewHireCard: boolean;
  newHireCard: HomeCard | null;
  exploreYourBenefits: ExploreGroup[];
}

export interface ContactCard {
  category: string;
  provider: string;
  planNames: string[];
  facts: KeyValueItem[];
  links: CardLink[];
  note: string;
}
