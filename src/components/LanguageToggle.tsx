import { Languages } from "lucide-react";
import { LOCALES, LOCALE_NAMES } from "@/i18n/dictionaries";
import { useLocale } from "@/i18n/LocaleContext";

/** Segmented English / Español switch. `onDark` styles it for the hero image. */
export function LanguageToggle({ onDark = false }: { onDark?: boolean }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      role="group"
      aria-label={t.languageLabel}
      className={`inline-flex items-center gap-1 rounded-full border p-1 backdrop-blur-sm ${
        onDark ? "border-white/30 bg-white/10" : "border-border bg-card shadow-soft"
      }`}
    >
      <Languages
        aria-hidden
        className={`ml-2 mr-1 h-4 w-4 shrink-0 ${onDark ? "text-white/80" : "text-primary"}`}
      />
      {LOCALES.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            aria-pressed={active}
            aria-label={`${t.switchTo} ${LOCALE_NAMES[code].full}`}
            onClick={() => setLocale(code)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : onDark
                  ? "text-white/80 hover:text-white"
                  : "text-muted-foreground hover:text-primary"
            }`}
          >
            {LOCALE_NAMES[code].full}
          </button>
        );
      })}
    </div>
  );
}
