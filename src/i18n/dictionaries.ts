/**
 * UI strings (chrome, buttons, labels) per locale. Page content lives in the
 * content JSON; this file only holds text written in the components.
 * `es` is typed against `en`, so a missing key fails the type check.
 */
export type Locale = "en" | "es";

export const LOCALES: Locale[] = ["en", "es"];
export const DEFAULT_LOCALE: Locale = "en";

const en = {
  languageLabel: "Language",
  switchTo: "Switch language to",
  back: "Back",
  previous: "Previous",
  next: "Next",
  home: "Home",
  guide: "Guide",
  chapters: (count: number) => `${count} chapters`,
  openNavigation: "Open navigation",
  closeNavigation: "Close navigation",
  openGuideNavigation: "Open the benefits guide navigation",
  searchBenefits: "Search benefits…",
  searchPlaceholder: "Search benefits, plans and chapters…",
  noSearchMatch: "No pages match that search.",
  planYear: (year: string) => `Plan Year ${year}`,
  employeeBenefits: (year: string) => `${year} Employee Benefits`,
  benefitsTitle: (employer: string, year: string) => `${employer} ${year} Benefits`,
  quickLinks: "Quick Links",
  contactBenefits: "Contact Benefits",
  downloadGuide: "Download Benefits Guide",
  guideDescription: (year: string) => `The full ${year} benefits guide as a PDF.`,
  guideFileName: (employer: string, year: string) => `${employer} ${year} Benefits Guide.pdf`,
  workday: "Workday",
  logoAlt: (employer: string) => `${employer} logo`,
  videoComingSoon: "Video coming soon",
  heroAlt: "Lhoist North America operations site",
  exploreBenefits: "Explore Benefits",
  exploreYourBenefits: "EXPLORE YOUR BENEFITS",
  additionalBenefits: "Additional Benefits",
  exploreAdditionalBenefits: "Explore your additional benefits",
  contacts: "Contacts",
  openEnrollment: "Open Enrollment",
  benefitsEnrollment: "BENEFITS ENROLLMENT",
  effectiveDateTitle: "Effective Date of Benefits",
  enrollmentPeriod: "Enrollment period: ",
  enrollmentPeriodValue: "October 12 – October 30",
  electionsEffective: "Your elections are effective on your date of hire",
  thirtyDays: "You have 30 days from your date of hire to submit your elections in Workday",
  notFoundTitle: "Page not found",
  notFoundBody: "The page you're looking for doesn't exist or has been moved.",
  goHome: "Go home",
};

export type Dictionary = typeof en;

const es: Dictionary = {
  languageLabel: "Idioma",
  switchTo: "Cambiar el idioma a",
  back: "Atrás",
  previous: "Anterior",
  next: "Siguiente",
  home: "Inicio",
  guide: "Guía",
  chapters: (count) => `${count} capítulos`,
  openNavigation: "Abrir navegación",
  closeNavigation: "Cerrar navegación",
  openGuideNavigation: "Abrir la navegación de la guía de beneficios",
  searchBenefits: "Buscar beneficios…",
  searchPlaceholder: "Buscar beneficios, planes y capítulos…",
  noSearchMatch: "Ninguna página coincide con la búsqueda.",
  planYear: (year) => `Año del plan ${year}`,
  employeeBenefits: (year) => `Beneficios para empleados ${year}`,
  benefitsTitle: (employer, year) => `Beneficios ${year} de ${employer}`,
  quickLinks: "Enlaces rápidos",
  contactBenefits: "Contacto de Beneficios",
  downloadGuide: "Descargar la guía de beneficios",
  guideDescription: (year) => `La guía completa de beneficios ${year} en PDF.`,
  guideFileName: (employer, year) => `${employer} Guía de Beneficios ${year}.pdf`,
  workday: "Workday",
  logoAlt: (employer) => `Logotipo de ${employer}`,
  videoComingSoon: "Video próximamente",
  heroAlt: "Sitio de operaciones de Lhoist North America",
  exploreBenefits: "Explorar beneficios",
  exploreYourBenefits: "EXPLORE SUS BENEFICIOS",
  additionalBenefits: "Beneficios adicionales",
  exploreAdditionalBenefits: "Explore sus beneficios adicionales",
  contacts: "Contactos",
  openEnrollment: "Inscripción abierta",
  benefitsEnrollment: "INSCRIPCIÓN A BENEFICIOS",
  effectiveDateTitle: "Fecha de entrada en vigor de los beneficios",
  enrollmentPeriod: "Período de inscripción: ",
  enrollmentPeriodValue: "12 de octubre – 30 de octubre",
  electionsEffective: "Sus elecciones entran en vigor en su fecha de contratación",
  thirtyDays:
    "Tiene 30 días a partir de su fecha de contratación para enviar sus elecciones en Workday",
  notFoundTitle: "Página no encontrada",
  notFoundBody: "La página que busca no existe o ha sido movida.",
  goHome: "Ir al inicio",
};

export const dictionaries: Record<Locale, Dictionary> = { en, es };

export const LOCALE_NAMES: Record<Locale, { short: string; full: string }> = {
  en: { short: "EN", full: "English" },
  es: { short: "ES", full: "Español" },
};
