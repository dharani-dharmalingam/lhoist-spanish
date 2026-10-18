import { Link } from "@tanstack/react-router";
import { Menu, Search } from "lucide-react";
import { useSite } from "@/i18n/useSite";
import { logoUrl } from "@/lib/brand";
import { useNav } from "@/components/layout/NavContext";
import { useLocale } from "@/i18n/LocaleContext";

export function SiteHeader() {
  const { openDrawer, openSearch } = useNav();
  const { t } = useLocale();
  const { siteMeta } = useSite();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={openDrawer}
            aria-label={t.openNavigation}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img src={logoUrl} alt={t.logoAlt(siteMeta.employerName)} className="h-9 w-auto sm:h-11" />
            <span className="hidden min-w-0 truncate text-sm font-bold text-foreground lg:block">
              
            </span>
          </Link>
        </div>

        <div className="flex min-w-0 justify-center">
          <button
            type="button"
            onClick={openSearch}
            className="flex w-full max-w-sm items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-left text-sm text-muted-foreground shadow-soft transition-colors hover:border-primary/50"
          >
            <Search className="h-4 w-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate">{t.searchBenefits}</span>
            <kbd className="hidden shrink-0 rounded-md border border-border px-1.5 py-0.5 text-[10px] font-semibold sm:block">
              ⌘K
            </kbd>
          </button>
        </div>

        <span className="shrink-0 rounded-full bg-muted px-3 py-1.5 text-xs font-bold tracking-[0.08em] text-muted-foreground">
          {t.planYear(siteMeta.planYear)}
        </span>
      </div>
    </header>
  );
}
