import sanitizeHtml from "sanitize-html";

export const RANKYAK_SITE = "https://prophetic.pw";
export async function loadRankyakPosts() {
  const base = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_KEY;
  if (!base || !key) throw new Error("Public blog connection is not configured");
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const url = new URL("/rest/v1/rankyak_articles", base);
    url.search = new URLSearchParams({ select: "*", status: "eq.published", order: "published_at.desc.nullslast", limit: "1000", offset: String(offset) }).toString();
    const response = await fetch(url, { headers: { apikey: key }, signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Blog source returned HTTP ${response.status}`);
    const batch = await response.json();
    rows.push(...batch);
    if (batch.length < 1000) break;
  }
  return rows.map(row => {
    const html = sanitizeHtml(row.html || "", {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "figure", "figcaption"]),
      allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ["src", "alt", "width", "height", "loading"], "*": ["id", "class"] },
      allowedSchemes: ["https", "http", "mailto"],
    });
    const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    return {
      slug: row.slug, file: null, html, styles: "", ld: [], words,
      title: row.title, seoTitle: row.meta_title || row.title,
      description: row.meta_description || row.excerpt || "",
      excerpt: row.excerpt || "", date: row.published_at || row.received_at,
      updated: row.updated_at || row.published_at || row.received_at,
      author: "Prophetic Editorial Team", tags: [], category: "Articles",
      image: row.header_image_url || "", imageAlt: row.title, showImage: !!row.header_image_url,
      readingTime: Math.max(1, Math.round(words / 200)),
      canonical: `${RANKYAK_SITE}/blog/${row.slug}/`, url: `${RANKYAK_SITE}/blog/${row.slug}/`,
      lang: "en", noindex: false, rankyak: true,
    };
  });
}