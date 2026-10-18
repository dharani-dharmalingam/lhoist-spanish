import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  CalendarClock,
  UserCheck,
  Download,
  Gift,
  Compass,
  HeartPulse,
  Landmark,
  PiggyBank,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { getSite } from "@/content/site";
import { useSite } from "@/i18n/useSite";
import { guidePdfUrl, heroImageUrl } from "@/lib/brand";
import { downloadFile } from "@/lib/download";
import { VideoPlaceholder } from "@/components/VideoPlaceholder";
import { homepageVideoUrl } from "@/content/videos";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLocale } from "@/i18n/LocaleContext";

const englishSite = getSite("en");
const title = `Lhoist North America ${englishSite.siteMeta.planYear} Employee Benefits`;
const description = englishSite.siteMeta.siteDescription.slice(0, 155);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/** Explore-your-benefits cards: destination and icon, in card order. */
const GROUP_TARGETS: (string | undefined)[] = [
  "overview",
  undefined,
  "spendingaccounts",
  "contacts",
];
const GROUP_ICONS = [HeartPulse, Landmark, PiggyBank, PhoneCall];

/** Open Enrollment runs Oct 12 – Oct 30 (inclusive), in the visitor's local time. */
function isOpenEnrollment(now: Date): boolean {
  const year = now.getFullYear();
  const start = new Date(year, 9, 12, 0, 0, 0, 0);
  const end = new Date(year, 9, 30, 23, 59, 59, 999);
  return now >= start && now <= end;
}

function Index() {
  const { t } = useLocale();
  const { homepage, siteMeta, pageOrder } = useSite();
  const firstPage = pageOrder.length > 0 ? (pageOrder[0] ?? null) : null;
  const firstSlug = firstPage ? firstPage.pageSlug : "";
  const cards = [homepage.openEnrollmentCard].filter(
    (card): card is NonNullable<typeof card> => card !== null,
  );
  const [inWindow, setInWindow] = useState(true);
  useEffect(() => {
    setInWindow(isOpenEnrollment(new Date()));
  }, []);

  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImageUrl}
          alt={t.heroAlt}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mb-8 rise-in">
            <LanguageToggle onDark />
          </div>
          <div className="flex max-w-2xl gap-5 rise-in">
            <span className="mt-1 w-1 shrink-0 rounded-full bg-primary" />
            <div className="min-w-0">
              <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-5xl">
                {homepage.heroTitle}
              </h1>
              {homepage.heroSubtitle !== "" && (
                <p className="mt-4 text-base text-white/90 sm:text-lg">{homepage.heroSubtitle}</p>
              )}
              {siteMeta.homepageIntro !== "" && (
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/80">
                  {siteMeta.homepageIntro}
                </p>
              )}
              <Link
                to="/overview"
                className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5 hover:bg-primary-deep"
              >
                {t.exploreBenefits}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
        <div
          className="pointer-events-none absolute -bottom-px left-0 h-10 w-full bg-background sm:h-16"
          style={{ clipPath: "polygon(0 0, 50% 100%, 100% 0, 100% 100%, 0 100%)" }}
        />
      </section>


      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Enrollment cards */}
        {cards.length > 0 && (
          <section className="mt-12 grid gap-6 sm:mt-16">
            {cards.map((card) => (
              <article
                key={card.title}
                className="grid overflow-hidden rounded-3xl border border-border bg-card shadow-lift lg:grid-cols-2"
              >
                <div className="[&>div]:h-full [&>div]:rounded-none [&>div]:border-0 [&>div]:shadow-none">
                  <VideoPlaceholder embedUrl={homepageVideoUrl} label={card.title} />
                </div>
                <div className="flex min-w-0 flex-col justify-center p-6 sm:p-10">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                    <Calendar className="h-4 w-4" />
                    {inWindow ? t.openEnrollment : t.benefitsEnrollment}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-foreground">
                    {inWindow ? card.title : t.effectiveDateTitle}
                  </h2>
                  <dl className="mt-5 space-y-3 text-sm">
                    {inWindow && (
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center bg-primary-tint text-primary">
                          <CalendarClock className="h-4 w-4" />
                        </span>
                        <span className="text-foreground">
                          <span className="font-semibold">{t.enrollmentPeriod}</span>
                          <span className="text-muted-foreground">{t.enrollmentPeriodValue}</span>
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center bg-primary-tint text-primary">
                        <UserCheck className="h-4 w-4" />
                      </span>
                      <span className="text-muted-foreground">
                        {t.electionsEffective}
                      </span>
                    </div>
                    {!inWindow && (
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center bg-primary-tint text-primary">
                          <CalendarClock className="h-4 w-4" />
                        </span>
                        <span className="text-muted-foreground">
                          {t.thirtyDays}
                        </span>
                      </div>
                    )}
                  </dl>
                  <Link
                    to="/contacts"
                    className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary-deep"
                  >
                    {t.contacts}
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}

        {/* Callout cards */}
        <section className="mx-auto mt-14 grid max-w-4xl gap-5 md:grid-cols-2">
          <a
            href={guidePdfUrl}
            onClick={(event) => {
              event.preventDefault();
              void downloadFile(
                guidePdfUrl,
                t.guideFileName(siteMeta.employerName, siteMeta.planYear),
              );
            }}
            className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
              <Download className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-foreground">
                {t.downloadGuide}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {t.guideDescription(siteMeta.planYear)}
              </span>
            </span>
          </a>

          <Link
            to="/contacts"
            className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
              <PhoneCall className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-foreground">
                {homepage.exploreYourBenefits[3]?.groupTitle}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {homepage.exploreYourBenefits[3]?.groupDescription}
              </span>
            </span>
          </Link>
        </section>


        {/* Explore your benefits */}
        {homepage.exploreYourBenefits.length > 0 && (
          <section className="mt-20">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-foreground">
              {t.exploreYourBenefits}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              {""}
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {homepage.exploreYourBenefits.map((group, groupIndex) => {
                if (groupIndex === 3) {
                  return (
                    <Link
                      key={group.groupKey}
                      to="/additionalbenefits"
                      className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-5 rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
                    >
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
                        <Sparkles className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-base font-bold text-foreground">{t.additionalBenefits}</span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {t.exploreAdditionalBenefits}
                        </span>
                      </span>
                      <ArrowRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                    </Link>
                  );
                }
                const firstGroupPage = group.pages.length > 0 ? group.pages[0] : null;
                const override = GROUP_TARGETS[groupIndex];
                const target = override ?? (firstGroupPage ? firstGroupPage.slug : firstSlug);
                const GroupIcon = GROUP_ICONS[groupIndex] ?? Compass;
                return (
                  <Link
                    key={group.groupKey}
                    to={`/${target}` as "/"}
                    className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-5 rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
                      <GroupIcon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-base font-bold text-foreground">
                        {group.groupTitle}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {group.groupDescription !== ""
                          ? group.groupDescription
                          : group.pages.map((page) => page.title).join(" · ")}
                      </span>
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {firstPage !== null && (
          <nav className="mt-16 flex justify-end pt-8">
            <Link
              to={`/${firstPage.pageSlug}` as "/"}
              className="inline-flex w-fit items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3 text-right shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
            >

              <span className="min-w-0 truncate text-sm">
                <span className="font-normal text-muted-foreground">{t.next} </span>
                <span className="font-bold text-foreground">{firstPage.pageTitle}</span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </Link>
          </nav>
        )}
      </div>
    </SiteShell>
  );
}
