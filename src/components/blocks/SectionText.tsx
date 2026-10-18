import type { SectionTextData } from "@/content/content-types";
import { SmartText } from "@/components/SmartText";

export function SectionText({ data }: { data: SectionTextData }) {
  return (
    <section className="w-full">
      {data.heading !== "" && (
        <h3 className="text-left text-lg font-bold text-foreground">{data.heading}</h3>
      )}
      {data.body !== "" && (
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          <SmartText text={data.body} />
        </p>
      )}
      {data.bullets.length > 0 && (
        <ul className="mt-4 space-y-2">
          {data.bullets.map((bullet, index) => (
            <li key={index} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <SmartText text={bullet} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
