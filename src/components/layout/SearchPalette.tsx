import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useSite } from "@/i18n/useSite";
import { useNav } from "@/components/layout/NavContext";
import { useLocale } from "@/i18n/LocaleContext";

export function SearchPalette() {
  const { searchOpen, openSearch, closeSearch } = useNav();
  const [query, setQuery] = useState("");
  const { t } = useLocale();
  const { searchIndex } = useSite();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
      if (event.key === "Escape") closeSearch();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch, closeSearch]);

  useEffect(() => {
    if (!searchOpen) setQuery("");
  }, [searchOpen]);

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = searchIndex.filter(
      (item) =>
        needle === "" ||
        item.title.toLowerCase().includes(needle) ||
        item.summary.toLowerCase().includes(needle),
    );
    const names: string[] = [];
    matches.forEach((item) => {
      if (!names.includes(item.group)) names.push(item.group);
    });
    return names.map((name) => ({
      name,
      items: matches.filter((item) => item.group === name),
    }));
  }, [query, searchIndex]);

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={closeSearch} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-lift rise-in">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <Search className="h-4 w-4 shrink-0 text-primary" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden shrink-0 rounded-md border border-border px-2 py-1 text-[10px] font-semibold text-muted-foreground sm:block">
            ESC
          </kbd>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {groups.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {t.noSearchMatch}
            </p>
          )}
          {groups.map((group) => (
            <div key={group.name} className="mb-2">
              <p className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.09em] text-foreground">
                {group.name}
              </p>
              {group.items.map((item) => (
                <Link
                  key={item.slug}
                  to={`/${item.slug}` as "/"}
                  onClick={closeSearch}
                  className="block rounded-xl px-4 py-3 transition-colors hover:bg-primary-tint"
                >
                  <span className="block text-sm font-semibold text-foreground">{item.title}</span>
                  {item.summary !== "" && (
                    <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">
                      {item.summary}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
