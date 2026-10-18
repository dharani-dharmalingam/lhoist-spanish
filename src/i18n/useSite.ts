import { getSite, type Site } from "@/content/site";
import { useLocale } from "@/i18n/LocaleContext";

/** The content for the visitor's current language. */
export function useSite(): Site {
  const { locale } = useLocale();
  return getSite(locale);
}
