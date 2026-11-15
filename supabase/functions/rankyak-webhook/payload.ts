import { z } from "zod";

const nullableText = z.string().max(2000000).nullable().optional().default(null);
const date = z.string().datetime({ offset: true }).nullable().optional().default(null);
export const payloadSchema = z.discriminatedUnion("event", [
  z.object({ event: z.literal("ping") }),
  ...(["article.published", "article.updated"] as const).map(event => z.object({
    event: z.literal(event),
    status: z.enum(["published", "draft"]),
    article: z.object({
      id: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
      slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      title: z.string().trim().min(1).max(500),
      excerpt: nullableText,
      meta_title: nullableText,
      meta_description: nullableText,
      html: nullableText,
      markdown: nullableText,
      header_image_url: z.string().url().refine(value => /^https?:\/\//.test(value)).nullable().optional().default(null),
      publish_at: date,
      published_at: date,
      updated_at: date,
      archived_at: date,
    }),
  })),
]);

export function isConnectionTest(payload: z.infer<typeof payloadSchema>) {
  return payload.event === "ping" || payload.article.id === 0;
}

export function sameSecret(actual: string | null, expected: string): boolean {
  if (actual === null) return false;
  const a = new TextEncoder().encode(actual);
  const b = new TextEncoder().encode(expected);
  let diff = a.length ^ b.length;
  for (let i = 0; i < b.length; i++) diff |= (a[i] ?? 0) ^ b[i];
  return diff === 0;
}