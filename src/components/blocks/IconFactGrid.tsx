import {
  Building2,
  CheckCircle2,
  Clipboard,
  Globe2,
  LayoutGrid,
  PiggyBank,
  Users,
  Wallet,
} from "lucide-react";
import { useLocation } from "@tanstack/react-router";
import type { KeyValueItem } from "@/content/content-types";
import { SmartText } from "@/components/SmartText";
import { isLabel } from "@/content/localize";

const iconRules: { match: RegExp; icon: typeof LayoutGrid }[] = [
  { match: /carrier|aseguradora/i, icon: Building2 },
  { match: /plan type|tipo de plan/i, icon: CheckCircle2 },
  { match: /network|red\b/i, icon: Globe2 },
  { match: /hsa/i, icon: PiggyBank },
  { match: /fsa/i, icon: Wallet },
];

function iconFor(label: string) {
  const rule = iconRules.find((entry) => entry.match.test(label));
  return rule ? rule.icon : LayoutGrid;
}

export function IconFactGrid({ title, items }: { title: string; items: KeyValueItem[] }) {
  const { pathname } = useLocation();
  return (
    <section className="w-full">
      {title !== "" && (
        <h3 className="mb-5 text-left text-lg font-bold text-foreground">{title}</h3>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const Icon = (pathname === "/ppo" || pathname === "/hdhp") && isLabel(item.label, "Dependent Care Eligible")
            ? Users
            : (pathname === "/ppo" || pathname === "/hdhp") && isLabel(item.label, "Plan Type")
            ? Clipboard
            : iconFor(item.label);
          return (
            <div
              key={index}
              className="flex items-start gap-4 rounded-2xl border border-border bg-card px-5 py-5 shadow-soft"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-tint">
                <Icon className="h-5 w-5 text-primary" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-foreground">
                  <SmartText text={item.value} />
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
