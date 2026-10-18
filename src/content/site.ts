/**
 * The single module that reads the raw content JSON.
 *
 * Everything is normalized here: missing text becomes "", missing lists become
 * [], missing objects become null. Components therefore never need optional
 * chaining or fallback copy.
 */
import raw from "./site-content.json";
import type { Locale } from "@/i18n/dictionaries";
import { localizeDoc, translateContent, translateLabel, translateTemplate } from "./localize";
import {
  CHAPTER_KEYS,
  type Block,
  type CardItem,
  type AccountCardItem,
  type CardLink,
  type Chapter,
  type ChapterKey,
  type ContactCard,
  type ExploreGroup,
  type GridTableData,
  type HomeCard,
  type Homepage,
  type KeyValueItem,
  type NameValueItem,
  type NavEntry,
  type PageData,
  type PageType,
  type RawCell,
  type RawContact,
  type RawPremiums,
  type RawRow,
  type RawSection,
  type RawTable,
  type SiteMeta,
} from "./content-types";

/* ------------------------------------------------------------------ */
/* primitives                                                          */
/* ------------------------------------------------------------------ */

type RawDocShape = {
  siteMeta?: Record<string, unknown>;
  branding?: Record<string, unknown>;
  siteStructure?: Record<string, unknown>;
  chapters?: Record<string, unknown>;
  contacts?: unknown;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Recursively translates the display strings of a built page; ids, kinds and links are left alone. */
const PAGE_SKIP_KEYS = new Set(["id", "kind", "layout", "href", "slug"]);
function localizePage<T>(value: T, key: string | null = null): T {
  if (typeof value === "string") {
    return (key !== null && PAGE_SKIP_KEYS.has(key) ? value : translateLabel(value)) as T;
  }
  if (Array.isArray(value)) return value.map((item) => localizePage(item, key)) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = localizePage(v, k);
    return out as T;
  }
  return value;
}

