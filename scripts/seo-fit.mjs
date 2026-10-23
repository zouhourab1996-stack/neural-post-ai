/**
 * SEO meta-length fitting — shared by every generator.
 *
 * Google truncates titles around 60 characters and descriptions around 155-160.
 * These helpers guarantee both stay inside the limits no matter how long the
 * source string is, WITHOUT mangling the meaning:
 *
 *   fitTitle  drops a redundant brand segment first (the brand may sit at either
 *             end), then trims at a word boundary and strips dangling words.
 *   fitDesc   cuts at a SENTENCE boundary whenever one fits, otherwise at a word
 *             boundary. Never mid-word, never with an added ellipsis.
 */

export const TITLE_MAX = 60;
export const DESC_MAX = 155;

// Words a title must never end on.
const DANGLING = new Set(["which", "vs", "vs.", "and", "or", "to", "the", "a", "an",
  "of", "for", "with", "in", "on", "at", "by", "from", "is", "are", "be", "&",
  "that", "this", "you", "your", "how", "what", "when"]);

function stripDangling(s) {
  let out = s;
  for (;;) {
    const parts = out.trim().split(/\s+/);
    if (parts.length <= 2) break;
    const last = parts[parts.length - 1].toLowerCase().replace(/[^\p{L}\p{N}.]/gu, "");
    if (DANGLING.has(last)) out = parts.slice(0, -1).join(" ");
    else break;
  }
  return out.replace(/[\s,;:—–\-|]+$/, "");
}

function trimWords(s, limit) {
  let cut = s.slice(0, limit).replace(/[\s,;:—–\-|]+$/, "");
  const i = cut.lastIndexOf(" ");
  if (i > limit * 0.55) cut = cut.slice(0, i);
  return stripDangling(cut);
}

/** Shorten a title to TITLE_MAX while preserving the descriptive part. */
export function fitTitle(t, { isHome = false } = {}) {
  const s = String(t ?? "").trim();
  if (s.length <= TITLE_MAX) return s;
  if (!isHome) {
    for (const sep of [" | ", " – ", " — ", " - ", " · "]) {
      if (s.includes(sep)) {
        const parts = s.split(sep).map((x) => x.trim()).filter(Boolean);
        if (parts.length === 2) {
          // keep the LONGER segment — that is the descriptive one
          const keep = parts[0].length >= parts[1].length ? parts[0] : parts[1];
          return keep.length <= TITLE_MAX ? keep : trimWords(keep, TITLE_MAX);
        }
      }
    }
  }
  return trimWords(s, TITLE_MAX);
}

/** Shorten a description to DESC_MAX, cutting at a sentence boundary if possible. */
export function fitDesc(d) {
  const s = String(d ?? "").trim().replace(/\s+/g, " ");
  if (s.length <= DESC_MAX) return s;
  // try to end on a sentence
  const sentences = s.match(/[^.!?]+[.!?]*/g) || [s];
  let out = "";
  for (const p of sentences) {
    if ((out + p).length <= DESC_MAX) out += p;
    else break;
  }
  out = out.trim();
  if (out.length >= DESC_MAX * 0.55) return out;
  return trimWords(s, DESC_MAX);
}
