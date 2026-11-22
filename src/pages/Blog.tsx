import { useEffect, useState } from "react";

type ExistingPost = { slug: string; title: string; description: string; date: string; image?: string; noindex?: boolean; category?: string; readingTime?: number };
export default function Blog() {
  const [posts, setPosts] = useState<ExistingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/blog/manifest.json", { signal: controller.signal, headers: { Accept: "application/json" } })
      .then(response => response.ok ? response.json() : Promise.reject(new Error("Manifest unavailable")))
      .then(value => setPosts(Array.isArray(value?.posts) ? value.posts.filter((p: ExistingPost) => p && !p.noindex) : []))
      .catch(() => { if (!controller.signal.aborted) setFailed(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  return <section className="container-main py-12 sm:py-16"><h1 className="mb-4 text-4xl font-bold">Prophetic Blog</h1><p className="mb-10 max-w-3xl text-muted-foreground">Astrology, birth-chart concepts and sky-event guides. Astronomy is distinguished from symbolic astrological interpretation.</p>
    {loading && <p role="status">Loading articles…</p>}
    {failed && <p role="alert">The article list is temporarily unavailable. You can use the <a href="/sitemap/">site map</a> instead.</p>}
    {!loading && !failed && !posts.length && <p className="text-muted-foreground">No public articles are available yet.</p>}
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{posts.map(p => <a key={p.slug} href={`/blog/${p.slug}/`} className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
      {p.image && <img src={p.image} alt="" className="aspect-video w-full object-cover" loading="lazy" />}
      <div className="p-5"><div className="flex justify-between gap-3 text-xs text-muted-foreground"><span>{p.category || "Guide"}</span>{p.readingTime ? <span>{p.readingTime} min read</span> : null}</div><h2 className="mt-3 break-words text-xl font-semibold">{p.title}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{p.description}</p><time dateTime={p.date} className="mt-4 block text-xs text-muted-foreground">{p.date}</time></div>
    </a>)}</div>
  </section>;
}
