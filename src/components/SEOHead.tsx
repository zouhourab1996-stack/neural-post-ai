import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

const SITE_URL = "https://prophetic.pw";
const SITE_NAME = "NeuralPost";
const DEFAULT_IMAGE = "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1200";

export default function SEOHead({
  title,
  description,
  canonical,
  image = DEFAULT_IMAGE,
  type = "website",
  publishedTime,
  modifiedTime,
  author = "NeuralPost",
  section,
  tags = [],
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = `${title} | ${SITE_NAME}`;

    // Helper to update or create meta tag
    const setMeta = (property: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attr}="${property}"]`);
      if (element) {
        element.setAttribute("content", content);
      } else {
        element = document.createElement("meta");
        element.setAttribute(attr, property);
        element.setAttribute("content", content);
        document.head.appendChild(element);
      }
    };

    // Update canonical
    const canonicalUrl = canonical || window.location.href;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute("href", canonicalUrl);
    } else {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      canonicalLink.setAttribute("href", canonicalUrl);
      document.head.appendChild(canonicalLink);
    }

    // Basic meta tags
    setMeta("description", description);
    setMeta("author", author);

    // Open Graph
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:url", canonicalUrl, true);
    setMeta("og:image", image, true);
    setMeta("og:type", type, true);
    setMeta("og:site_name", SITE_NAME, true);

    // Twitter Card
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);
    setMeta("twitter:card", "summary_large_image");

    // Article specific
    if (type === "article") {
      if (publishedTime) {
        setMeta("article:published_time", publishedTime, true);
      }
      if (modifiedTime) {
        setMeta("article:modified_time", modifiedTime, true);
      }
      if (section) {
        setMeta("article:section", section, true);
      }
      if (author) {
        setMeta("article:author", author, true);
      }
      tags.forEach((tag, index) => {
        setMeta(`article:tag:${index}`, tag, true);
      });
    }

    // Cleanup function - reset to defaults on unmount
    return () => {
      document.title = `${SITE_NAME} - AI-Powered Tech News & Analysis`;
    };
  }, [title, description, canonical, image, type, publishedTime, modifiedTime, author, section, tags]);

  return null;
}

// JSON-LD Generator for Articles
export function generateArticleSchema(article: {
  title: string;
  description: string;
  image: string;
  slug: string;
  publishedTime: string;
  modifiedTime: string;
  category: string;
  author?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${SITE_URL}/article/${article.slug}#article`,
    "headline": article.title,
    "description": article.description,
    "image": {
      "@type": "ImageObject",
      "url": article.image,
      "width": 1200,
      "height": 630
    },
    "datePublished": article.publishedTime,
    "dateModified": article.modifiedTime,
    "author": {
      "@type": "Person",
      "name": article.author || "NeuralPost AI",
      "url": `${SITE_URL}/about`
    },
    "publisher": {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      "name": SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/favicon.ico`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SITE_URL}/article/${article.slug}`
    },
    "articleSection": article.category,
    "isAccessibleForFree": true
  };
}

// Breadcrumb Schema Generator
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${SITE_URL}${item.url}`
    }))
  };
}