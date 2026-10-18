/**
 * Synthesia videos. Share links are converted to embeddable URLs so they play
 * inline. To add or swap a video, change only the share ID below.
 */

const embed = (id: string) => `https://share.synthesia.io/embeds/videos/${id}`;

/** Video shown on the homepage enrollment card. */
export const homepageVideoUrl = embed("5ca3bcc8-6823-4605-816a-1330ecf0ddf8");

/** Chapter page slug -> video. */
export const chapterVideos: Record<string, string> = {
  eligibility: embed("0aa23f38-e423-461d-977c-042b8f647552"),
  overview: embed("1f7a2a44-0093-4c26-8fd1-86120dcaf810"),
  ppo: embed("55a01d18-0aef-4cae-99bc-a490f2d319f1"),
  hdhp: embed("848933ac-5d3f-4074-8754-db8041488ccc"),
  dentalplans: embed("4a11b53a-e2fb-40e5-aac7-e98a293c599c"),
  visionplans: embed("16b59017-ab92-4d1a-926f-5bc2d6665c6c"),
  eap: embed("28ecdd22-0ad2-4d3c-85f2-ae68537b932a"),
  survivorbenefits: embed("acd9425e-227b-4d21-9971-d02178f1b22c"),
  supplementalhealth: embed("ac5fc9d7-3541-428b-bded-c3e67b6b7d6f"),
  incomeprotection: embed("e951e317-f005-4421-abd4-bd97cdfa32d6"),
  retirement: embed("82719e8d-a07d-4994-900c-cd8779188a0f"),
};

/** Tab videos, matched on the tab label. */
const tabVideoRules: { match: RegExp; url: string }[] = [
  { match: /vs/i, url: "" },
  { match: /hsa|health savings|ahorros/i, url: embed("e21bb9d9-aef7-4b5e-834c-6e6985333132") },
  { match: /fsa|spending|gastos/i, url: embed("54f3195b-1b2c-43d0-b8df-ade59e72f711") },
  { match: /identity|id protection|identidad/i, url: embed("5fe05daa-c77b-4a80-8aee-c3fea60e5e1a") },
  { match: /education|tuition|educación|matrícula/i, url: embed("fa4e7448-e70e-4d24-ad9c-2be4ddf16687") },
  { match: /wellness|livongo|bienestar/i, url: embed("47801657-89ab-4ddb-9d71-2dfe462f4d98") },
];

export function tabVideoUrl(label: string): string {
  const rule = tabVideoRules.find((entry) => entry.match.test(label));
  return rule ? rule.url : "";
}

export function chapterVideoUrl(slug: string): string {
  return chapterVideos[slug] ?? "";
}
