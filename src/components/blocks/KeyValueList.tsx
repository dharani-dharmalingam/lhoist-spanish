import type { KeyValueItem } from "@/content/content-types";
import { SmartText } from "@/components/SmartText";

export function KeyValueList({ title, items }: { title: string; items: KeyValueItem[] }) {
  return (
    <section className="w-full">
      {title !== "" && (
        <h3 className="mb-4 text-left text-lg font-bold text-foreground">{title}</h3>
      )}
      <dl className="grid gap-4 sm:grid-cols-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border bg-card px-6 py-5 shadow-soft"
          >
            <dt className="text-[11px] font-bold uppercase tracking-[0.09em] text-foreground">
              {item.label}
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-foreground">
              <SmartText text={item.value} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
