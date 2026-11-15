import DOMPurify from "dompurify";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type BlogArticle = Database["public"]["Tables"]["rankyak_articles"]["Row"];
export const BLOG_SITE = "https://neural-post-ai.lovable.app";
export const cleanBlogHtml = (html: string) => DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
export async function publishedBlogArticles() {
  const { data, error } = await supabase.from("rankyak_articles").select("*").eq("status", "published").order("published_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data || [];
}
export async function publishedBlogArticle(slug: string) {
  const { data, error } = await supabase.from("rankyak_articles").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  if (error) throw error;
  return data;
}
export function setBlogMetadata(title: string, description: string, url: string, image?: string | null, missing = false) {
  document.title = title;
  const set = (selector: string, attribute: string, value: string) => {
    let element = document.head.querySelector(selector);
    if (!element) {
      element = document.createElement(selector.startsWith("link") ? "link" : "meta");
      const match = selector.match(/\[(name|property|rel)="([^"]+)"\]/);
      if (match) element.setAttribute(match[1], match[2]);
      document.head.appendChild(element);
    }
    element.setAttribute(attribute, value);
  };
  set('meta[name="description"]', "content", description);
  set('meta[name="robots"]', "content", missing ? "noindex,follow" : "index,follow,max-image-preview:large");
  set('link[rel="canonical"]', "href", url);
  set('meta[property="og:title"]', "content", title);
  set('meta[property="og:description"]', "content", description);
  set('meta[property="og:url"]', "content", url);
  set('meta[property="og:type"]', "content", image ? "article" : "website");
  set('meta[name="twitter:card"]', "content", image ? "summary_large_image" : "summary");
  if (image) set('meta[property="og:image"]', "content", image);
  else document.head.querySelector('meta[property="og:image"]')?.remove();
}