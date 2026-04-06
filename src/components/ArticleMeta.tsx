import { useEffect } from 'react';

interface ArticleMetaProps {
  title: string;
  description: string;
  slug: string;
  imageUrl: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
}

export function ArticleMeta({ title, description, slug, imageUrl, publishedAt, updatedAt, category }: ArticleMetaProps) {
  const base = 'https://prophetic.pw';
  const url  = `${base}/article/${slug}`;
  const desc = description.length > 155 ? description.substring(0, 152) + '...' : description;

  useEffect(() => {
    document.title = `${title} | Prophetic`;

    const setMeta = (selector: string, attr: string, value: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', 'content', desc);
    setMeta('link[rel="canonical"]', 'href', url);
    setMeta('meta[property="og:type"]', 'content', 'article');
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', desc);
    setMeta('meta[property="og:image"]', 'content', imageUrl);
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', desc);
    setMeta('meta[name="twitter:image"]', 'content', imageUrl);

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "datePublished": publishedAt,
      "dateModified": updatedAt || publishedAt,
      "author": { "@type": "Organization", "name": "Prophetic AI" },
      "publisher": {
        "@type": "Organization",
        "name": "Prophetic",
        "logo": { "@type": "ImageObject", "url": `${base}/logo.svg` }
      },
      "image": imageUrl,
      "url": url,
      "description": desc,
      "articleSection": category,
      "inLanguage": "en-US",
      "mainEntityOfPage": { "@type": "WebPage", "@id": url }
    };

    const scriptEl = document.createElement('script');
    scriptEl.type = 'application/ld+json';
    scriptEl.setAttribute('data-schema', 'article-meta');
    scriptEl.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(scriptEl);

    return () => {
      document.querySelectorAll('script[data-schema="article-meta"]').forEach(el => el.remove());
    };
  }, [title, desc, url, imageUrl, publishedAt, updatedAt, category]);

  return null;
}
