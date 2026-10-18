import type { NameValueItem } from "@/content/content-types";
import { SmartText } from "@/components/SmartText";

export function NameValueList({
  title,
  items,
  layout = "list",
}: {
  title: string;
  items: NameValueItem[];
  layout?: "list" | "cards";
}) {
  return (
    <section className="w-full">
      {title !== "" && (
        <h3 className="mb-4 text-left text-lg font-bold text-foreground">{title}</h3>
      )}
      {layout === "cards" ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {items.map((item, index) => (
            <article
              key={index}
              className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:border-primary/40 hover:shadow-lift"
            >
              <h4 className="text-base font-bold text-foreground">{item.name}</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                <SmartText text={item.value} />
              </p>
            </article>
          ))}
        </div>
      ) : (
        <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          {items.map((item, index) => (
            <div key={index} className="gap-3 px-6 py-4 sm:grid sm:grid-cols-[minmax(0,14rem)_1fr]">
              <dt className="text-sm font-bold text-foreground">{item.name}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground sm:mt-0">
                <SmartText text={item.value} />
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
