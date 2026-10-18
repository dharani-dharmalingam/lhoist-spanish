/**
 * Builds every page in English and Spanish and checks that the two have the
 * same shape (same blocks, tables, rows, tabs, empty/non-empty cells). A
 * mismatch usually means code that matched on English text no longer matches.
 * Also lists strings in the Spanish pages that are still identical to English.
 *
 * Run: npx tsx scripts/i18n/parity.ts
 */
import { getSite } from "../../src/content/site";

const en = getSite("en");
const es = getSite("es");
const problems: string[] = [];
const untranslated = new Map<string, number>();

function shape(a: unknown, b: unknown, path: string): void {
  if (typeof a === "string" && typeof b === "string") {
    if ((a === "") !== (b === ""))
      problems.push(
        `${path}: empty mismatch (${JSON.stringify(a.slice(0, 40))} vs ${JSON.stringify(b.slice(0, 40))})`,
      );
    if (a === b && /[A-Za-z]{3,}\s+[A-Za-z]{3,}\s+[A-Za-z]{3,}/.test(a) && !path.endsWith(".href"))
      untranslated.set(a, (untranslated.get(a) ?? 0) + 1);
    return;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) problems.push(`${path}: length ${a.length} vs ${b.length}`);
    a.forEach((item, i) => shape(item, b[i], `${path}[${i}]`));
    return;
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a as object)
      .filter((k) => k !== "id")
      .sort();
    const kb = Object.keys(b as object)
      .filter((k) => k !== "id")
      .sort();
    if (ka.join() !== kb.join()) problems.push(`${path}: keys differ`);
    for (const k of ka)
      shape((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], `${path}.${k}`);
    return;
  }
  if (typeof a !== typeof b) problems.push(`${path}: type ${typeof a} vs ${typeof b}`);
}

for (const entry of en.pageOrder) {
  const esEntry = es.getNavBySlug(entry.pageSlug);
  shape(en.getPageData(entry), es.getPageData(esEntry), entry.pageSlug);
}
shape(en.homepage, es.homepage, "homepage");
shape(en.contactsList, es.contactsList, "contacts");
shape(en.searchIndex, es.searchIndex, "search");

console.log(`${problems.length} structure problems`);
problems.slice(0, 60).forEach((p) => console.log("  " + p));
console.log(`\n${untranslated.size} identical multi-word strings in Spanish output:`);
[...untranslated.keys()]
  .slice(0, 60)
  .forEach((s) => console.log("  - " + s.slice(0, 110).replace(/\n/g, "\\n")));
