import { Globe, Phone } from "lucide-react";
import type { CardItem } from "@/content/content-types";
import { SmartText } from "@/components/SmartText";
import { GridTable } from "@/components/blocks/GridTable";

function StackCard({ item }: { item: CardItem }) {
  return (
    <article className="w-full rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
      <h4 className="text-lg font-bold text-foreground">{item.title}</h4>
      {item.subtitle !== "" && (
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.09em] text-primary">
          {item.subtitle}
        </p>
      )}
      {item.description !== "" && (
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          <SmartText text={item.description} />
        </p>
      )}

      {item.bullets.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            What&apos;s included
          </p>
          <ul className="mt-3 space-y-2">
            {item.bullets.map((bullet, index) => (
              <li key={index} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <SmartText text={bullet} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {item.table !== null && (
        <div className="mt-6">
          <GridTable data={item.table} />
        </div>
      )}

      {item.links.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border/70 pt-5">
          {item.links.map((link, index) => {
            const isPhone = link.href.startsWith("tel:");
            const Icon = isPhone ? Phone : Globe;
            return (
              <a
                key={index}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer noopener" : undefined}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary-deep transition-colors hover:text-primary"
              >
                <Icon className="h-4 w-4 text-primary" />
                {link.label}
              </a>
            );
          })}
        </div>
      )}
    </article>
  );
}

export function CardList({
  title,
  items,
  layout = "grid",
}: {
  title: string;
  items: CardItem[];
  layout?: "grid" | "stack";
}) {
  return (
    <section className="w-full">
      {title !== "" && (
        <h3 className="mb-5 text-left text-lg font-bold text-foreground">{title}</h3>
      )}
      {layout === "stack" ? (
        <div className="grid gap-6">
          {items.map((item, index) => (
            <StackCard key={`${item.title}-${index}`} item={item} />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {items.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
            >
              <span className="h-1 w-10 rounded-full bg-primary" />
              <h4 className="mt-4 text-base font-bold text-foreground">{item.title}</h4>
              {item.subtitle !== "" && (
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.09em] text-foreground">
                  {item.subtitle}
                </p>
              )}
              {item.description !== "" && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  <SmartText text={item.description} />
                </p>
              )}

              {item.facts.length > 0 && (
                <dl className="mt-4 space-y-2 border-t border-border/70 pt-4">
                  {item.facts.map((fact, factIndex) => (
                    <div key={factIndex} className="grid gap-0.5">
                      <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                        {fact.label}
                      </dt>
                      <dd className="text-sm text-foreground">
                        <SmartText text={fact.value} />
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {item.bullets.length > 0 && (
                <ul className="mt-4 space-y-1.5">
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

              {item.links.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.links.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noreferrer noopener" : undefined}
                      className="inline-flex items-center rounded-full bg-primary-tint px-3 py-1.5 text-xs font-semibold text-primary-deep transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}

              {item.table !== null && (
                <div className="mt-5">
                  <GridTable data={item.table} />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
