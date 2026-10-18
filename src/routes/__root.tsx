import type { ErrorComponentProps } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  redirect,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { siteMeta } from "../content/site";
import { usePageViewTracker } from "../components/MixPanel";
import { checkGate } from "../lib/gate.functions";
import { GATE_ENABLED } from "../lib/gate.config";
import { LocaleProvider, useLocale } from "../i18n/LocaleContext";

let clientUnlocked = false;

function NotFoundComponent() {
  const { t } = useLocale();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t.notFoundTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.notFoundBody}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.goHome}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${siteMeta.employerName} — ${siteMeta.planYear} Employee Benefits` },
      { name: "description", content: siteMeta.siteDescription.slice(0, 155) },
      { name: "author", content: siteMeta.employerName },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  beforeLoad: async ({ location }) => {
    if (!GATE_ENABLED) return;
    if (location.pathname === "/login") return;
    if (clientUnlocked) return;
    const { unlocked } = await checkGate();
    if (!unlocked) throw redirect({ to: "/login" });
    if (typeof window !== "undefined") clientUnlocked = true;
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  usePageViewTracker();
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname === "/login") return;
    if (document.getElementById("acolyte-widget")) return;
    const el = document.createElement("script");
    el.id = "acolyte-widget";
    el.src = "https://gen.acolytehealth.com/embed/widget.js";
    el.async = true;
    el.setAttribute("data-bot-id", "d8b8d392-7ec2-4665-adab-effe63502339");
    el.setAttribute("data-api", "https://api.gen.acolytehealth.com");
    document.body.appendChild(el);
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </LocaleProvider>
    </QueryClientProvider>
  );
}
