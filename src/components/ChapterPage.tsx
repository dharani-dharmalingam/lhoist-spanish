import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useSite } from "@/i18n/useSite";
import { BlockList } from "@/components/BlockRenderer";
import { PrevNext } from "@/components/layout/PrevNext";
import { VideoPlaceholder } from "@/components/VideoPlaceholder";
import { chapterVideoUrl } from "@/content/videos";
import { useLocale } from "@/i18n/LocaleContext";

export function ChapterPage({ slug }: { slug: string }) {
  const router = useRouter();
  const { t } = useLocale();
  const { getNavBySlug, getPageDataBySlug } = useSite();
  const entry = getNavBySlug(slug);
  const page = getPageDataBySlug(slug);
  const title = page ? page.title : entry ? entry.pageTitle : "";
  const subtitle = page ? page.subtitle : "";
  const summary = page ? page.summary : "";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-2 pt-8 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => router.history.back()}
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.back}
      </button>

      <section className="relative mt-6 overflow-hidden rounded-3xl bg-primary-tint px-6 py-10 shadow-soft sm:px-10 sm:py-12">
        <span className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-primary/15" />
        <span className="pointer-events-none absolute right-16 top-16 h-24 w-24 rounded-full bg-primary/10" />
        <div className="relative mx-auto max-w-3xl text-center">
          {subtitle !== "" && (
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-foreground">{subtitle}</p>
          )}
          <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
          {summary !== "" && (
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">{summary}</p>
          )}
        </div>
      </section>

      {chapterVideoUrl(slug) !== "" && (
        <div className="mt-10">
          <h2 className="mb-4 text-base font-bold text-foreground">
            {slug === "overview" ? "Choosing the Right Plan" : title}
          </h2>
          <VideoPlaceholder embedUrl={chapterVideoUrl(slug)} label={`${title} overview`} />
        </div>
      )}



      <div className="mt-14 space-y-14">
        <BlockList blocks={page ? page.blocks : []} />
      </div>

      <PrevNext slug={slug} />
    </div>
  );
}
