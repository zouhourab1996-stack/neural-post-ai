import { Helmet } from 'react-helmet-async';

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

  return (
    <Helmet>
      <title>{title} | Prophetic</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={imageUrl} />
      <meta property="article:published_time" content={publishedAt} />
      {updatedAt && <meta property="article:modified_time" content={updatedAt} />}
      <meta property="article:section" content={category} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={imageUrl} />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}