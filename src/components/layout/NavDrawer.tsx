import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { X, Home } from "lucide-react";
import { useSite } from "@/i18n/useSite";
import { useNav } from "@/components/layout/NavContext";
import { useLocale } from "@/i18n/LocaleContext";

export function NavDrawer() {
  const { drawerOpen, closeDrawer } = useNav();
  const { t } = useLocale();
  const { navPages, siteMeta } = useSite();
  const [progress, setProgress] = useState(0);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    function onScroll() {
      const scrollable = document.body.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeDrawer();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  return (
    <>
      <div
        onClick={closeDrawer}
        aria-hidden={!drawerOpen}
        className={`fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        aria-hidden={!drawerOpen}
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(22rem,90vw)] flex-col bg-card shadow-lift transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 px-6 pb-4 pt-6">
          <div className="min-w-0">
            <p className="text-base font-bold leading-snug text-foreground">
              {t.benefitsTitle(siteMeta.employerName, siteMeta.planYear)}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.09em] text-foreground">
              {t.chapters(navPages.length)}
            </p>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label={t.closeNavigation}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-6 h-1 overflow-hidden rounded-full bg-primary-tint">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        <nav className="mt-5 flex-1 overflow-y-auto px-4 pb-8">
          <Link
            to="/"
            onClick={closeDrawer}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
              pathname === "/"
                ? "bg-primary text-primary-foreground"
                : "bg-primary-tint text-primary-deep hover:bg-primary-soft"
            }`}
          >
            <Home className="h-4 w-4 shrink-0" />
            {t.home}
          </Link>

          <ol className="mt-4 space-y-1">
            {navPages.map((page, index) => {
              const href = `/${page.pageSlug}`;
              const active = pathname === href;
              return (
                <li key={page.pageSlug}>
                  <Link
                    to={href as "/"}
                    onClick={closeDrawer}
                    className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-4 py-2.5 transition-colors ${
                      active ? "bg-primary-tint" : "hover:bg-muted"
                    }`}
                  >
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`truncate text-sm ${
                        active ? "font-bold text-primary-deep" : "text-foreground"
                      }`}
                    >
                      {page.pageTitle}
                    </span>
                    <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      </aside>
    </>
  );
}
