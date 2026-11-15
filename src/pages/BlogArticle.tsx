import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BLOG_SITE, cleanBlogHtml, publishedBlogArticle, setBlogMetadata } from "@/lib/blog";
import AdUnit from "@/components/AdUnit";

export default function BlogArticle() {
  const { slug = "" } = useParams();
  const { data: article, isPending, error } = useQuery({ queryKey: ["blog", slug], queryFn: () => publishedBlogArticle(slug) });
  useEffect(() => {
    if (isPending || error) return;
    if (!article) {
      setBlogMetadata("Page Not Found | Prophetic", "This article is not available.", `${BLOG_SITE}/blog/${slug}`, null, true);
      return;
    }
    setBlogMetadata(article.meta_title || article.title, article.meta_description || article.excerpt || "", `${BLOG_SITE}/blog/${slug}`, article.header_image_url);
  }, [article, slug, isPending, error]);
  if (isPending) return <section className="container-main py-16"><p role="status">Loading article…</p></section>;
  if (error) return <section className="container-main py-16"><p role="alert">This article could not be loaded. Please try again.</p></section>;
  if (!article) return <section className="container-main py-16"><h1 className="text-3xl font-bold">Page Not Found</h1><p className="my-5">This article is not available.</p><Link to="/blog" className="text-primary">All articles</Link></section>;
  return <section className="container-main py-12 sm:py-16"><article className="mx-auto max-w-3xl">
    <Link to="/blog" className="text-sm text-primary">← All articles</Link>
    <h1 className="my-6 break-words text-3xl font-bold leading-tight sm:text-4xl">{article.title}</h1>
    {article.header_image_url && <img src={article.header_image_url} alt={article.title} className="mb-8 aspect-video w-full rounded-lg object-cover" />}
    <div className="prose prose-invert max-w-none break-words prose-headings:text-foreground prose-p:text-foreground prose-a:text-primary prose-table:block prose-table:overflow-x-auto" dangerouslySetInnerHTML={{ __html: cleanBlogHtml(article.html || "") }} />
    <AdUnit />
  </article></section>;
}