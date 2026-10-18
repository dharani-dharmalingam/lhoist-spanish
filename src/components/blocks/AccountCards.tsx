import { HeartPulse, Smile, DollarSign } from "lucide-react";
import type { AccountCardItem } from "@/content/content-types";
import { SmartText } from "@/components/SmartText";

const icons = [HeartPulse, Smile, DollarSign];

export function AccountCards({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: AccountCardItem[];
}) {
  return (
    <section className="w-full">
      {title !== "" && <h3 className="text-left text-lg font-bold text-foreground">{title}</h3>}
      {subtitle !== "" && (
        <p className="mt-2 text-left text-sm leading-7 text-muted-foreground">{subtitle}</p>
      )}

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {items.map((item, index) => {
          const Icon = icons[index % icons.length] ?? HeartPulse;
          return (
            <article
              key={item.title}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-tint text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h4 className="mt-4 text-base font-bold text-foreground">{item.title}</h4>
              {item.administrator !== "" && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Administered by {item.administrator}
                </p>
              )}

              {item.limitValue !== "" && (
                <div className="mt-4 rounded-xl bg-primary-tint px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-primary">
                    {item.limitLabel}
                  </p>
                  <p className="mt-1 text-sm font-bold text-foreground">{item.limitValue}</p>
                </div>
              )}

              {item.bullets.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {item.bullets.map((bullet, bulletIndex) => (
                    <li
                      key={bulletIndex}
                      className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <SmartText text={bullet} />
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
