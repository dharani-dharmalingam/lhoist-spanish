import { Link } from "@tanstack/react-router";
import { Download, ExternalLink, Home } from "lucide-react";
import { useSite } from "@/i18n/useSite";
import { guidePdfUrl, logoUrl } from "@/lib/brand";
import { downloadFile } from "@/lib/download";
import { useLocale } from "@/i18n/LocaleContext";

export function SiteFooter() {
  const { t } = useLocale();
  const { siteMeta } = useSite();
  const guideFileName = t.guideFileName(siteMeta.employerName, siteMeta.planYear);
  return (
    <footer className="mt-10 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 text-center sm:text-left md:grid-cols-3 lg:px-8">
        <div className="flex flex-col items-center sm:items-start">
          <img src={logoUrl} alt={t.logoAlt(siteMeta.employerName)} className="h-14 w-auto" />
          <p className="mt-4 text-base font-bold text-foreground">{siteMeta.employerName}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.09em] text-foreground">
            {t.employeeBenefits(siteMeta.planYear)}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.09em] text-foreground">{t.quickLinks}</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 text-muted-foreground transition-colors hover:text-primary sm:justify-start"
              >
                <Home className="h-4 w-4" />
                {t.home}
              </Link>
            </li>
            <li>
              <a
                href={guidePdfUrl}
                onClick={(event) => {
                  event.preventDefault();
                  void downloadFile(guidePdfUrl, guideFileName);
                }}
                className="inline-flex items-center justify-center gap-2 text-muted-foreground transition-colors hover:text-primary sm:justify-start"
              >
                <Download className="h-4 w-4" />
                {t.downloadGuide}
              </a>
            </li>
            <li>
              <a
                href="https://wd3-identity.myworkday.com/wday/authgwy/lhoist/upc/login"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center justify-center gap-2 text-muted-foreground transition-colors hover:text-primary sm:justify-start"
              >
                <ExternalLink className="h-4 w-4" />
                {t.workday}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.09em] text-foreground">
            {t.contactBenefits}
          </p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {siteMeta.supportEmail !== "" && (
              <li>
                <a
                  href={`mailto:${siteMeta.supportEmail}`}
                  className="transition-colors hover:text-primary"
                >
                  {siteMeta.supportEmail}
                </a>
              </li>
            )}
            {siteMeta.supportPhone !== "" && (
              <li>
                <a
                  href={`tel:${siteMeta.supportPhone.replace(/[^\d+]/g, "")}`}
                  className="transition-colors hover:text-primary"
                >
                  {siteMeta.supportPhone}
                </a>
              </li>
            )}
            {siteMeta.supportAddress !== "" && <li>{siteMeta.supportAddress}</li>}
          </ul>
        </div>
      </div>

      {siteMeta.disclaimerText !== "" && (
        <div className="border-t border-border/70">
          <p className="mx-auto max-w-7xl px-6 py-8 text-center text-[11px] leading-relaxed text-muted-foreground sm:text-left lg:px-8">
            {siteMeta.disclaimerText}
          </p>
        </div>
      )}
    </footer>
  );
}
