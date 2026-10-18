import { Play } from "lucide-react";
import { useLocale } from "@/i18n/LocaleContext";

/**
 * 16:9 video block. Pass `embedUrl` (e.g. a Synthesia share URL) per chapter
 * later and the iframe renders in place of the placeholder — no other change.
 */
export function VideoPlaceholder({
  embedUrl = "",
  label = "Chapter video",
}: {
  embedUrl?: string;
  label?: string;
}) {
  const { t } = useLocale();
  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-primary-tint shadow-soft">
      {embedUrl !== "" ? (
        <iframe
          src={embedUrl}
          title={label}
          allow="encrypted-media; fullscreen"
          allowFullScreen
          className="h-full w-full border-0"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lift">
            <Play className="h-5 w-5" />
          </span>
          <p className="px-6 text-sm font-semibold text-primary-deep">{label}</p>
          <p className="px-6 text-xs text-muted-foreground">{t.videoComingSoon}</p>
        </div>
      )}
    </div>
  );
}