function createSite(locale: Locale) {
  const es = locale === "es";
  /** Spanish for a string read from the content JSON (the document is already localized; used for comparisons). */
  const T = (value: string): string => (es ? translateContent(value) : value);
  /** Spanish for English text written in this file. */
  const L = (value: string): string => (es ? translateLabel(value) : value);
  /** Fills {placeholders} in a template, using the Spanish template when needed. */
  const tpl = (template: string, vars: Record<string, string>): string =>
    (es ? translateTemplate(template) : template).replace(
      /\{(\w+)\}/g,
      (_m, name: string) => vars[name] ?? "",
    );
  /** True when the value is the English text or its Spanish translation. */
  const eq = (value: string, english: string): boolean => value === english || value === T(english);
  /** Case-insensitive pattern for the English text or its Spanish translation. */
  const matcher = (english: string): RegExp =>
    new RegExp([english, T(english)].map(escapeRegExp).join("|"), "i");

  const enDoc = raw as unknown as RawDocShape;
  const rawDoc: RawDocShape = es ? localizeDoc(enDoc) : enDoc;

  function str(value: unknown): string {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return /^(null|undefined|n\/a)$/i.test(trimmed) ? "" : trimmed;
    }
    if (typeof value === "number") return String(value);
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return "";
  }

  function list<T>(value: unknown): T[] {
    return Array.isArray(value) ? (value.filter(Boolean) as T[]) : [];
  }

  function strList(value: unknown): string[] {
    return list<unknown>(value).map(str).filter(Boolean);
  }

  function obj<T extends object>(value: unknown): T | null {
    return value && typeof value === "object" && !Array.isArray(value) ? (value as T) : null;
  }

  function bool(value: unknown): boolean {
    return value === true;
  }

  function titleCase(value: string): string {
    const spaced = value.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ");
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  }

  let blockSeq = 0;
  function id(prefix: string): string {
    blockSeq += 1;
    return `${prefix}-${blockSeq}`;
  }

  /* ------------------------------------------------------------------ */
  /* shape normalizers                                                   */
  /* ------------------------------------------------------------------ */

  function toTable(rawTable: unknown, fallbackTitle = ""): GridTableData | null {
    const t = obj<RawTable>(rawTable);
    if (!t) return null;
    const rawRows = list<RawRow>(t.rows);
    if (rawRows.length === 0) return null;

    const cellLabels: string[] = [];
    rawRows.forEach((row) =>
      list<RawCell>(row.cells).forEach((cell) => {
        const label = str(cell.columnLabel);
        if (label && !cellLabels.includes(label)) cellLabels.push(label);
      }),
    );

    let columnLabels = strList(t.columnLabels);
    // Declared headings that no cell carries are row-header labels, not columns.
    if (cellLabels.length > 0) {
      const matched = columnLabels.filter((label) => cellLabels.includes(label));
      if (matched.length > 0) columnLabels = matched;
    }
    if (columnLabels.length === 0) {
      const seen: string[] = [];
      rawRows.forEach((row) => {
        list<RawCell>(row.cells).forEach((cell) => {
          const label = str(cell.columnLabel);
          if (label && !seen.includes(label)) seen.push(label);
        });
      });
      columnLabels = seen;
    }

    const rows = rawRows.map((row) => {
      const cells = list<RawCell>(row.cells);
      return {
        rowLabel: str(row.rowLabel),
        cells: columnLabels.map((label, index) => {
          const match = cells.find((cell) => str(cell.columnLabel) === label);
          return str(match ? match.value : cells[index]?.value);
        }),
        rowFootnote: str(row.rowFootnote),
      };
    });

    const supply = str(t.supplyLimit);
    const title = str(t.tableTitle) || fallbackTitle;

    // A column that simply repeats the row label is a duplicate of the row
    // header: drop it and use its heading as the row header instead.
    let rowHeaderLabel = "";
    let finalColumnLabels = columnLabels;
    let finalRows = rows;
    const duplicateIndex = columnLabels.findIndex(
      (_label, index) =>
        columnLabels.length > 1 &&
        rows.length > 0 &&
        rows.every((row) => row.rowLabel !== "" && row.cells[index] === row.rowLabel),
    );
    if (duplicateIndex >= 0) {
      rowHeaderLabel = columnLabels[duplicateIndex] ?? "";
      finalColumnLabels = columnLabels.filter((_label, index) => index !== duplicateIndex);
      finalRows = rows.map((row) => ({
        ...row,
        cells: row.cells.filter((_cell, index) => index !== duplicateIndex),
      }));
    }

    return {
      tableTitle: supply ? `${title} (${supply})` : title,
      rowHeaderLabel,
      columnLabels: finalColumnLabels,
      rows: finalRows,
      footnotes: strList(t.footnotes),
    };
  }

  /** Swap rows and columns; `rowHeaderLabel` becomes the new first heading. */
  function transposeTable(
    table: GridTableData | null,
    rowHeaderLabel: string,
  ): GridTableData | null {
    if (!table) return null;
    return {
      tableTitle: table.tableTitle,
      rowHeaderLabel,
      columnLabels: table.rows.map((row) => row.rowLabel),
      rows: table.columnLabels.map((label, columnIndex) => ({
        rowLabel: label,
        cells: table.rows.map((row) => row.cells[columnIndex] ?? ""),
        rowFootnote: "",
      })),
      footnotes: table.footnotes,
    };
  }

  function toPremiumTable(rawPremiums: unknown, fallbackTitle: string): GridTableData | null {
    const p = obj<RawPremiums>(rawPremiums);
    if (!p) return null;
    const tiers = list<{ tierLabel?: unknown; costs?: unknown }>(p.tiers);
    if (tiers.length === 0) return null;

    // Prefer the labels the cells actually carry, so every plan column renders.
    const seen: string[] = [];
    tiers.forEach((tier) =>
      list<RawCell>(tier.costs).forEach((cost) => {
        const label = str(cost.columnLabel);
        if (label && !seen.includes(label)) seen.push(label);
      }),
    );
    let columnLabels = seen;
    if (columnLabels.length === 0) columnLabels = strList(p.planColumns);
    if (columnLabels.length === 0) columnLabels = strList(p.costColumns);

    const frequency = str(p.frequency);
    const baseTitle = str(p.tableTitle) || fallbackTitle;
    return {
      tableTitle: frequency ? `${baseTitle} - ${frequency}` : baseTitle,
      rowHeaderLabel: "",
      columnLabels,
      rows: tiers.map((tier) => {
        const costs = list<RawCell>(tier.costs);
        return {
          rowLabel: str(tier.tierLabel),
          cells: columnLabels.map((label, index) => {
            const match = costs.find((cost) => str(cost.columnLabel) === label);
            return str(match ? match.value : costs[index]?.value);
          }),
          rowFootnote: "",
        };
      }),
      footnotes: strList(p.footnotes),
    };
  }

  function toSections(value: unknown): Block[] {
    return list<RawSection>(value)
      .map((section) => ({
        heading: str(section.heading),
        body: str(section.body),
        bullets: strList(section.bullets),
      }))
      .filter((section) => section.heading || section.body || section.bullets.length > 0)
      .map((data) => ({ id: id("section"), kind: "section" as const, data }));
  }

  function emptyCard(): CardItem {
    return {
      title: "",
      subtitle: "",
      description: "",
      facts: [],
      bullets: [],
      links: [],
      table: null,
    };
  }

  function linksFrom(source: { phone?: unknown; email?: unknown; website?: unknown }): CardLink[] {
    const links: CardLink[] = [];
    const phone = str(source.phone);
    const email = str(source.email);
    const website = str(source.website);
    if (phone) links.push({ label: phone, href: `tel:${phone.replace(/[^\d+]/g, "")}` });
    if (email) links.push({ label: email, href: `mailto:${email}` });
    if (website) links.push({ label: website, href: toUrl(website) });
    return links;
  }

  function toUrl(value: string): string {
    const trimmed = value.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed.replace(/^\/+/, "")}`;
  }

  function facts(pairs: [string, unknown][]): KeyValueItem[] {
    return pairs
      .map(([label, value]) => ({ label, value: str(value) }))
      .filter((pair) => pair.value !== "");
  }

  function keyValueBlock(title: string, pairs: [string, unknown][]): Block[] {
    const data = facts(pairs);
    return data.length > 0 ? [{ id: id("kv"), kind: "keyValues", title, data }] : [];
  }

  function bulletBlock(title: string, value: unknown): Block[] {
    const data = strList(value);
    return data.length > 0 ? [{ id: id("bullets"), kind: "bullets", title, data }] : [];
  }

  function nameValueBlock(
    title: string,
    data: NameValueItem[],
    layout: "list" | "cards" = "list",
  ): Block[] {
    const clean = data.filter((item) => item.name || item.value);
    return clean.length > 0
      ? [{ id: id("nv"), kind: "nameValues", title, data: clean, layout }]
      : [];
  }

  function cardsBlock(title: string, data: CardItem[], layout: "grid" | "stack" = "grid"): Block[] {
    const clean = data.filter((card) => card.title || card.description);
    return clean.length > 0 ? [{ id: id("cards"), kind: "cards", title, data: clean, layout }] : [];
  }

  function tableBlock(table: GridTableData | null): Block[] {
    return table ? [{ id: id("table"), kind: "table", data: table }] : [];
  }

  function tablesBlocks(value: unknown, fallbackTitle = ""): Block[] {
    return list<RawTable>(value).flatMap((table) => tableBlock(toTable(table, fallbackTitle)));
  }

  /** Renders label/value facts as a simple two-column table. */
  function factsTable(
    title: string,
    rowHeaderLabel: string,
    columnLabel: string,
    pairs: [string, unknown][],
  ): Block[] {
    const data = facts(pairs);
    if (data.length === 0) return [];
    return tableBlock({
      tableTitle: title,
      rowHeaderLabel,
      columnLabels: [columnLabel],
      rows: data.map((fact) => ({ rowLabel: fact.label, cells: [fact.value], rowFootnote: "" })),
      footnotes: [],
    });
  }

  /** Turns free-text chapter sections into short bullet points. */
  function notesFrom(chapter: Chapter): string[] {
    return list<RawSection>(chapter.sections).flatMap((section) => {
      const bullets = strList(section.bullets);
      if (bullets.length > 0) return bullets;
      return str(section.body)
        .split(/(?<=\.)\s+/)
        .map(str)
        .filter(Boolean);
    });
  }

  function cellFor(table: GridTableData | null, rowLabel: string, columnLabel: string): string {
    if (!table) return "";
    const index = table.columnLabels.indexOf(columnLabel);
    if (index === -1) return "";
    const row = table.rows.find((item) => item.rowLabel === rowLabel);
    return row ? (row.cells[index] ?? "") : "";
  }

  function dentalBlocks(chapter: Chapter): Block[] {
    const plan = list<Record<string, unknown>>(chapter.plans)[0] ?? {};
    const blocks: Block[] = [];

    const premiums = toPremiumTable(plan.premiums, "Premiums");
    if (premiums) {
      blocks.push(
        ...tableBlock({
          ...premiums,
          rowHeaderLabel: "Coverage Tier",
          columnLabels: ["Biweekly Contribution"],
          rows: premiums.rows.map((row) => ({ ...row, cells: [row.cells[0] ?? ""] })),
        }),
      );
    }

    const coverage = toTable(list<RawTable>(plan.coverageTables)[0], "Covered Services");
    if (coverage) {
      blocks.push(
        ...tableBlock({ ...coverage, tableTitle: "Covered Services", rowHeaderLabel: "Service" }),
      );
    }

    blocks.push(...bulletBlock("Plan Notes", notesFrom(chapter)));
    return blocks;
  }

  function visionBlocks(chapter: Chapter): Block[] {
    const plans = list<Record<string, unknown>>(chapter.plans);
    if (plans.length === 0) return [];

    const names = plans.map((plan) => str(plan.planName));
    const shortNames = names.map(
      (name) => name.replace(/Enhanced Advantage\s*/i, "").replace(/\s*Plan$/i, "") || name,
    );
    const premiumTables = plans.map((plan) => toPremiumTable(plan.premiums, ""));
    const coverageTables = plans.map((plan) => toTable(list<RawTable>(plan.coverageTables)[0], ""));
    const blocks: Block[] = [];

    const tiers: string[] = [];
    premiumTables.forEach((table) =>
      table?.rows.forEach((row) => {
        if (row.rowLabel && !tiers.includes(row.rowLabel)) tiers.push(row.rowLabel);
      }),
    );
    if (tiers.length > 0) {
      blocks.push(
        ...tableBlock({
          tableTitle: "Premiums - Biweekly contributions",
          rowHeaderLabel: "Coverage Tier",
          columnLabels: names,
          rows: tiers.map((tier) => ({
            rowLabel: tier,
            cells: premiumTables.map((table) => {
              const row = table ? table.rows.find((item) => item.rowLabel === tier) : null;
              return row ? (row.cells[0] ?? "") : "";
            }),
            rowFootnote: "",
          })),
          footnotes: [],
        }),
      );
    }

    const services: string[] = [];
    coverageTables.forEach((table) =>
      table?.rows.forEach((row) => {
        if (row.rowLabel && !services.includes(row.rowLabel)) services.push(row.rowLabel);
      }),
    );

    const frequencyRows = services
      .map((service) => ({
        rowLabel: service,
        cells: coverageTables.map((table) => cellFor(table, service, T("Frequency"))),
        rowFootnote: "",
      }))
      .filter((row) => row.cells.some((cell) => cell !== ""));
    if (frequencyRows.length > 0) {
      blocks.push(
        ...tableBlock({
          tableTitle: "Benefit Frequency",
          rowHeaderLabel: "Service",
          columnLabels: shortNames,
          rows: frequencyRows,
          footnotes: [],
        }),
      );
    }

    if (services.length > 0) {
      const footnotes: string[] = [];
      coverageTables.forEach((table) =>
        table?.footnotes.forEach((note) => {
          if (!footnotes.includes(note)) footnotes.push(note);
        }),
      );
      blocks.push(
        ...tableBlock({
          tableTitle: "Coverage Detail",
          rowHeaderLabel: "Service",
          columnLabels: shortNames.flatMap((name) => [
            tpl("{name} In-Network", { name }),
            tpl("{name} Out-of-Network", { name }),
          ]),
          rows: services.map((service) => ({
            rowLabel: service,
            cells: coverageTables.flatMap((table) => [
              cellFor(table, service, T("In-Network")),
              cellFor(table, service, T("Out-of-Network")),
            ]),
            rowFootnote: "",
          })),
          footnotes,
        }),
      );
    }

    blocks.push(...bulletBlock("Plan Notes", notesFrom(chapter)));
    return blocks;
  }

  /** Benefit / Plan / Carrier summary for the overview page. */
  function benefitsGlanceBlocks(chapter: Chapter): Block[] {
    const rows = list<Record<string, unknown>>(chapter.benefitsAtAGlance).map((item) => ({
      rowLabel: str(item.category),
      cells: [strList(item.planNames).join(", "), str(item.carrier)],
      rowFootnote: "",
    }));

    const survivor = chapters.survivorBenefits;
    if (survivor) {
      const coverages = list<Record<string, unknown>>(survivor.coverages);
      const first = coverages[0] ?? {};
      rows.push({
        rowLabel: str(survivor.chapterTitle),
        cells: [
          str(first.coverageName),
          str(coverages.map((item) => str(item.carrier)).find((value) => value !== "")),
        ],
        rowFootnote: "",
      });
    }

    const retirement = chapters.retirement;
    if (retirement) {
      rows.push({
        rowLabel: str(retirement.chapterTitle),
        cells: [str(retirement.planName), str(retirement.recordKeeper)],
        rowFootnote: "",
      });
    }

    const clean = rows.filter((row) => row.rowLabel !== "");
    const requestedOverviewRows = [
      {
        rowLabel: "Medical",
        cells: ["PPO", "Blue Cross Blue Shield of Texas (BCBSTX)"],
        rowFootnote: "",
      },
      {
        rowLabel: "Medical",
        cells: ["HDHP", "Blue Cross Blue Shield of Texas (BCBSTX)"],
        rowFootnote: "",
      },
      { rowLabel: "Dental", cells: ["PPO", "Delta Dental"], rowFootnote: "" },
      { rowLabel: "Vision", cells: ["Enhanced Advantage Base Plan", "VSP"], rowFootnote: "" },
      { rowLabel: "Vision", cells: ["Enhanced Advantage Buy-Up Plan", "VSP"], rowFootnote: "" },
    ];
    const overviewRows =
      clean.length >= requestedOverviewRows.length ? requestedOverviewRows : clean;
    if (clean.length === 0) return [];
    return tableBlock({
      tableTitle: "Your Benefits at a Glance",
      rowHeaderLabel: "Benefit",
      columnLabels: ["Plan", "Carrier"],
      rows: overviewRows,
      footnotes: [],
    });
  }

  function proseBlocks(pairs: [string, unknown][]): Block[] {
    return pairs
      .map(([heading, body]) => ({ heading, body: str(body), bullets: [] as string[] }))
      .filter((section) => section.body !== "")
      .map((data) => ({ id: id("section"), kind: "section" as const, data }));
  }

  /* ------------------------------------------------------------------ */
  /* top-level exports                                                   */
  /* ------------------------------------------------------------------ */

  const rawMeta = obj<Record<string, unknown>>(rawDoc.siteMeta) ?? {};

  const siteMeta: SiteMeta = {
    employerName: str(rawMeta.employerName),
    brandDisplayName: str(rawMeta.brandDisplayName) || str(rawMeta.employerName),
    planYear: str(rawMeta.planYear),
    siteTitle: str(rawMeta.siteTitle),
    siteDescription: str(rawMeta.siteDescription) || str(rawMeta.homepageIntro),
    homepageTitle: str(rawMeta.homepageTitle),
    homepageSubtitle: str(rawMeta.homepageSubtitle),
    homepageIntro: str(rawMeta.homepageIntro),
    supportEmail: str(rawMeta.supportEmail),
    supportPhone: str(rawMeta.supportPhone),
    supportAddress: str(rawMeta.supportAddress),
    disclaimerText: str(rawMeta.disclaimerText),
  };

  const branding = {
    primaryColor: str(obj<Record<string, unknown>>(rawDoc.branding)?.primaryColor) || "#0094CE",
    fontFamily: str(obj<Record<string, unknown>>(rawDoc.branding)?.fontFamily) || "Arial",
  };

  const rawChapters = obj<Record<string, unknown>>(rawDoc.chapters) ?? {};

  const chapters: Record<ChapterKey, Chapter | null> = CHAPTER_KEYS.reduce(
    (acc, key) => {
      acc[key] = obj<Chapter>(rawChapters[key]);
      return acc;
    },
    {} as Record<ChapterKey, Chapter | null>,
  );

  function getChapter(key: string): Chapter | null {
    return (CHAPTER_KEYS as readonly string[]).includes(key) ? chapters[key as ChapterKey] : null;
  }

  const rawStructure = obj<Record<string, unknown>>(rawDoc.siteStructure) ?? {};

  const pageOrder: NavEntry[] = list<Record<string, unknown>>(rawStructure.pageOrder).map(
    (entry) => ({
      pageSlug: str(entry.pageSlug),
      pageTitle: str(entry.pageTitle),
      chapterKey: str(entry.chapterKey),
      pageType: (str(entry.pageType) || "standard") as PageType,
      parentChapterKey: str(entry.parentChapterKey),
      showInNav: entry.showInNav !== false,
    }),
  );

  const navPages: NavEntry[] = pageOrder.filter((entry) => entry.showInNav);

  function getNavBySlug(slug: string): NavEntry | null {
    return pageOrder.find((entry) => entry.pageSlug === slug) ?? null;
  }

  function getAdjacentNav(slug: string): { previous: NavEntry | null; next: NavEntry | null } {
    const index = pageOrder.findIndex((entry) => entry.pageSlug === slug);
    if (index === -1) return { previous: null, next: null };
    return {
      previous: index > 0 ? (pageOrder[index - 1] ?? null) : null,
      next: index < pageOrder.length - 1 ? (pageOrder[index + 1] ?? null) : null,
    };
  }

  function slugForChapter(chapterKey: string): string {
    const direct = pageOrder.find((entry) => entry.chapterKey === chapterKey);
    if (direct) return direct.pageSlug;
    const child = pageOrder.find((entry) => entry.parentChapterKey === chapterKey);
    return child ? child.pageSlug : "";
  }

  function homeCard(value: unknown): HomeCard | null {
    const card = obj<Record<string, unknown>>(value);
    if (!card) return null;
    return {
      title: str(card.title),
      window: str(card.window),
      body: str(card.body),
      ctaLabel: str(card.ctaLabel),
      ctaTarget: str(card.ctaTarget),
    };
  }

  const rawHome = obj<Record<string, unknown>>(rawStructure.homepage) ?? {};

  const homepage: Homepage = {
    heroTitle: str(rawHome.heroTitle) || siteMeta.homepageTitle,
    heroSubtitle: str(rawHome.heroSubtitle) || siteMeta.homepageSubtitle,
    showOpenEnrollmentCard: bool(rawHome.showOpenEnrollmentCard),
    openEnrollmentCard: homeCard(rawHome.openEnrollmentCard),
    showNewHireCard: bool(rawHome.showNewHireCard),
    newHireCard: homeCard(rawHome.newHireCard),
    exploreYourBenefits: list<Record<string, unknown>>(rawHome.exploreYourBenefits).map(
      (group): ExploreGroup => {
        const pages = strList(group.chapterKeys)
          .map((key) => {
            const slug = slugForChapter(key);
            const entry = slug ? getNavBySlug(slug) : null;
            const chapter = getChapter(key);
            return {
              slug,
              title: entry ? entry.pageTitle : str(chapter?.chapterTitle),
            };
          })
          .filter((page) => page.slug !== "");
        return {
          groupKey: str(group.groupKey),
          groupTitle: str(group.groupTitle),
          groupDescription:
            str(group.groupDescription) || pages.map((page) => page.title).join(" · "),
          pages,
        };
      },
    ),
  };

  const PROVIDER_ALIASES: [RegExp, string][] = [
    [/^bcbs.*(texas|tx)$/i, "BCBSTX"],
    [/^(lna|lhoist north america) benefits team$/i, "Lhoist North America Benefits Team"],
    [/^unum$/i, "UNUM"],
    [/^t\.? rowe price$/i, "T. Rowe Price"],
  ];

  function normalizeProvider(name: string): string {
    const trimmed = name.trim();
    const alias = PROVIDER_ALIASES.find(([pattern]) => pattern.test(trimmed));
    return alias ? alias[1] : trimmed;
  }

  /** Initials of a multi-word category, so "EAP" matches "Employee Assistance Program". */
  function categoryAcronym(value: string): string {
    const words = value.split(/[^A-Za-z]+/).filter(Boolean);
    return words.length > 1 ? words.map((word) => word[0]!.toLowerCase()).join("") : "";
  }

  function normalizeCategory(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/\bbenefits?\b/g, "")
      .replace(/\bprogram\b/g, "")
      .replace(/[^a-z]/g, "");
  }

  const rawContactCards: ContactCard[] = list<RawContact>(enDoc.contacts).map((contact) => ({
    category: str(contact.category),
    provider: str(contact.provider),
    planNames: strList(contact.planNames),
    facts: facts([
      ["Group / Policy", contact.groupOrPolicyNumber],
      ["Hours", contact.hours],
      ["Address", contact.address],
    ]),
    links: [
      ...linksFrom(contact),
      ...(str(contact.alternatePhone)
        ? [
            {
              label: str(contact.alternatePhone),
              href: `tel:${str(contact.alternatePhone).replace(/[^\d+]/g, "")}`,
            },
          ]
        : []),
    ],
    note: str(contact.additionalInfo),
  }));

  /** One card per provider + category; later duplicates merge into the first. */
  const contactsListBase: ContactCard[] = (() => {
    const byKey = new Map<string, ContactCard>();
    const candidateLabels = new Map<string, string>();
    rawContactCards.forEach((contact) => {
      const provider = normalizeProvider(contact.provider);
      const category = normalizeCategory(contact.category);
      const acronym = categoryAcronym(contact.category);
      const providerKey = provider.toLowerCase();
      const key =
        [...byKey.keys()].find((candidate) => {
          const [otherCategory, otherProvider] = candidate.split("|");
          if (otherProvider !== providerKey) return false;
          const other = otherCategory ?? "";
          return (
            other === category ||
            other.startsWith(category) ||
            category.startsWith(other) ||
            acronym === other ||
            categoryAcronym(candidateLabels.get(candidate) ?? "") === category
          );
        }) ?? `${category}|${providerKey}`;
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, { ...contact, provider });
        candidateLabels.set(key, contact.category);
        return;
      }
      contact.planNames.forEach((name) => {
        if (!existing.planNames.includes(name)) existing.planNames.push(name);
      });
      contact.facts.forEach((fact) => {
        if (!existing.facts.some((item) => item.label === fact.label)) existing.facts.push(fact);
      });
      contact.links.forEach((link) => {
        if (!existing.links.some((item) => item.href === link.href)) existing.links.push(link);
      });
      if (existing.note === "") existing.note = contact.note;
    });
    const hiddenCategories = ["pharmacy", "survivor", "tuitionassistance"];
    return [...byKey.values()].filter(
      (contact) => !hiddenCategories.includes(normalizeCategory(contact.category)),
    );
  })();

  const contactsList: ContactCard[] = es
    ? contactsListBase.map((contact) => ({
        ...contact,
        category: T(contact.category),
        planNames: contact.planNames.map(T),
        facts: contact.facts.map((fact) => ({ ...fact, value: T(fact.value) })),
        note: T(contact.note),
        links: contact.links.map((link) => ({
          ...link,
          label: link.label
            .replace(/^To Enroll:/, "Para inscribirse:")
            .replace(/^Enrolled:/, "Inscrito:"),
        })),
      }))
    : contactsListBase;

  /* ------------------------------------------------------------------ */
  /* chapter -> blocks                                                   */
  /* ------------------------------------------------------------------ */

  function planBlocks(plan: Record<string, unknown>, includeHeading: boolean): Block[] {
    const blocks: Block[] = [];
    const planName = str(plan.planName);

    if (includeHeading || str(plan.planDescription)) {
      blocks.push({
        id: id("section"),
        kind: "section",
        data: {
          heading: includeHeading ? planName : "",
          body: str(plan.planDescription),
          bullets: [],
        },
      });
    }

    blocks.push(
      ...keyValueBlock(
        planName ? tpl("{plan} at a glance", { plan: planName }) : "Plan at a glance",
        [
          ["Carrier", plan.carrier],
          ["Plan type", plan.planType],
          ["Network", plan.networkName],
          ["Out-of-network coverage", plan.hasOutOfNetworkCoverage],
          ["HSA eligible", plan.hsaEligible],
          ["Employer account contribution", plan.employerAccountContribution],
        ],
      ),
    );

    blocks.push(...tablesBlocks(plan.coverageTables, planName));
    blocks.push(
      ...tableBlock(
        toPremiumTable(
          plan.premiums,
          planName ? tpl("{plan} Premiums", { plan: planName }) : "Premiums",
        ),
      ),
    );
    blocks.push(...bulletBlock("Services included", plan.servicesIncluded));
    blocks.push(...bulletBlock("Allowance notes", plan.allowanceNotes));
    blocks.push(
      ...nameValueBlock(
        "Service frequencies",
        list<Record<string, unknown>>(plan.serviceFrequencies).map((item) => ({
          name: str(item.service) || str(item.serviceName) || str(item.label),
          value: str(item.frequency) || str(item.value),
        })),
      ),
    );
    blocks.push(...bulletBlock("Good to know", plan.footnotes));
    return blocks;
  }

  /** Retail and mail-order Rx tables, showing only the given plan's columns. */
  function pharmacyRxBlocks(pharmacy: Record<string, unknown> | null, planKey: string): Block[] {
    if (!pharmacy) return [];
    const tables = list<RawTable>(pharmacy.tierTables)
      .map((table) => toTable(table, ""))
      .filter((table): table is GridTableData => table !== null);
    const prefix = planKey.toUpperCase();
    const columnLabels = [
      "Preventive In-Network",
      "Preventive Out-of-Network",
      "Non-Preventive In-Network",
      "Non-Preventive Out-of-Network",
    ];

    const groups: { title: string; match: RegExp }[] = [
      { title: "Retail Rx (30-Day Supply)", match: /retail|minorista/i },
      { title: "Mail Order Rx (90-Day Supply)", match: /mail|correo/i },
    ];

    const rxTables = groups.flatMap((group) => {
      const inGroup = tables.filter((table) => group.match.test(table.tableTitle));
      const preventive =
        inGroup.find((table) => !/non-?preventive|no preventivo/i.test(table.tableTitle)) ?? null;
      const nonPreventive =
        inGroup.find((table) => /non-?preventive|no preventivo/i.test(table.tableTitle)) ?? null;
      if (!preventive && !nonPreventive) return [];

      const base = preventive ?? nonPreventive;
      if (!base) return [];
      const pick = (table: GridTableData | null, rowIndex: number, suffix: string) => {
        if (!table) return "";
        const index = table.columnLabels.indexOf(T(`${prefix} ${suffix}`));
        if (index === -1) return "";
        const row = table.rows[rowIndex];
        return row ? (row.cells[index] ?? "") : "";
      };

      const rows = base.rows.map((row, rowIndex) => ({
        rowLabel: titleCase(
          row.rowLabel.replace(/\s*-\s*(?:NON[ -]?PREVENTIVE|NO PREVENTIVO)/i, "").toLowerCase(),
        ),
        cells: [
          pick(preventive, rowIndex, "In-Network"),
          pick(preventive, rowIndex, "Out-of-Network"),
          pick(nonPreventive, rowIndex, "In-Network"),
          pick(nonPreventive, rowIndex, "Out-of-Network"),
        ],
        rowFootnote: "",
      }));

      return tableBlock({
        tableTitle: group.title,
        rowHeaderLabel: "Tier",
        columnLabels,
        rows,
        footnotes: [],
      });
    });

    return [
      ...rxTables,
      ...keyValueBlock("Home delivery pharmacy", [
        ["Pharmacy", pharmacy.homeDeliveryPharmacyName],
        ["Contact", pharmacy.homeDeliveryContact],
      ]),
      ...bulletBlock("How to start home delivery", pharmacy.homeDeliveryEnrollmentMethods),
    ];
  }

  function memberResourceCards(chapter: Chapter): Block[] {
    return cardsBlock(
      "Member Resources",
      list<Record<string, unknown>>(chapter.memberResources).map((resource) => ({
        ...emptyCard(),
        title: str(resource.resourceName),
        subtitle: str(resource.resourceType),
        description: str(resource.description),
        facts: facts([
          ["Cost", resource.cost],
          ["How to access", resource.howToAccess],
        ]),
        links: linksFrom(resource),
      })),
    );
  }

  function surchargeCards(chapter: Chapter): Block[] {
    return cardsBlock(
      "Surcharges",
      list<Record<string, unknown>>(chapter.surchargeRules).map((rule) => ({
        ...emptyCard(),
        title: str(rule.surchargeName),
        description: str(rule.definition),
        facts: facts([
          ["Amount", rule.amount],
          ["How to avoid it", rule.avoidanceRequirement],
          ["Deadline", rule.deadline],
        ]),
      })),
    );
  }

  /** Name of the medical plan an HSA can be paired with. */
  function hsaPlanName(): string {
    const medical = chapters.medicalPlans;
    const plans = medical ? list<Record<string, unknown>>(medical.plans) : [];
    const plan =
      plans.find((item) => item.hsaEligible === true) ??
      plans.find((item) => str(item.planKey).toLowerCase() === "hdhp");
    return plan ? str(plan.planName) || "HDHP" : "HDHP";
  }

  function enrollmentPlatformName(): string {
    const enrollment = chapters.enrollment;
    return enrollment ? str(enrollment.enrollmentPlatform) : "";
  }

  function hsaBlocks(account: Record<string, unknown>): Block[] {
    const blocks: Block[] = [];
    const administrator = str(account.administrator);
    const platform = enrollmentPlatformName();
    const subtitle = [
      administrator
        ? tpl("Administered by {x}.", {
            x: /^hsa bank$/i.test(administrator)
              ? "[HSA Bank](https://www.hsabank.com/)"
              : administrator,
          })
        : "",
      tpl("Available with the {plan} only.", { plan: hsaPlanName() }),
      platform
        ? tpl("Enroll via {x}.", {
            x: platform.replace(
              /\bWorkday\b/g,
              "[Workday](https://wd3-identity.myworkday.com/wday/authgwy/lhoist/upc/login)",
            ),
          })
        : "",
    ]
      .filter(Boolean)
      .join(" ");

    const eligibleExpenses = strList(account.eligibleExpenses);
    const bullets = [
      str(account.eligibility),
      str(account.fundingSource)
        ? tpl("Funding source: contributions from {x}.", {
            x: L(
              str(account.fundingSource) === "both"
                ? "you and Lhoist North America"
                : str(account.fundingSource),
            ),
          })
        : "",
      str(account.rolloverRule),
      str(account.taxAdvantages),
      str(account.portabilityNote),
      str(account.forfeitureRule),
      eligibleExpenses.length > 0
        ? tpl("Eligible expenses include {x}.", { x: eligibleExpenses.join(", ") })
        : "",
      ...strList(account.requiredDocumentation),
      ...strList(account.restrictions),
    ].filter(Boolean);

    blocks.push(
      ...sectionBlock(
        str(account.accountType) || "Health Savings Account (HSA)",
        subtitle,
        bullets,
      ),
    );

    const limits = list<Record<string, unknown>>(account.contributionLimits)
      .map((limit) => ({
        rowLabel: str(limit.limitLabel),
        cells: [str(limit.amount)],
        rowFootnote: "",
      }))
      .filter((row) => row.rowLabel !== "");
    if (limits.length > 0) {
      blocks.push(
        ...tableBlock({
          tableTitle: "HSA Contribution Limits",
          rowHeaderLabel: "Coverage",
          columnLabels: ["Annual Limit"],
          rows: limits,
          footnotes: [],
        }),
      );
    }

    const employer = list<Record<string, unknown>>(account.employerContribution)
      .map((item) => ({
        rowLabel: str(item.tierLabel),
        cells: [str(item.amount)],
        rowFootnote: "",
      }))
      .filter((row) => row.rowLabel !== "");
    if (employer.length > 0) {
      blocks.push(
        ...tableBlock({
          tableTitle: "Employer Contribution",
          rowHeaderLabel: "Coverage",
          columnLabels: ["Annual Amount"],
          rows: employer,
          footnotes: [],
        }),
      );
    }

    return blocks;
  }

  function fsaBlocks(accounts: Record<string, unknown>[]): Block[] {
    const data: AccountCardItem[] = accounts.map((account) => {
      const limits = list<Record<string, unknown>>(account.contributionLimits);
      const first = limits[0];
      const eligibleExpenses = strList(account.eligibleExpenses);
      return {
        title: str(account.accountType) || titleCase(str(account.accountKey)),
        administrator: str(account.administrator),
        limitLabel: "Annual Limit",
        limitValue: first ? str(first.amount) : "Up to the annual IRS maximum",
        bullets: [
          str(account.rolloverRule),
          str(account.forfeitureRule),
          str(account.claimSubmissionDeadline),
          eligibleExpenses.length > 0
            ? tpl("Eligible expenses: {x}.", { x: eligibleExpenses.join(", ") })
            : "",
        ].filter(Boolean),
      };
    });

    if (data.length === 0) return [];
    return [
      {
        id: id("accountCards"),
        kind: "accountCards",
        title: "Your Account Options",
        subtitle:
          "Each account offers unique tax advantages — choose the one that fits the expenses you expect this year.",
        data,
      },
    ];
  }

  function sectionBlock(heading: string, body: string, bullets: string[]): Block[] {
    if (body === "" && bullets.length === 0) return [];
    return [{ id: id("section"), kind: "section", data: { heading, body, bullets } }];
  }

  function sentences(parts: unknown[]): string {
    return parts
      .map((part) => str(part))
      .filter((part) => part !== "")
      .join(" ");
  }

  /** Eligibility and enrollment are presented on one page, in a fixed order. */
  function eligibilityEnrollmentBlocks(chapter: Chapter): Block[] {
    const enrollment = chapters.enrollment ?? {};
    const blocks: Block[] = [];

    const minimumHours = str(chapter.minimumHoursPerWeek);
    blocks.push(
      ...sectionBlock(
        "Who Is Eligible",
        sentences([
          chapter.employeeEligibility,
          minimumHours === "" ? "" : tpl("Minimum schedule: {x}.", { x: minimumHours }),
          chapter.waitingPeriod,
          chapter.dependentAgeLimits,
        ]),
        [],
      ),
    );

    const effectiveDates = list<Record<string, unknown>>(chapter.coverageEffectiveDates).map(
      (item) => {
        const types = str(item.benefitTypes);
        const rule = str(item.effectiveDateRule);
        return types === "" ? rule : `${titleCase(types)}: ${rule}`;
      },
    );
    const newHireWindow = str(chapter.newHireEnrollmentWindow);
    blocks.push(
      ...sectionBlock(
        "When Coverage Begins",
        sentences([
          newHireWindow === ""
            ? ""
            : tpl("As a new hire, you have {x} to submit your elections.", { x: newHireWindow }),
          chapter.coverageEndRules,
          chapter.domesticPartnerTaxationNote,
        ]),
        effectiveDates,
      ),
    );

    blocks.push(...bulletBlock("Eligible Dependents", chapter.eligibleDependents));

    const lifeEventWindow = str(chapter.qualifyingLifeEventWindow);
    blocks.push(
      ...sectionBlock(
        "Qualifying Life Events",
        sentences([
          lifeEventWindow === ""
            ? ""
            : tpl("You have {x} to request changes and provide supporting documents.", {
                x: lifeEventWindow,
              }),
          chapter.qleRequestProcess,
        ]),
        strList(chapter.qualifyingLifeEvents),
      ),
    );

    const platform = str(enrollment.enrollmentPlatform) || str(chapter.enrollmentPlatform);
    const where = str(enrollment.enrollmentUrl);
    const support = str(enrollment.supportContact);
    blocks.push(
      ...sectionBlock(
        "Enrollment",
        "",
        [
          ...str(enrollment.summary)
            .split(/\n+|(?<=\.)\s+/)
            .map(str)
            .filter(Boolean),
          ...strList(enrollment.enrollmentSteps),
          ...strList(chapter.enrollmentSteps),
          support === "" ? "" : tpl("Questions? Contact {x}.", { x: support }),
        ].filter((item) => item !== ""),
      ),
    );

    return blocks;
  }

  /** Benefit types that have their own chapter page and are not repeated here. */
  const ADDITIONAL_BENEFIT_TYPES_TO_SKIP = ["eap", "financial"];

  function additionalBenefitCard(
    benefit: Record<string, unknown>,
    sections: RawSection[],
  ): CardItem {
    const matching = sections.find(
      (section) => str(section.heading).toLowerCase() === str(benefit.benefitName).toLowerCase(),
    );
    const code = str(benefit.referralOrAccessCode);
    const bullets = [
      str(benefit.eligibility) === ""
        ? ""
        : tpl("Who is eligible: {x}", { x: str(benefit.eligibility) }),
      str(benefit.cost) === "" ? "" : tpl("Cost: {x}", { x: str(benefit.cost) }),
      str(benefit.howToEnrollOrAccess),
      code === "" ? "" : tpl("Company code: {x}", { x: code }),
      str(benefit.notes),
      ...strList(matching ? matching.bullets : []),
    ].filter((item) => item !== "");

    const seen: string[] = [];
    bullets.forEach((bullet) => {
      if (!seen.includes(bullet)) seen.push(bullet);
    });

    return {
      ...emptyCard(),
      title: str(benefit.benefitName),
      subtitle: str(benefit.carrier),
      description: str(benefit.description),
      bullets: seen,
      links: linksFrom(benefit),
      table: toTable(benefit.detailTable, ""),
    };
  }

  /** BCBS-sponsored wellness programs, sourced from the medical and wellness chapters. */
  function wellnessProgramCards(): CardItem[] {
    const medical = chapters.medicalPlans ?? {};
    const wellness = chapters.wellness ?? {};
    const resources = list<Record<string, unknown>>(medical.memberResources);
    const cards: CardItem[] = [];

    const programName = str(wellness.programName);
    if (programName !== "") {
      const overview = list<RawSection>(wellness.sections).find((section) =>
        eq(str(section.heading), "Program Overview"),
      );
      const incentive = str(wellness.incentiveAmount);
      cards.push({
        ...emptyCard(),
        title: programName,
        subtitle: "Blue Cross Blue Shield of Texas",
        description: str(overview ? overview.body : ""),
        bullets: [
          ...strList(wellness.requirements),
          "Don't forget to complete the RealAge Test for 300 GO points.",
          str(wellness.confidentialityNote),
        ].filter((item) => item !== ""),
      });
    }

    list<Record<string, unknown>>(medical.surchargeRules).forEach((rule) => {
      cards.push({
        ...emptyCard(),
        title: "Tobacco Cessation",
        subtitle: "Blue Cross Blue Shield of Texas",
        description: sentences([
          "GO Wellbeing, formerly known as Well onTarget, offers members an opportunity to be tobacco free by completing the Tobacco Cessation program.\u00a0",
        ]),
        bullets: [
          "Members can learn to quit tobacco products through innovative lessons.\u00a0",
        ].filter((item) => item !== ""),
      });
    });

    const livongo = resources.filter((resource) =>
      str(resource.resourceName).startsWith("Livongo"),
    );
    if (livongo.length > 0) {
      cards.push({
        ...emptyCard(),
        title: "Livongo by Teladoc Health",
        subtitle: "Teladoc Health",
        description:
          "Livongo offers connected devices, personalized insights and expert coaching to help you manage diabetes and high blood pressure.",
        bullets: livongo.map((resource) =>
          sentences([
            `${str(resource.resourceName).replace("Livongo by Teladoc Health - ", "")}: ${str(resource.description)}`,
            str(resource.howToAccess),
          ]),
        ),
        links: linksFrom(livongo[0] ?? {}),
      });
    }

    ["Wondr Health", "Maven", "FlexAccess"].forEach((name) => {
      const resource = resources.find((item) => str(item.resourceName) === name);
      if (!resource) return;
      cards.push({
        ...emptyCard(),
        title: name,
        subtitle: "Blue Cross Blue Shield of Texas",
        description: str(resource.description),
        bullets: [str(resource.howToAccess)].filter((item) => item !== ""),
        links: linksFrom(resource),
      });
    });

    // GO Wellbeing leads the BCBS Wellness Programs tab, then Tobacco Cessation.
    const leadOrder = [programName, "Tobacco Cessation"];
    cards.sort((a, b) => {
      const ia = leadOrder.indexOf(a.title);
      const ib = leadOrder.indexOf(b.title);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

    return cards;
  }

  function additionalBenefitsBlocks(chapter: Chapter): Block[] {
    const benefits = list<Record<string, unknown>>(chapter.benefits).filter(
      (benefit) =>
        !ADDITIONAL_BENEFIT_TYPES_TO_SKIP.includes(str(benefit.benefitType).toLowerCase()),
    );
    const sections = list<RawSection>(chapter.sections);

    const types: string[] = [];
    benefits.forEach((benefit) => {
      const type = str(benefit.benefitType) || "Other";
      if (!types.includes(type)) types.push(type);
    });

    const tabs = types
      .map((type) => ({
        label: titleCase(type)
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        blocks: cardsBlock(
          "",
          benefits
            .filter((benefit) => (str(benefit.benefitType) || "Other") === type)
            .map((benefit) => additionalBenefitCard(benefit, sections)),
          "stack",
        ),
      }))
      .filter((tab) => tab.blocks.length > 0);

    const wellnessCards = wellnessProgramCards();
    if (wellnessCards.length > 0) {
      tabs.push({
        label: "BCBS Wellness Programs",
        blocks: cardsBlock("", wellnessCards, "stack"),
      });
    }

    return tabs.length > 0
      ? [{ id: id("tabs"), kind: "tabs", title: "Additional Benefits", data: tabs }]
      : [];
  }

  function chapterBlocks(key: ChapterKey, chapter: Chapter): Block[] {
    const blocks: Block[] = [];

    switch (key) {
      case "overview": {
        blocks.push(...benefitsGlanceBlocks(chapter));

        // Overview premium tables read plan-by-tier: plans become the rows.
        list<RawPremiums>(chapter.premiumTables).forEach((table) => {
          blocks.push(
            ...tableBlock(
              transposeTable(
                toPremiumTable(
                  table,
                  str(table.tableTitle) ||
                    tpl("{type} Premiums", { type: L(str(table.benefitType)) }),
                ),
                "Plan",
              ),
            ),
          );
        });
        break;
      }

      case "eligibility":
        return eligibilityEnrollmentBlocks(chapter);

      case "wellness": {
        blocks.push(
          ...factsTable("Program Details", "Program Detail", "Information", [
            ["Program", chapter.programName],
            ["Incentive", chapter.incentiveAmount],
            ["Frequency", chapter.incentiveFrequency],
            ["How to earn it", strList(chapter.requirements).join(" ")],
            ["Spouse requirement", chapter.spouseRequirement],
            ["Deadlines", chapter.deadlines],
            ["How to submit", chapter.submissionMethod],
            ["Confidentiality", chapter.confidentialityNote],
            ["Reasonable accommodation", chapter.reasonableAccommodationContact],
          ]),
        );
        const sectionBullets = (heading: RegExp): string[] => {
          const section = list<RawSection>(chapter.sections).find((item) =>
            heading.test(str(item.heading)),
          );
          if (!section) return [];
          const bullets = strList(section.bullets);
          if (bullets.length > 0) return bullets;
          return str(section.body)
            .split(/(?<=\.)\s+/)
            .map(str)
            .filter(Boolean);
        };
        blocks.push(
          ...bulletBlock("Wellness Incentive", sectionBullets(matcher("Wellness Incentive"))),
        );
        blocks.push(
          ...bulletBlock(
            "Tobacco User Surcharge",
            sectionBullets(matcher("Tobacco User Surcharge")),
          ),
        );
        blocks.push(...bulletBlock("Submission steps", chapter.submissionSteps));
        blocks.push(...bulletBlock("Activities", chapter.activities));
        return blocks;
      }

      case "dentalPlans": {
        blocks.push(...dentalBlocks(chapter));
        return blocks;
      }

      case "visionPlans": {
        blocks.push(...visionBlocks(chapter));
        return blocks;
      }

      case "spendingAccounts": {
        const accounts = list<Record<string, unknown>>(chapter.accounts);
        const hsa = accounts.find((account) => str(account.accountKey) === "hsa") ?? null;
        const others = accounts.filter((account) => str(account.accountKey) !== "hsa");
        const comparison = toTable(chapter.comparison, "HSA vs FSA");

        const tabs = [
          { label: "HSA", blocks: hsa ? hsaBlocks(hsa) : [] },
          { label: "FSA", blocks: fsaBlocks(others) },
          { label: "FSA vs HSA", blocks: tableBlock(comparison) },
        ].filter((tab) => tab.blocks.length > 0);

        if (tabs.length > 0) {
          blocks.push({ id: id("tabs"), kind: "tabs", title: "Spending Accounts", data: tabs });
        }
        return blocks;
      }

      case "eap": {
        blocks.push(
          ...factsTable("Program Details", "Program Detail", "Information", [
            ["Provider", chapter.provider],
            ["Cost to you", chapter.costToEmployee],
            ["Who is covered", chapter.whoIsCovered],
            ["Visits included", chapter.visitsIncluded],
            ["Availability", chapter.availability],
            ["Phone", chapter.phone],
            ["Website", chapter.website],
            ["Web login code", chapter.webLoginCode],
          ]),
        );
        blocks.push(
          ...bulletBlock(
            "Services Included",
            list<Record<string, unknown>>(chapter.services).map((service) =>
              [str(service.serviceName), str(service.description)].filter(Boolean).join(" — "),
            ),
          ),
        );
        blocks.push(
          ...proseBlocks([
            ["How to access", chapter.howToAccess],
            ["Confidentiality", chapter.confidentialityNote],
          ]),
        );
        break;
      }

      case "survivorBenefits": {
        const coverages = list<Record<string, unknown>>(chapter.coverages);
        const order = [
          "Basic Employee Life/AD&D",
          "Voluntary Employee Life",
          "Voluntary Spouse Life",
          "Voluntary Child Life",
          "Voluntary Employee AD&D",
          "Voluntary Spouse AD&D",
          "Voluntary Child AD&D",
        ];
        const payableOf = (notes: string): string => {
          const match = notes.match(/(?:Benefits payable|Beneficios pagaderos):\s*([^.]*\.)/i);
          return match ? str(match[1]) : "";
        };
        const eoiOf = (coverage: Record<string, unknown>): string => {
          const notes = str(coverage.notes);
          if (/EOI\)?\s*(?:Required|requerida):\s*No/i.test(notes)) return "No";
          const threshold = str(coverage.evidenceOfInsurabilityThreshold);
          return threshold ? tpl("Yes - {x}", { x: threshold }) : "No";
        };
        const rows = order
          .map((name) => {
            const coverage = coverages.find((item) => eq(str(item.coverageName), name));
            if (!coverage) return null;
            return {
              rowLabel: str(coverage.coverageName),
              cells: [
                str(coverage.benefitAmount),
                str(coverage.paidBy),
                payableOf(str(coverage.notes)),
                str(coverage.maximumBenefit),
                eoiOf(coverage),
              ],
              rowFootnote: "",
            };
          })
          .filter((row): row is NonNullable<typeof row> => row !== null);

        if (rows.length > 0) {
          blocks.push(
            ...tableBlock({
              tableTitle: "Coverages",
              rowHeaderLabel: "Coverage",
              columnLabels: [
                "Amount",
                "Who Pays",
                "Benefits Payable",
                "Maximum Benefit",
                "EOI Required",
              ],
              rows,
              footnotes: [],
            }),
          );
        }
        blocks.push(
          ...list<RawTable>(chapter.rateTables).flatMap((table) => {
            if (
              eq(str(table.tableTitle), "VOLUNTARY SPOUSE LIFE INSURANCE PREMIUM RATES / MONTH")
            ) {
              const rates = toTable(
                {
                  ...table,
                  columnLabels: strList(table.columnLabels).filter(
                    (label) => !eq(label, "COVERAGE"),
                  ),
                },
                "Rates",
              );
              return tableBlock(rates ? { ...rates, rowHeaderLabel: "Coverage Amount" } : null);
            }
            const ageHeading = T("AGE (AS OF JANUARY 1, 2027)");
            if (!strList(table.columnLabels).includes(ageHeading)) {
              return tableBlock(toTable(table, "Rates"));
            }
            const rates = toTable(
              {
                ...table,
                columnLabels: strList(table.columnLabels).filter((label) => label !== ageHeading),
              },
              "Rates",
            );
            return tableBlock(rates ? { ...rates, rowHeaderLabel: ageHeading } : null);
          }),
        );
        blocks.push(...proseBlocks([["How cost is calculated", chapter.costCalculationFormula]]));
        return blocks;
      }

      case "supplementalHealth": {
        const products = list<Record<string, unknown>>(chapter.products);
        blocks.push(
          ...cardsBlock(
            "",
            products.map((product) => ({
              ...emptyCard(),
              title: str(product.productName),
              subtitle: str(product.carrier),
              description: str(product.description),
              bullets: [
                str(product.guaranteedIssue),
                str(product.wellnessBenefit),
                str(product.specialProvisions),
                str(product.portability),
              ].filter(Boolean),
            })),
            "stack",
          ),
        );
        return blocks;
      }

      case "incomeProtection": {
        const intro =
          list<RawSection>(chapter.sections)
            .map((section) => str(section.body))
            .filter(Boolean)[0] ?? "";
        list<Record<string, unknown>>(chapter.coverages).forEach((coverage, index) => {
          const name = str(coverage.coverageName);
          blocks.push(
            ...factsTable(name, "Feature", "Detail", [
              ["Carrier", coverage.carrier],
              ["Who pays", coverage.paidBy],
              ["Eligibility", coverage.eligibility],
              ["Income replaced", coverage.incomeReplacementPercent],
              ["Maximum benefit", coverage.maximumBenefit],
              ["Elimination period", coverage.eliminationPeriod],
              ["Maximum benefit period", coverage.maximumBenefitPeriod],
              ["Rate", coverage.rate],
            ]),
          );
          const notesTitle = /buy-?up/i.test(name) ? "LTD Buy-Up Notes" : "Basic LTD Notes";
          blocks.push(
            ...bulletBlock(
              notesTitle,
              [
                index === 0 ? intro : "",
                str(coverage.notes),
                str(coverage.preExistingConditionClause),
              ].filter(Boolean),
            ),
          );
        });
        blocks.push(...tablesBlocks(chapter.rateTables, "Rates"));
        return blocks;
      }

      case "retirement": {
        const auto = obj<Record<string, unknown>>(chapter.autoEnrollment) ?? {};
        const contributionWays = list<Record<string, unknown>>(chapter.contributionTypes)
          .map((type) => [str(type.typeName), str(type.description)].filter(Boolean).join(" - "))
          .filter(Boolean)
          .join(" ");
        blocks.push(
          ...factsTable("Plan Details", "Feature", "Detail", [
            ["Plan name", chapter.planName],
            ["\n", chapter.planType],
            ["Record keeper", chapter.recordKeeper],
            ["Website", chapter.website],
            ["Phone", chapter.phone],
            ["Eligibility", chapter.eligibility],
            ["Entry dates", chapter.entryDates],
            ["Employer match", chapter.employerMatch],
            ["Automatic enrollment", auto.isAutoEnrolled],
            ["Default contribution rate", auto.defaultRate],
            ["Auto enrollment starts", auto.delayBeforeStart],
            ["Auto escalation", auto.autoEscalation],
            ["Opting out", auto.optOutProcess],
            ["Ways to contribute", contributionWays],
            ["Vesting applies to", chapter.vestingAppliesTo],
            ["Loans", chapter.loanProvisions],
            ["Hardship withdrawals", chapter.hardshipWithdrawals],
            ["Rollovers", chapter.rolloverConsolidation],
            ["Investment guidance", chapter.investmentGuidance],
          ]),
        );
        const limitRows = list<Record<string, unknown>>(chapter.contributionLimits)
          .map((limit) => ({
            rowLabel: [str(limit.limitLabel), str(limit.planYear)].filter(Boolean).join(" · "),
            cells: [str(limit.amount)],
            rowFootnote: "",
          }))
          .filter((row) => row.rowLabel !== "" || row.cells[0] !== "");
        if (limitRows.length > 0) {
          blocks.push(
            ...tableBlock({
              tableTitle: "Contribution Limits",
              rowHeaderLabel: "Limit",
              columnLabels: ["Amount"],
              rows: limitRows,
              footnotes: [
                "Please note the IRS has not yet announced the 2027 contribution limits. Limits shown reflect the current IRS limits and are subject to change.",
              ],
            }),
          );
        }
        const vestingRows = list<Record<string, unknown>>(chapter.vestingSchedule)
          .map((step) => ({
            rowLabel: str(step.yearsOfService),
            cells: [str(step.percentVested)],
            rowFootnote: "",
          }))
          .filter((row) => row.rowLabel !== "" || row.cells[0] !== "");
        if (vestingRows.length > 0) {
          blocks.push(
            ...tableBlock({
              tableTitle: "Vesting Schedule",
              rowHeaderLabel: "Years of Service",
              columnLabels: ["Percent Vested"],
              rows: vestingRows,
              footnotes: [],
            }),
          );
        }
        const supplemental = list<RawSection>(chapter.sections).find((section) =>
          eq(str(section.heading), "401(k) Supplemental Contribution"),
        );
        if (supplemental) {
          blocks.push(
            ...sectionBlock(
              str(supplemental.heading),
              str(supplemental.body),
              strList(supplemental.bullets),
            ),
          );
        }
        blocks.push(...tablesBlocks(chapter.tables));
        blocks.push(
          ...bulletBlock("Plan Notes", [
            "Name your beneficiary! Please add your beneficiary information to ensure your 401(k) savings are distributed according to your wishes.",
          ]),
        );
        return blocks;
      }

      case "additionalBenefits":
        return additionalBenefitsBlocks(chapter);

      case "enrollment": {
        blocks.push(
          ...keyValueBlock("Enrollment details", [
            ["Platform", chapter.enrollmentPlatform],
            ["Where to go", chapter.enrollmentUrl],
            ["When", chapter.enrollmentWindow],
            ["If you take no action", chapter.defaultIfNoAction],
            ["Support", chapter.supportContact],
          ]),
        );
        blocks.push(...bulletBlock("Steps", chapter.enrollmentSteps));
        blocks.push(...proseBlocks([["Deadlines", chapter.deadlineNote]]));
        break;
      }

      case "glossary": {
        blocks.push(
          ...nameValueBlock(
            "Need to Know Definitions",
            list<Record<string, unknown>>(chapter.terms).map((term) => ({
              name: str(term.term),
              value: str(term.definition),
            })),
            "cards",
          ),
        );
        break;
      }

      case "medicalPlans":
      default:
        break;
    }

    blocks.push(...toSections(chapter.sections));
    blocks.push(...tablesBlocks(chapter.tables));
    return blocks;
  }

  function medicalPlanBlocks(planKey: string): Block[] {
    const chapter = chapters.medicalPlans;
    if (!chapter) return [];
    const plan =
      list<Record<string, unknown>>(chapter.plans).find(
        (item) => str(item.planKey).toLowerCase() === planKey.toLowerCase(),
      ) ?? null;

    const blocks: Block[] = [];
    if (!plan) return blocks;

    const key = str(plan.planKey).toLowerCase();
    const isHdhp = key === "hdhp";
    const hsaEligible =
      typeof plan.hsaEligible === "boolean"
        ? plan.hsaEligible
          ? "Yes"
          : "No"
        : isHdhp
          ? "Yes"
          : "No";
    const fsaEligible =
      typeof plan.fsaEligible === "boolean"
        ? plan.fsaEligible
          ? "Yes"
          : "No"
        : isHdhp
          ? "Limited Purpose FSA only"
          : "Yes — Healthcare FSA";

    const planFacts = facts([
      ["Carrier", str(plan.carrier)],
      ["Plan Type", plan.planType],
      ["Out-of-Network Coverage", plan.hasOutOfNetworkCoverage],
      ["HSA Eligible", hsaEligible],
      ["FSA Eligible", fsaEligible],
      ["Dependent Care Eligible", "Yes"],
    ]);
    if (planFacts.length > 0) {
      blocks.push({
        id: id("iconfacts"),
        kind: "iconFacts",
        title: "Plan Details",
        data: planFacts,
      });
    }

    const premiums = toPremiumTable(plan.premiums, "Premiums");
    if (premiums) {
      blocks.push(
        ...tableBlock({
          ...premiums,
          rowHeaderLabel: "Coverage Tier",
          columnLabels: ["Biweekly Contribution"],
          rows: premiums.rows.map((row) => ({ ...row, cells: [row.cells[0] ?? ""] })),
        }),
      );
    }

    const summary = toTable(list<RawTable>(plan.coverageTables)[0], "Medical Plan Summary");
    if (summary) {
      const isCostRow = (label: string) =>
        /deductible|coinsurance|out-of-pocket|deducible|coseguro|bolsillo/i.test(label);
      const costRows = summary.rows.filter((row) => isCostRow(row.rowLabel));
      const serviceRows = summary.rows.filter((row) => !isCostRow(row.rowLabel));
      if (costRows.length > 0) {
        blocks.push(
          ...tableBlock({
            tableTitle: "Deductible - Out of Pocket & Coinsurance",
            rowHeaderLabel: "Feature",
            columnLabels: summary.columnLabels,
            rows: costRows,
            footnotes: [],
          }),
        );
      }
      if (serviceRows.length > 0) {
        blocks.push(
          ...tableBlock({
            tableTitle: "Covered Services",
            rowHeaderLabel: "Service",
            columnLabels: summary.columnLabels,
            rows: serviceRows,
            footnotes: ["** Blue Distinction Center Providers = 10% Coinsurance after deductible"],
          }),
        );
      }
    }

    blocks.push(...pharmacyRxBlocks(obj<Record<string, unknown>>(chapter.pharmacy), planKey));

    const pharmacy = obj<Record<string, unknown>>(chapter.pharmacy);
    const notes: string[] = [];
    list<Record<string, unknown>>(chapter.surchargeRules).forEach((rule) => {
      const name = str(rule.surchargeName);
      const amount = str(rule.amount);
      const avoid = str(rule.avoidanceRequirement);
      if (name)
        notes.push([`${titleCase(name)}: ${amount}`.trim(), avoid].filter(Boolean).join(". "));
    });
    if (pharmacy) {
      const admin = str(pharmacy.administeredThrough);
      if (admin)
        notes.push(
          tpl(
            "Prescription drug coverage is coordinated with your medical plan and administered through {x}.",
            { x: admin },
          ),
        );
      const preventive = str(pharmacy.preventiveMedsNote);
      if (preventive) notes.push(preventive);
    }
    strList(plan.footnotes).forEach((note) => notes.push(note));
    blocks.push(
      ...bulletBlock("Plan Notes", [
        ...notes.slice(0, 5).map((n, i) => {
          const note = i === 1 ? n.replace(/\bBCBSTX\b/, "[BCBSTX](https://www.bcbstx.com/)") : n;
          return key === "ppo" || key === "hdhp"
            ? note.replace(
                /\bWorkday\b/g,
                "[Workday](https://wd3-identity.myworkday.com/wday/authgwy/lhoist/upc/login)",
              )
            : note;
        }),
        "Complete the requirements to earn the Wellness Incentive of $600 per year.",
      ]),
    );

    return blocks;
  }

  function contactBlocks(): Block[] {
    const categories: string[] = [];
    contactsList.forEach((contact) => {
      const category = contact.category || "Benefits";
      if (!categories.includes(category)) categories.push(category);
    });

    const data = contactsList.map((contact) => ({
      ...contact,
      category: contact.category || "Benefits",
      provider: contact.provider || contact.category || "Benefits",
    }));

    return data.length > 0
      ? [{ id: id("contacts"), kind: "contacts" as const, title: "", data }]
      : [];
  }

  function buildPageData(entry: NavEntry | null): PageData | null {
    if (!entry) return null;

    if (entry.pageType === "contacts") {
      return {
        slug: entry.pageSlug,
        title: entry.pageTitle,
        subtitle: "",
        summary: tpl("Reach the carriers and administrators behind your {x} benefits.", {
          x: siteMeta.planYear,
        }),
        blocks: contactBlocks(),
      };
    }

    if (entry.pageType === "medicalPlanDetail") {
      const chapter = chapters.medicalPlans;
      const plan =
        list<Record<string, unknown>>(chapter?.plans).find(
          (item) => str(item.planKey).toLowerCase() === entry.chapterKey.toLowerCase(),
        ) ?? null;
      return {
        slug: entry.pageSlug,
        title: plan ? str(plan.planName) || entry.pageTitle : entry.pageTitle,
        subtitle: "",
        summary: plan ? str(plan.planDescription) || str(chapter?.summary) : str(chapter?.summary),
        blocks: medicalPlanBlocks(entry.chapterKey),
      };
    }

    const chapter = getChapter(entry.chapterKey);
    if (!chapter) {
      return {
        slug: entry.pageSlug,
        title: entry.pageTitle,
        subtitle: "",
        summary: "",
        blocks: [],
      };
    }

    return {
      slug: entry.pageSlug,
      title: str(chapter.chapterTitle) || entry.pageTitle,
      subtitle: str(chapter.chapterSubtitle),
      summary: str(chapter.summary),
      blocks: chapterBlocks(entry.chapterKey as ChapterKey, chapter),
    };
  }

  function getPageData(entry: NavEntry | null): PageData | null {
    const page = buildPageData(entry);
    return page && es ? localizePage(page) : page;
  }

  function getPageDataBySlug(slug: string): PageData | null {
    return getPageData(getNavBySlug(slug));
  }

  /** Flat index used by the search palette. */
  const searchIndex = pageOrder.map((entry) => {
    const page = getPageData(entry);
    return {
      slug: entry.pageSlug,
      title: entry.pageTitle,
      group: L(entry.parentChapterKey ? "Medical Plans" : "Benefits"),
      summary: page ? page.summary : "",
    };
  });

  return {
    siteMeta,
    branding,
    chapters,
    getChapter,
    pageOrder,
    navPages,
    getNavBySlug,
    getAdjacentNav,
    homepage,
    contactsList,
    getPageData,
    getPageDataBySlug,
    searchIndex,
  };
}

export type Site = ReturnType<typeof createSite>;

const sites: Partial<Record<Locale, Site>> = {};

/** The built site for a locale. Built once per locale, then cached. */
export function getSite(locale: Locale): Site {
  const existing = sites[locale];
  if (existing) return existing;
  const created = createSite(locale);
  sites[locale] = created;
  return created;
}

/** English site, for places that run outside React (route metadata). */
export const siteMeta = getSite("en").siteMeta;
