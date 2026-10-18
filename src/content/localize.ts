/**
 * Builds the Spanish content document from the English one. The English JSON
 * stays the single source: every translatable string is looked up in
 * translations/es.json (exact English string -> Spanish). Keys listed in
 * skip-keys.json hold identifiers, codes and proper names and are never touched.
 */
import esMap from "./translations/es.json";
import skipKeys from "./translations/skip-keys.json";
import { LABELS_ES, TEMPLATES_ES } from "./translations/labels.es";

const SKIP = new Set<string>(skipKeys);
const CONTENT_ES = esMap as Record<string, string>;

/** Spanish for a string that came from the content JSON; unknown text is returned as is. */
export function translateContent(value: string): string {
  return CONTENT_ES[value] ?? value;
}

/** Spanish for text written in code, falling back to the content map. */
export function translateLabel(value: string): string {
  return LABELS_ES[value] ?? CONTENT_ES[value] ?? value;
}

/** True when a label is the English text or its Spanish translation. */
export function isLabel(label: string, english: string): boolean {
  return label === english || label === translateLabel(english);
}

export function translateTemplate(template: string): string {
  return TEMPLATES_ES[template] ?? template;
}

function walk(value: unknown, key: string | null): unknown {
  if (typeof value === "string") {
    return key !== null && SKIP.has(key) ? value : translateContent(value);
  }
  if (Array.isArray(value)) return value.map((item) => walk(item, key));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = walk(v, k);
    return out;
  }
  return value;
}

/** A deep copy of the content document with every translatable string in Spanish. */
export function localizeDoc<T>(doc: T): T {
  return walk(doc, null) as T;
}
