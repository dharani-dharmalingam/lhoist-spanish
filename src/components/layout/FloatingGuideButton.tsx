import { BookOpen } from "lucide-react";
import { useNav } from "@/components/layout/NavContext";
import { useLocale } from "@/i18n/LocaleContext";

export function FloatingGuideButton() {
  const { openDrawer, drawerOpen } = useNav();
  const { t } = useLocale();

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={t.openGuideNavigation}
      className={`fixed bottom-5 left-4 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lift transition-all duration-300 hover:bg-primary-deep sm:bottom-8 sm:left-8 ${
        drawerOpen ? "pointer-events-none translate-y-3 opacity-0" : "opacity-100"
      }`}
    >
      <BookOpen className="h-4 w-4" />
      {t.guide}
    </button>
  );
}
