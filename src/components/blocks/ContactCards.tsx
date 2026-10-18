import { Fragment } from "react";
import { Globe, Mail, Phone } from "lucide-react";
import type { ContactCard } from "@/content/content-types";
import { SmartText } from "@/components/SmartText";
import { isLabel } from "@/content/localize";

function LinkIcon({ href }: { href: string }) {
  if (href.startsWith("tel:")) return <Phone className="h-4 w-4 shrink-0 text-primary" />;
  if (href.startsWith("mailto:")) return <Mail className="h-4 w-4 shrink-0 text-primary" />;
  return <Globe className="h-4 w-4 shrink-0 text-primary" />;
}

export function ContactCards({ title, items }: { title: string; items: ContactCard[] }) {
  return (
    <section className="w-full">
      {title !== "" && (
        <h3 className="mb-5 text-left text-lg font-bold text-foreground">{title}</h3>
      )}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <article
            key={`${item.provider}-${index}`}
            className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:border-primary/40 hover:shadow-lift"
          >
            {item.category !== "" && (
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {item.category}
              </span>
            )}
            <h4 className="mt-1 text-base font-bold text-foreground">{item.provider}</h4>

            {item.planNames.length > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">{item.planNames.join(", ")}</p>
            )}

            {item.links.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {item.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noreferrer noopener" : undefined}
                    className="flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary-deep"
                  >
                    <LinkIcon href={link.href} />
                    <span className="min-w-0 break-words">{link.label}</span>
                  </a>
                ))}
              </div>
            )}

            {item.facts.length > 0 && (
              <dl className="mt-3 space-y-0.5 text-xs text-muted-foreground">
                {item.facts.map((fact, factIndex) => (
                  <Fragment key={factIndex}>
                    {item.provider === "Lhoist North America Benefits Team" && isLabel(fact.label, "Address") && item.note !== "" && (
                      <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                        <SmartText text={item.note} />
                      </p>
                    )}
                  <div key={factIndex} className="flex gap-1.5">
                    <dt className="font-semibold">{fact.label}:</dt>
                    <dd className="min-w-0 break-words">
                      <SmartText text={fact.value} />
                    </dd>
                  </div>
                  </Fragment>
                ))}
              </dl>
            )}

            {item.note !== "" && !(item.provider === "Lhoist North America Benefits Team" && item.facts.some((fact) => isLabel(fact.label, "Address"))) && (
              <p className="mt-3 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                <SmartText text={item.note} />
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
