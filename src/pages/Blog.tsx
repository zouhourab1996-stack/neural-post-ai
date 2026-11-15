import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BLOG_SITE, publishedBlogArticles, setBlogMetadata } from "@/lib/blog";

type ExistingPost = { slug: string; title: string; description: string; date: string; image?: string; noindex?: boolean };
export default function Blog() {
  const { data: articles = [], isPending, error } = useQuery({ queryKey: ["blog"], queryFn: publishedBlogArticles });
  const [existing, setExisting] = useState<ExistingPost[]>([]);
  useEffect(() => {
    setBlogMetadata("Prophetic Blog", "The latest guides and articles from Prophetic.", `${BLOG_SITE}/blog`);
    const controller = new AbortController();
    fetch("/blog/manifest.json", { signal: controller.signal }).then(r => r.ok ? r.json() : null).then(value => setExisting(value?.posts?.filter((p: ExistingPost) => !p.noindex) || [])).catch(() => {});
    return () => controller.abort();
  }, []);
  const posts = [...existing.filter(p => !articles.some(a => a.slug === p.slug)), ...articles.map(a => ({ slug: a.slug, title: a.title, description: a.excerpt || "", date: a.published_at || a.received_at, image: a.header_image_url || undefined }))].sort((a, b) => b.date.localeCompare(a.date));
  return <section className="container-main py-12 sm:py-16"><h1 className="mb-10 text-4xl font-bold">Prophetic Blog</h1>
    {isPending && <p role="status">Loading articles…</p>}
    {error && <p role="alert">Articles could not be loaded. Please try again.</p>}
    {!isPending && !error && !posts.length && <p className="text-muted-foreground">No published articles yet.</p>}
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{posts.map(p => <Link key={p.slug} to={`/blog/${p.slug}`} className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
      {p.image && <img src={p.image} alt={p.title} className="aspect-video w-full object-cover" loading="lazy" />}
      <div className="p-5"><time dateTime={p.date} className="text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time><h2 className="mt-3 break-words text-xl font-semibold">{p.title}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{p.description}</p></div>
    </Link>)}</div>
  </section>;
}