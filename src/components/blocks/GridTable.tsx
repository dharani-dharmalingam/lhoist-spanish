import type { GridTableData } from "@/content/content-types";
import { SmartText } from "@/components/SmartText";
import { translateLabel } from "@/content/localize";
import { useLocale } from "@/i18n/LocaleContext";

/**
 * Column headings in uppercase, content centred, table width driven by its own
 * column count, alternating row shading, and rows stacked into cards on small
 * screens.
 */
const SINGLE_STAR_NOTE = "* After deductible";
const DOUBLE_STAR_NOTE =
  "** Blue Distinction Center Providers = 10% Coinsurance after deductible";

/** Adds the standard asterisk footnotes to any table whose cells use them. */
function withStarFootnotes(data: GridTableData, translate: (text: string) => string): string[] {
  const text = data.rows.map((row) => [row.rowLabel, ...row.cells].join(" ")).join(" ");
  const notes = [...data.footnotes];
  const hasSingle = notes.some((note) => /^\*(?!\*)/.test(note.trim()));
  const hasDouble = notes.some((note) => note.trim().startsWith("**"));
  if (/(^|[^*])\*(?!\*)/.test(text) && !hasSingle) notes.push(translate(SINGLE_STAR_NOTE));
  if (/\*\*/.test(text) && !hasDouble) notes.push(translate(DOUBLE_STAR_NOTE));
  return notes;
}

export function GridTable({ data }: { data: GridTableData }) {
  const columnCount = data.columnLabels.length;
  const maxWidth =
    columnCount <= 2 ? "max-w-2xl" : columnCount === 3 ? "max-w-4xl" : "max-w-none";
  const { locale } = useLocale();
  const footnotes = withStarFootnotes(data, locale === "es" ? translateLabel : (text) => text);

  return (
    <section className="w-full">
      {data.tableTitle !== "" && (
        <h3 className="mb-4 text-left text-lg font-bold text-foreground">{data.tableTitle}</h3>
      )}

      <div className={`mx-auto w-full ${maxWidth}`}>
        {/* desktop / tablet */}
        <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-soft sm:block">
          <table className="w-full border-collapse text-center text-sm">
            <thead>
              <tr className="bg-primary-tint">
                <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-[0.09em] text-primary">
                  {data.rowHeaderLabel === "" ? "\u00A0" : data.rowHeaderLabel}
                </th>
                {data.columnLabels.map((label) => (
                  <th
                    key={label}
                    className="px-5 py-4 text-center text-xs font-bold uppercase tracking-[0.09em] text-primary"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, rowIndex) => (
                <tr
                  key={`${row.rowLabel}-${rowIndex}`}
                  className={`border-t border-border/70 align-middle transition-colors hover:bg-primary-tint/50 ${
                    rowIndex % 2 === 0 ? "bg-card" : "bg-muted/50"
                  }`}
                >
                  <th className="px-5 py-4 text-center text-sm font-semibold text-foreground">
                    {row.rowLabel}
                    {row.rowFootnote !== "" && (
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">
                        {row.rowFootnote}
                      </span>
                    )}
                  </th>
                  {row.cells.map((cell, cellIndex) => (
                    <td
                      key={`${data.columnLabels[cellIndex] ?? cellIndex}`}
                      className="px-5 py-4 text-center text-sm text-muted-foreground"
                    >
                      {cell === "" ? "—" : <SmartText text={cell} />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* mobile: stacked cards */}
        <div className="space-y-4 sm:hidden">
          {data.rows.map((row, rowIndex) => (
            <div
              key={`${row.rowLabel}-${rowIndex}`}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
            >
              <div className="bg-primary-tint px-4 py-3 text-center text-sm font-bold text-foreground">
                {row.rowLabel}
              </div>
              <dl className="divide-y divide-border/70">
                {row.cells.map((cell, cellIndex) => (
                  <div
                    key={cellIndex}
                    className={`px-4 py-3 text-center ${cellIndex % 2 === 0 ? "bg-card" : "bg-muted/50"}`}
                  >
                    <dt className="text-[11px] font-bold uppercase tracking-[0.09em] text-primary">
                      {data.columnLabels[cellIndex] ?? ""}
                    </dt>
                    <dd className="mt-1 text-sm text-muted-foreground">
                      {cell === "" ? "—" : <SmartText text={cell} />}
                    </dd>
                  </div>
                ))}
              </dl>
              {row.rowFootnote !== "" && (
                <p className="border-t border-border/70 px-4 py-3 text-center text-xs text-muted-foreground">
                  {row.rowFootnote}
                </p>
              )}
            </div>
          ))}
        </div>

        {footnotes.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-left text-xs leading-relaxed text-muted-foreground">
            {footnotes.map((note, index) => (
              <li key={index}>
                <SmartText text={note} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
