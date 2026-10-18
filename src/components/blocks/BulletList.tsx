import { SmartText } from "@/components/SmartText";

export function BulletList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="w-full">
      {title !== "" && (
        <h3 className="mb-3 text-left text-lg font-bold text-foreground">{title}</h3>
      )}
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <SmartText text={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
