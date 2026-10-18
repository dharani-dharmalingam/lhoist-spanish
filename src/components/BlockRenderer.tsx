import { useState, type CSSProperties } from "react";
import {
  Activity,
  Baby,
  Briefcase,
  ClipboardList,
  Coins,
  GraduationCap,
  Heart,
  LayoutGrid,
  PiggyBank,
  Scale,
  Shield,
  Wallet,
} from "lucide-react";
import type { Block } from "@/content/content-types";
import { GridTable } from "@/components/blocks/GridTable";
import { CardList } from "@/components/blocks/CardList";
import { AccountCards } from "@/components/blocks/AccountCards";
import { ContactCards } from "@/components/blocks/ContactCards";
import { KeyValueList } from "@/components/blocks/KeyValueList";
import { IconFactGrid } from "@/components/blocks/IconFactGrid";
import { BulletList } from "@/components/blocks/BulletList";
import { NameValueList } from "@/components/blocks/NameValueList";
import { SectionText } from "@/components/blocks/SectionText";
import { VideoPlaceholder } from "@/components/VideoPlaceholder";
import { tabVideoUrl } from "@/content/videos";

const iconRules: { match: RegExp; icon: typeof LayoutGrid; tone: string }[] = [
  { match: /vs|compar|fsa.*hsa|hsa.*fsa/i, icon: Scale, tone: "text-comparison-icon" },
  { match: /hsa|health savings|ahorros/i, icon: PiggyBank, tone: "text-[oklch(0.62_0.15_150)]" },
  { match: /fsa|spending|gastos/i, icon: ClipboardList, tone: "text-[oklch(0.62_0.15_45)]" },
  { match: /financ|discount|money|legal|descuento|dinero/i, icon: Coins, tone: "text-[oklch(0.62_0.15_45)]" },
  { match: /family|child|parent|depend|famili|hijo|padre/i, icon: Baby, tone: "text-[oklch(0.62_0.13_20)]" },
  { match: /health|medical|well|salud|médic|bienestar/i, icon: Heart, tone: "text-[oklch(0.6_0.16_20)]" },
  { match: /protect|insur|security|protecc|seguro|seguridad/i, icon: Shield, tone: "text-[oklch(0.55_0.13_255)]" },
  { match: /work|career|employ|trabajo|carrera|empleo/i, icon: Briefcase, tone: "text-[oklch(0.55_0.1_255)]" },
  { match: /learn|educat|tuition|aprend|educac|matrícula/i, icon: GraduationCap, tone: "text-[oklch(0.55_0.14_290)]" },
  { match: /life|support|program|vida|apoyo|programa/i, icon: Activity, tone: "text-[oklch(0.6_0.14_170)]" },
];

function iconFor(label: string) {
  const rule = iconRules.find((entry) => entry.match.test(label));
  return rule ? rule : { icon: LayoutGrid, tone: "text-primary" };
}

function Tabs({ tabs }: { tabs: { label: string; blocks: Block[] }[] }) {
  const [active, setActive] = useState(0);
  const current = tabs[active] ?? tabs[0];

  return (
    <section className="w-full">
      <div
        className="grid w-full grid-cols-2 gap-3 sm:[grid-template-columns:var(--tab-cols)]"
        style={{ "--tab-cols": `repeat(${tabs.length}, minmax(0, 1fr))` } as CSSProperties}
      >
        {tabs.map((tab, index) => {
          const { icon: Icon, tone } = iconFor(tab.label);
          const isActive = index === active;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActive(index)}
              aria-pressed={isActive}
              className={`flex w-full flex-col items-center gap-2 rounded-2xl border px-4 py-4 transition-all duration-200 ${
                isActive
                  ? "border-primary bg-primary-tint shadow-soft"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary-deep"
              }`}
            >
              <Icon className={`h-5 w-5 ${tone} ${isActive ? "" : "opacity-70"}`} />
              <span
                className={`text-center text-sm font-semibold ${
                  isActive ? "text-primary-deep" : ""
                }`}
              >
                {tab.label}
              </span>
              <span
                className={`h-0.5 w-10 rounded-full ${isActive ? "bg-primary" : "bg-transparent"}`}
              />
            </button>
          );
        })}
      </div>
      <div className="mt-8 space-y-10 rise-in">
        {current && tabVideoUrl(current.label) !== "" && (
          <VideoPlaceholder embedUrl={tabVideoUrl(current.label)} label={`${current.label} video`} />
        )}
        <BlockList blocks={current ? current.blocks : []} />
      </div>
    </section>
  );
}

export function BlockList({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block) => {
        switch (block.kind) {
          case "section":
            return <SectionText key={block.id} data={block.data} />;
          case "table":
            return <GridTable key={block.id} data={block.data} />;
          case "cards":
            return (
              <CardList
                key={block.id}
                title={block.title}
                items={block.data}
                layout={block.layout ?? "grid"}
              />
            );
          case "accountCards":
            return (
              <AccountCards
                key={block.id}
                title={block.title}
                subtitle={block.subtitle}
                items={block.data}
              />
            );
          case "contacts":
            return <ContactCards key={block.id} title={block.title} items={block.data} />;
          case "keyValues":
            return <KeyValueList key={block.id} title={block.title} items={block.data} />;
          case "iconFacts":
            return <IconFactGrid key={block.id} title={block.title} items={block.data} />;
          case "bullets":
            return <BulletList key={block.id} title={block.title} items={block.data} />;
          case "nameValues":
            return (
              <NameValueList
                key={block.id}
                title={block.title}
                items={block.data}
                layout={block.layout ?? "list"}
              />
            );
          case "tabs":
            return <Tabs key={block.id} tabs={block.data} />;
        }
      })}
    </>
  );
}
