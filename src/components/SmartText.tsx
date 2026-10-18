import type { ReactNode } from "react";

const PATTERN =
  /(\[[^\]]+\]\([^)\s]+\)|[\w.+-]+@[\w-]+\.[\w.-]+|(?:https?:\/\/|www\.)[^\s,;)]+|\b[\w-]+(?:\.[\w-]+)*\.(?:com|org|net|gov|edu|io|co|us|info)\b(?:\/[^\s,;)]*)?|\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b)/g;

const linkClass =
  "font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary-deep hover:decoration-primary";

/** Renders text, turning phone numbers, emails and web addresses into links. */
export function SmartText({ text, className = "" }: { text: string; className?: string }) {
  if (text === "") return null;

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(PATTERN)) {
    const value = match[0];
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push(text.slice(lastIndex, index));
    lastIndex = index + value.length;
    const trimmed = value.replace(/[.,;]$/, "");

    const md = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(value);
    if (md) {
      nodes.push(
        <a key={`l${key++}`} href={md[2]} target="_blank" rel="noreferrer noopener" className={linkClass}>
          {md[1]}
        </a>,
      );
      continue;
    }
    if (trimmed.includes("@")) {
      nodes.push(
        <a key={`l${key++}`} href={`mailto:${trimmed}`} className={linkClass}>
          {trimmed}
        </a>,
      );
    } else if (/[a-z]/i.test(trimmed)) {
      const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      nodes.push(
        <a
          key={`l${key++}`}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className={linkClass}
        >
          {trimmed}
        </a>,
      );
    } else {
      nodes.push(
        <a key={`l${key++}`} href={`tel:${trimmed.replace(/[^\d+]/g, "")}`} className={linkClass}>
          {trimmed}
        </a>,
      );
    }
    if (trimmed !== value) nodes.push(value.slice(trimmed.length));
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

  return <span className={className}>{nodes}</span>;
}
