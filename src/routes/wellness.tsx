import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { ChapterPage } from "@/components/ChapterPage";

const title = "Wellness — Lhoist North America 2027 Benefits";
const description =
  "Wellness details for Lhoist North America employees in the 2027 plan year.";

export const Route = createFileRoute("/wellness")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteShell>
      <ChapterPage slug="wellness" />
    </SiteShell>
  );
}
