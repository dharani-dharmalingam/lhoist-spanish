import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowRight, Lock } from "lucide-react";
import { unlockSite } from "@/lib/gate.functions";
import { heroImageUrl, logoUrl } from "@/lib/brand";
import { siteMeta } from "@/content/site";
import { GATE_ENABLED } from "@/lib/gate.config";

const title = `Sign in — Lhoist North America ${siteMeta.planYear} Benefits`;
const description = "Enter the access password to view the Lhoist North America employee benefits site.";

export const Route = createFileRoute("/login")({
  // Gate is paused: the login page is hidden and sends visitors home.
  beforeLoad: () => {
    if (!GATE_ENABLED) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Login,
});

function Login() {
  const router = useRouter();
  const unlock = useServerFn(unlockSite);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    const password = new FormData(e.currentTarget).get("password") as string;
    try {
      const { ok } = await unlock({ data: { password } });
      if (ok) {
        await router.invalidate();
        await router.navigate({ to: "/" });
      } else setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <img
        src={heroImageUrl}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full scale-110 object-cover opacity-15 grayscale blur-[2px]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background/60 via-background/80 to-primary-tint/70" />
      <div className="w-full max-w-md rounded-3xl border border-border bg-card/90 p-8 shadow-lift backdrop-blur-sm rise-in sm:p-10">
        <img src={logoUrl} alt={`${siteMeta.employerName} logo`} className="h-8 w-auto" />
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-primary">
          {siteMeta.planYear} Employee Benefits
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">Welcome</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the access password to explore your benefits.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-foreground">Password</span>
            <div className="relative mt-2">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                name="password"
                type="password"
                required
                autoFocus
                autoComplete="current-password"
                className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </label>
          {error && <p className="text-sm text-destructive">Incorrect password. Please try again.</p>}
          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lift transition-colors hover:bg-primary-deep disabled:opacity-60"
          >
            {busy ? "Checking…" : "Enter"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
