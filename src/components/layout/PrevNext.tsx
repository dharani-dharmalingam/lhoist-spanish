import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSite } from "@/i18n/useSite";
import { useLocale } from "@/i18n/LocaleContext";

export function PrevNext({ slug }: { slug: string }) {
  const { t } = useLocale();
  const { getAdjacentNav } = useSite();
  const { previous, next } = getAdjacentNav(slug);
  if (!previous && !next) return null;

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-between gap-4">
      {previous ? (
        <Link
          to={`/${previous.pageSlug}` as "/"}
          className="inline-flex max-w-full items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
        >
          <ChevronLeft className="h-5 w-5 shrink-0 text-muted-foreground" />
          <span className="min-w-0 truncate text-sm">
            <span className="font-normal text-muted-foreground">{t.previous} </span>
            <span className="font-bold text-foreground">{previous.pageTitle}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}

      {next && (
        <Link
          to={`/${next.pageSlug}` as "/"}
          className="ml-auto inline-flex max-w-full items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3 text-right shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
        >
          <span className="min-w-0 truncate text-sm">
            <span className="font-normal text-muted-foreground">{t.next} </span>
            <span className="font-bold text-foreground">{next.pageTitle}</span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </Link>
      )}
    </nav>
  );
}
