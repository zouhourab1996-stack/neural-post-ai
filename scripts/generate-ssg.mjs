/**
 * Static Site Generation Script for SEO-friendly routes on GitHub Pages
 * - Generates physical HTML pages for articles, categories, and static routes
 * - Generates sitemap.xml, sitemap.txt, rss.xml, and atom.xml
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = "https://prophetic.pw";
const SITE_NAME = "Prophetic";
const DEFAULT_IMAGE =
  "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1200";

const FALLBACK_PROJECT_ID = "bltytefghazluwicnaii";
const FALLBACK_SUPABASE_URL = `https://${FALLBACK_PROJECT_ID}.supabase.co`;
const FALLBACK_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsdHl0ZWZnaGF6bHV3aWNuYWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NzY5MzksImV4cCI6MjA4NDI1MjkzOX0.LfH0E7PQ5kD9NpNDK0zSGSNSU3mnGvImeytOF5gqt3w";

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  (process.env.VITE_SUPABASE_PROJECT_ID
    ? `https://${process.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`
    : FALLBACK_SUPABASE_URL);

const supabaseKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing database credentials for SSG.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = ["AI", "Tech", "Business", "Science"];

const staticPages = [
  {
    route: "/about",
    title: "About Prophetic",
    description:
      "Learn about Prophetic and our mission to provide AI-powered future predictions and trend analysis.",
    heading: "About Prophetic",
    content:
      "Prophetic is a digital publication focused on AI predictions, future intelligence, and trend forecasting across technology, markets, and science.",
  },
  {
    route: "/contact",
    title: "Contact Prophetic",
    description:
      "Contact Prophetic for editorial questions, partnerships, and support.",
    heading: "Contact",
    content:
      "For inquiries, feedback, or partnership opportunities, please reach out to the Prophetic editorial team.",
  },
  {
    route: "/privacy",
    title: "Privacy Policy - Prophetic",
    description: "Read the privacy policy for Prophetic.",
    heading: "Privacy Policy",
    content:
      "This page outlines how Prophetic collects, processes, and protects data in accordance with modern privacy standards.",
  },
  {
    route: "/terms",
    title: "Terms of Service - Prophetic",
    description: "Read the terms of service for using Prophetic.",
    heading: "Terms of Service",
    content:
      "These terms describe acceptable use, content ownership, and user responsibilities when accessing Prophetic.",
  },
  {
    route: "/disclaimer",
    title: "Disclaimer - Prophetic",
    description: "Important legal and editorial disclaimers for Prophetic.",
    heading: "Disclaimer",
    content:
      "Prophetic content is published for informational purposes and should not be treated as legal, medical, or investment advice.",
  },
  {
    route: "/editorial",
    title: "Editorial Policy - Prophetic",
    description: "Read the editorial standards and AI disclosure for Prophetic.",
    heading: "Editorial Policy",
    content:
      "Prophetic publishes AI-assisted predictions with human oversight. We aim for accuracy, transparency, and clear sourcing.",
  },
  {
    route: "/ai-policy",
    title: "AI Content Policy - Prophetic",
    description: "How Prophetic uses AI systems to generate predictions and analysis.",
    heading: "AI Content Policy",
    content:
      "Prophetic uses AI systems to draft predictions and analyze trends. We apply automated quality checks and publish only when content meets minimum length, structure, and clarity requirements.",
  },
  {
    route: "/topics",
    title: "Top Topics - Prophetic",
    description: "Evergreen guides and topical hubs across AI predictions, tech forecasts, and market outlook.",
    heading: "Top Topics",
    content: "",
  },
  {
    route: "/guides",
    title: "Top Guides - Prophetic",
    description: "Evergreen guides and practical playbooks for AI predictions, tech forecasts, and future intelligence.",
    heading: "Top Guides",
    content: "",
  },
  {
    route: "/sitemap",
    title: "Sitemap - Prophetic",
    description: "Browse all categories and recent Prophetic predictions.",
    heading: "Sitemap",
    content: "",
  },
];

function normalizeRoute(route) {
  if (!route || route === "/") return "/";
  const cleaned = route.replace(/^\/+|\/+$/g, "");
  return `/${cleaned}/`;
}

function toAbsoluteUrl(route) {
  if (!route || route === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${normalizeRoute(route)}`;
}

function ensureDir(targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
}

function writeRouteIndex(distDir, route, html) {
  const normalized = normalizeRoute(route);

  if (normalized === "/") {
    fs.writeFileSync(path.join(distDir, "index.html"), html, "utf8");
    return;
  }

  const relativeDir = normalized.replace(/^\//, "").replace(/\/$/, "");
  const outputDir = path.join(distDir, relativeDir);
  ensureDir(outputDir);
  fs.writeFileSync(path.join(outputDir, "index.html"), html, "utf8");
}

function escapeHtml(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeXml(text = "") {
  return escapeHtml(text);
}

function stripMarkdown(markdown = "") {
  return String(markdown)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, " ")
    .replace(/\[[^\]]+\]\([^\)]+\)/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/[>*_~\-]{1,3}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getArticleBody(article) {
  const raw = article?.content || article?.meta_description || "";
  return stripMarkdown(raw);
}

function toIsoDate(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function markdownToHtml(markdown = "") {
  const blocks = markdown
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      const heading1 = block.match(/^#\s+(.+)/);
      const heading2 = block.match(/^##\s+(.+)/);
      const heading3 = block.match(/^###\s+(.+)/);

      if (heading1) return `<h2>${escapeHtml(heading1[1])}</h2>`;
      if (heading2) return `<h3>${escapeHtml(heading2[1])}</h3>`;
      if (heading3) return `<h4>${escapeHtml(heading3[1])}</h4>`;

      const listLines = block.split("\n").filter((line) => line.trim().length > 0);
      if (listLines.length > 1 && listLines.every((line) => /^[-*]\s+/.test(line))) {
        const items = listLines
          .map((line) => `<li>${escapeHtml(line.replace(/^[-*]\s+/, ""))}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }

      return `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");
}

function normalizeDescription(description = "", minLength = 110, maxLength = 155) {
  const clean = stripMarkdown(description) || `Latest updates from ${SITE_NAME}.`;

  if (clean.length < minLength) {
    const suffix = ` Read the full analysis on ${SITE_NAME}.`;
    return (clean + suffix).slice(0, maxLength);
  }

  if (clean.length > maxLength) {
    return `${clean.slice(0, maxLength - 1).trim()}…`;
  }

  return clean;
}

function formatPageTitle(title = "", maxLength = 60) {
  const suffix = ` | ${SITE_NAME}`;
  const clean = stripMarkdown(title).replace(/\s+/g, " ").trim() || SITE_NAME;
  const allowed = Math.max(20, maxLength - suffix.length);
  const trimmed = clean.length > allowed ? `${clean.slice(0, allowed - 1).trim()}…` : clean;
  return `${trimmed}${suffix}`;
}

function baseHead({
  title,
  description,
  canonical,
  image = DEFAULT_IMAGE,
  type = "website",
  publishedTime = null,
  modifiedTime = null,
  category = null,
  keywords = null,
}) {
  const keywordsTag = keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : "";
  const articleTags = type === "article" ? `
  <meta property="article:published_time" content="${publishedTime || ""}" />
  <meta property="article:modified_time" content="${modifiedTime || publishedTime || ""}" />
  ${category ? `<meta property="article:section" content="${escapeHtml(category)}" />` : ""}
  <meta property="article:author" content="Prophetic Editorial Team" />` : "";

  return `
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <meta name="author" content="Prophetic Editorial Team" />
  <meta name="language" content="en" />
  <meta name="revisit-after" content="1 days" />
  <meta name="rating" content="general" />
  <meta name="distribution" content="global" />
  <link rel="canonical" href="${canonical}" />
  <link rel="alternate" hreflang="en" href="${canonical}" />
  <link rel="alternate" hreflang="x-default" href="${canonical}" />
  ${keywordsTag}

  <meta property="og:type" content="${type}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:locale" content="en_US" />
  ${articleTags}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@PropheticAI" />
  <meta name="twitter:creator" content="@PropheticAI" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:image:alt" content="${escapeHtml(title)}" />

  <link rel="alternate" type="application/rss+xml" title="${SITE_NAME} RSS Feed" href="${SITE_URL}/rss.xml" />
  <link rel="alternate" type="application/atom+xml" title="${SITE_NAME} Atom Feed" href="${SITE_URL}/atom.xml" />

  <meta name="google-site-verification" content="LinTLA24lUQNkp3-Jnmx63UIro3uY1tF8Y9fN-XMrmk" />
  <meta name="msvalidate.01" content="DF3557B334AD60DC263293F8F0967114" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" href="/icon-192.png" />
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#0a0f1e" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
  <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
  `;
}

function shellTemplate({ head, heading, body }) {
  const navLinks = [
    { href: `${SITE_URL}/`, label: "Home" },
    ...categories.map((category) => ({
      href: toAbsoluteUrl(`/category/${category}`),
      label: category,
    })),
    { href: `${SITE_URL}/about/`, label: "About" },
    { href: `${SITE_URL}/contact/`, label: "Contact" },
    { href: `${SITE_URL}/sitemap/`, label: "Sitemap" },
    { href: `${SITE_URL}/topics/`, label: "Top Topics" },
    { href: `${SITE_URL}/guides/`, label: "Top Guides" },
  ]
    .map((item) => `<a href="${item.href}">${item.label}</a>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
${head}
<style>
  body {
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #0a0f1e;
    color: #f1f5f9;
    line-height: 1.7;
  }
  .wrap {
    width: min(920px, 92vw);
    margin: 0 auto;
  }
  .page-wrap {
    padding: 2rem 0 4rem;
  }
  .site-header {
    position: sticky;
    top: 0;
    z-index: 10;
    backdrop-filter: blur(16px);
    background: rgba(10, 15, 30, 0.92);
    border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  }
  .site-header__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: .85rem 0;
  }
  .brand {
    color: #f1f5f9;
    font-size: 1.3rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }
  .nav {
    display: flex;
    flex-wrap: wrap;
    gap: .5rem;
  }
  .nav a {
    border: 1px solid rgba(148, 163, 184, 0.14);
    border-radius: 6px;
    padding: .4rem .75rem;
    font-size: .88rem;
    color: #94a3b8;
    background: rgba(17, 24, 39, 0.6);
    transition: color .15s;
  }
  .nav a:hover { color: #f1f5f9; text-decoration: none; }
  a { color: #60a5fa; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .breadcrumbs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: .45rem;
    color: #94a3b8;
    font-size: .88rem;
    margin-bottom: 1rem;
  }
  .breadcrumbs span:last-child {
    color: #cbd5e1;
  }
  .tag {
    display: inline-block;
    background: rgba(59, 130, 246, 0.12);
    color: #60a5fa;
    font-size: .78rem;
    font-weight: 600;
    padding: .3rem .65rem;
    border-radius: 999px;
    border: 1px solid rgba(59, 130, 246, 0.2);
    margin-bottom: 1rem;
  }
  h1, h2, h3, h4 { font-family: 'Inter', -apple-system, sans-serif; font-weight: 700; letter-spacing: -0.02em; color: #f1f5f9; }
  h1 { font-size: clamp(1.8rem, 3.8vw, 2.6rem); line-height: 1.2; margin: 0 0 1rem; }
  h2 { margin-top: 2rem; font-size: 1.35rem; }
  h3 { margin-top: 1.3rem; font-size: 1.15rem; }
  p, li { color: #cbd5e1; }
  .meta { color: #64748b; font-size: .9rem; margin-bottom: 1.4rem; }
  .hero-image {
    width: 100%;
    max-height: 480px;
    object-fit: cover;
    border-radius: 10px;
    margin: 1rem 0 1.6rem;
  }
  .home-link {
    display: inline-flex;
    margin-top: 2.2rem;
    background: #111827;
    border: 1px solid rgba(148, 163, 184, 0.14);
    padding: .65rem 1rem;
    border-radius: 6px;
    font-weight: 600;
    font-size: .9rem;
    color: #60a5fa;
  }
  .home-link:hover { text-decoration: none; background: #1e293b; }
  .related-links {
    margin-top: 2.4rem;
    padding: 1.25rem;
    border-radius: 8px;
    border: 1px solid rgba(148, 163, 184, 0.12);
    background: rgba(17, 24, 39, 0.5);
  }
  .related-links h2 {
    margin-top: 0;
    margin-bottom: .8rem;
    font-size: 1.1rem;
  }
  .related-links ul {
    margin: 0;
    padding-left: 1.25rem;
  }
  .site-footer {
    border-top: 1px solid rgba(148, 163, 184, 0.12);
    padding: 2rem 0 3rem;
    color: #64748b;
    font-size: .88rem;
  }
  .footer-links {
    display: flex;
    flex-wrap: wrap;
    gap: .6rem 1.2rem;
    margin: 0 0 1rem;
  }
  .footer-links a {
    color: #94a3b8;
  }
  .footer-links a:hover { color: #60a5fa; text-decoration: none; }
  @media (max-width: 720px) {
    .site-header__inner {
      align-items: flex-start;
      flex-direction: column;
    }
  }
</style>
</head>
<body>
  <header class="site-header">
    <div class="wrap site-header__inner">
      <a class="brand" href="${SITE_URL}/">Prophetic</a>
      <nav class="nav" aria-label="Main navigation">
        ${navLinks}
      </nav>
    </div>
  </header>
  <main class="wrap page-wrap">
    <h1>${heading}</h1>
    ${body}
    <a class="home-link" href="${SITE_URL}/">← Back to homepage</a>
  </main>
  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-links">
        <a href="${SITE_URL}/about/">About</a>
        <a href="${SITE_URL}/contact/">Contact</a>
        <a href="${SITE_URL}/privacy/">Privacy</a>
        <a href="${SITE_URL}/terms/">Terms</a>
        <a href="${SITE_URL}/disclaimer/">Disclaimer</a>
        <a href="${SITE_URL}/editorial/">Editorial Policy</a>
        <a href="${SITE_URL}/ai-policy/">AI Policy</a>
        <a href="${SITE_URL}/sitemap/">Sitemap</a>
        <a href="${SITE_URL}/topics/">Top Topics</a>
        <a href="${SITE_URL}/guides/">Top Guides</a>
        <a href="${SITE_URL}/rss.xml">RSS</a>
      </div>
      <div>© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</div>
    </div>
  </footer>
</body>
</html>`;
}

function generateArticleSchema(article, articleUrl) {
  const articleBody = getArticleBody(article);
  const wordCount = articleBody ? articleBody.split(/\s+/).length : undefined;
  const keywords = extractKeywords(article);
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${articleUrl}#article`,
    headline: article.title,
    alternativeHeadline: normalizeDescription(article.meta_description).slice(0, 110),
    description: normalizeDescription(article.meta_description),
    image: {
      "@type": "ImageObject",
      url: article.image_url || DEFAULT_IMAGE,
      width: 1200,
      height: 630,
    },
    datePublished: toIsoDate(article.created_at || article.updated_at),
    dateModified: toIsoDate(article.updated_at || article.created_at),
    articleBody: articleBody ? articleBody.slice(0, 5000) : undefined,
    wordCount: wordCount || undefined,
    keywords: keywords.length > 0 ? keywords.join(", ") : undefined,
    inLanguage: "en-US",
    author: {
      "@type": "Person",
      name: "Prophetic Editorial Team",
      url: `${SITE_URL}/about/`,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.svg`,
        width: 200,
        height: 60,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    articleSection: article.category,
    isAccessibleForFree: true,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

// Extract keywords from article title and description
function extractKeywords(article) {
  const stopWords = new Set(["the", "a", "an", "is", "are", "was", "were", "in", "on", "at", "to", "for", "of", "with", "and", "or", "but", "not", "this", "that", "it", "its", "by", "from", "as", "be", "has", "have", "had", "will", "would", "can", "could", "may", "might", "do", "does", "did", "how", "what", "why", "when", "where", "who", "which", "new"]);
  const text = `${article.title} ${article.meta_description || ""}`;
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
  const unique = [...new Set(words)].filter(w => w.length > 3 && !stopWords.has(w));
  return unique.slice(0, 10);
}

// Generate FAQ Schema from article content headings
function generateFAQSchema(article) {
  const content = article.content || "";
  const headingRegex = /^##\s+(.+)$/gm;
  const faqs = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null && faqs.length < 5) {
    const question = match[1].trim();
    // Get paragraph after heading
    const afterHeading = content.slice(match.index + match[0].length).trim();
    const nextSection = afterHeading.split(/^##\s/m)[0].trim();
    const answer = nextSection.replace(/[#*_\[\]]/g, "").split("\n").filter(l => l.trim()).slice(0, 3).join(" ").slice(0, 300);
    if (question.length > 10 && answer.length > 30) {
      // Convert heading to question format if not already
      const q = question.endsWith("?") ? question : `What about ${question}?`;
      faqs.push({ q, a: answer });
    }
  }
  if (faqs.length < 2) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

function generateBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function generateArticleHtml(article, relatedArticles = []) {
  const articleUrl = toAbsoluteUrl(`/article/${article.slug}`);
  const categoryUrl = toAbsoluteUrl(`/category/${article.category}`);
  const title = formatPageTitle(article.title);
  const description = normalizeDescription(article.meta_description);
  const imageUrl = article.image_url || DEFAULT_IMAGE;
  const keywords = extractKeywords(article);
  const articleBody = getArticleBody(article);
  const wordCount = articleBody ? articleBody.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 250));

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: `${SITE_URL}/` },
    { name: article.category, url: categoryUrl },
    { name: article.title, url: articleUrl },
  ]);
  const faqSchema = generateFAQSchema(article);

  // Related articles: 4 same category + 2 different category for cross-linking
  const sameCat = relatedArticles.filter(r => r.category === article.category).slice(0, 4);
  const diffCat = relatedArticles.filter(r => r.category !== article.category).slice(0, 2);
  const allRelated = [...sameCat, ...diffCat];

  const relatedLinks = allRelated
    .map(
      (relatedArticle) =>
        `<li><a href="${toAbsoluteUrl(`/article/${relatedArticle.slug}`)}">${escapeHtml(relatedArticle.title)}</a> <span class="tag" style="font-size:.7rem;padding:.15rem .4rem">${escapeHtml(relatedArticle.category)}</span></li>`,
    )
    .join("");

  const head = `${baseHead({
    title,
    description,
    canonical: articleUrl,
    image: imageUrl,
    type: "article",
    publishedTime: article.created_at,
    modifiedTime: article.updated_at,
    category: article.category,
    keywords: keywords.join(", "),
  })}
  <script type="application/ld+json">${JSON.stringify(
    generateArticleSchema(article, articleUrl),
  )}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  ${faqSchema ? `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>` : ""}`;

  const body = `
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="${SITE_URL}/">Home</a>
      <span>›</span>
      <a href="${categoryUrl}">${escapeHtml(article.category)}</a>
      <span>›</span>
      <span>${escapeHtml(article.title)}</span>
    </nav>
    <a class="tag" href="${categoryUrl}">${escapeHtml(article.category)}</a>
    <p class="meta">
      <time datetime="${article.created_at}">${new Date(article.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}</time>
      • ${readTime} min read
      • ${wordCount.toLocaleString()} words
      • Updated: <time datetime="${article.updated_at || article.created_at}">${new Date(article.updated_at || article.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}</time>
    </p>
    <img class="hero-image" src="${imageUrl}" alt="${escapeHtml(article.title)}" loading="eager" width="1200" height="675" fetchpriority="high" />
    ${markdownToHtml(article.content || article.meta_description || "")}
    ${relatedLinks ? `<section class="related-links"><h2>Related Coverage</h2><ul>${relatedLinks}</ul></section>` : ""}
    <section class="related-links" style="margin-top:1.2rem">
      <h2>Explore More</h2>
      <p style="margin:0"><a href="${categoryUrl}">All ${escapeHtml(article.category)} Articles</a> · <a href="${SITE_URL}/topics/">Top Topics</a> · <a href="${SITE_URL}/guides/">Guides</a> · <a href="${SITE_URL}/sitemap/">Full Sitemap</a></p>
    </section>
  `;

  return shellTemplate({
    head,
    heading: escapeHtml(article.title),
    body,
  });
}

function generateCategoryHtml(category, categoryArticles) {
  const url = toAbsoluteUrl(`/category/${category}`);
  const description = `Latest ${category} news, analysis, and updates from ${SITE_NAME}.`;

  const head = baseHead({
    title: `${category} News | ${SITE_NAME}`,
    description,
    canonical: url,
  });

  const articleLinks = categoryArticles
    .slice(0, 40)
    .map(
      (article) =>
        `<li><a href="${toAbsoluteUrl(`/article/${article.slug}`)}">${escapeHtml(article.title)}</a></li>`,
    )
    .join("\n");

  const body = `
    <p class="meta">Fresh coverage in ${escapeHtml(category)} with continuously updated stories.</p>
    <ul>${articleLinks || "<li>No articles yet.</li>"}</ul>
  `;

  return shellTemplate({
    head,
    heading: `${escapeHtml(category)} News`,
    body,
  });
}

function generateStaticPageHtml(page) {
  const url = toAbsoluteUrl(page.route);
  const head = baseHead({
    title: page.title,
    description: page.description,
    canonical: url,
  });

  const body = `<p>${escapeHtml(page.content)}</p>`;

  return shellTemplate({
    head,
    heading: escapeHtml(page.heading),
    body,
  });
}

function generateSitemapHtml(articles) {
  const url = toAbsoluteUrl("/sitemap");
  const head = baseHead({
    title: `Sitemap | ${SITE_NAME}`,
    description: "Browse categories and the latest predictions from Prophetic.",
    canonical: url,
  });

  const categoryLinks = categories
    .map(
      (category) =>
        `<li><a href="${toAbsoluteUrl(`/category/${category}`)}">${escapeHtml(category)}</a></li>`,
    )
    .join("\n");

  const latestArticles = [...articles]
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
    .slice(0, 200)
    .map(
      (article) =>
        `<li><a href="${toAbsoluteUrl(`/article/${article.slug}`)}">${escapeHtml(article.title)}</a></li>`,
    )
    .join("\n");

  const body = `
    <p class="meta">Use this page to quickly find categories and recent coverage.</p>
    <h2>Categories</h2>
    <ul>${categoryLinks}</ul>
    <h2>Latest Articles</h2>
    <ul>${latestArticles || "<li>No articles yet.</li>"}</ul>
  `;

  return shellTemplate({
    head,
    heading: "Sitemap",
    body,
  });
}

function generateTopicsHtml(articles) {
  const url = toAbsoluteUrl("/topics");
  const head = baseHead({
    title: `Top Topics | ${SITE_NAME}`,
    description: "Evergreen topic hubs and practical guides across AI, tech, business, and science.",
    canonical: url,
  });

  const topicGroups = [
    {
      title: "AI & Automation",
      links: [
        { label: "AI News", href: toAbsoluteUrl("/category/AI") },
        { label: "Responsible AI", href: toAbsoluteUrl("/ai-policy") },
      ],
    },
    {
      title: "Tech & Innovation",
      links: [
        { label: "Tech News", href: toAbsoluteUrl("/category/Tech") },
        { label: "Startup Strategy", href: toAbsoluteUrl("/category/Business") },
      ],
    },
    {
      title: "Science & Discovery",
      links: [
        { label: "Science News", href: toAbsoluteUrl("/category/Science") },
        { label: "Latest Research Highlights", href: toAbsoluteUrl("/sitemap") },
      ],
    },
  ];

  const latestArticles = [...articles]
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
    .slice(0, 120)
    .map(
      (article) =>
        `<li><a href="${toAbsoluteUrl(`/article/${article.slug}`)}">${escapeHtml(article.title)}</a></li>`,
    )
    .join("\n");

  const topicHtml = topicGroups
    .map(
      (group) => `
      <h2>${escapeHtml(group.title)}</h2>
      <ul>
        ${group.links.map((link) => `<li><a href="${link.href}">${escapeHtml(link.label)}</a></li>`).join("\n")}
      </ul>
    `,
    )
    .join("\n");

  const body = `
    <p class="meta">Evergreen hubs and curated entry points to our most important coverage.</p>
    ${topicHtml}
    <h2>Latest Articles</h2>
    <ul>${latestArticles || "<li>No articles yet.</li>"}</ul>
  `;

  return shellTemplate({
    head,
    heading: "Top Topics",
    body,
  });
}

function generateGuidesHtml(articles) {
  const url = toAbsoluteUrl("/guides");
  const head = baseHead({
    title: `Top Guides | ${SITE_NAME}`,
    description: "Evergreen guides and practical playbooks to help you navigate AI, tech, business, and science.",
    canonical: url,
  });

  const updatedDate = new Date().toISOString().split("T")[0];

  const sections = [
    {
      title: "AI in 2026: A Practical Reader's Guide",
      points: [
        "What AI can and cannot do in everyday workflows",
        "How to evaluate AI tools without hype",
        "Safety, bias, and transparency basics",
        "A simple checklist for adopting AI responsibly",
      ],
      links: [
        { label: "AI News & Analysis", href: toAbsoluteUrl("/category/AI") },
        { label: "AI Policy & Transparency", href: toAbsoluteUrl("/ai-policy") },
      ],
    },
    {
      title: "Tech Strategy: Build, Buy, or Wait",
      points: [
        "When to build in-house vs. use a platform",
        "How to estimate true total cost of ownership",
        "Vendor risk and exit planning",
        "Tech stacks that scale with lean teams",
      ],
      links: [
        { label: "Tech Coverage", href: toAbsoluteUrl("/category/Tech") },
        { label: "Business Trends", href: toAbsoluteUrl("/category/Business") },
      ],
    },
    {
      title: "Science Literacy for Non-Scientists",
      points: [
        "How to read a study quickly and correctly",
        "What makes results trustworthy",
        "Red flags: overclaiming and weak evidence",
        "How to follow breakthroughs without misinformation",
      ],
      links: [
        { label: "Science Coverage", href: toAbsoluteUrl("/category/Science") },
        { label: "Latest Articles", href: toAbsoluteUrl("/sitemap") },
      ],
    },
  ];

  const sectionHtml = sections
    .map(
      (section) => `
      <section>
        <h2>${escapeHtml(section.title)}</h2>
        <ul>
          ${section.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("\n")}
        </ul>
        <p>
          ${section.links
            .map((link) => `<a href="${link.href}">${escapeHtml(link.label)}</a>`)
            .join(" | ")}
        </p>
      </section>
    `,
    )
    .join("\n");

  const latestArticles = [...articles]
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
    .slice(0, 80)
    .map(
      (article) =>
        `<li><a href="${toAbsoluteUrl(`/article/${article.slug}`)}">${escapeHtml(article.title)}</a></li>`,
    )
    .join("\n");

  const body = `
    <p class="meta">Last updated: ${updatedDate} • Publishing schedule: 2 articles daily.</p>
    <p>These evergreen guides explain the core ideas, frameworks, and decisions readers face as AI, technology, business, and science evolve. Use them as reference points, then explore the latest coverage.</p>
    ${sectionHtml}
    <h2>Latest Articles</h2>
    <ul>${latestArticles || "<li>No articles yet.</li>"}</ul>
  `;

  return shellTemplate({
    head,
    heading: "Top Guides",
    body,
  });
}

function renderSitemapUrl(loc, lastmod = null, changefreq = null, priority = null) {
  let xml = `  <url>\n    <loc>${escapeXml(loc)}</loc>`;
  if (lastmod) xml += `\n    <lastmod>${lastmod}</lastmod>`;
  if (changefreq) xml += `\n    <changefreq>${changefreq}</changefreq>`;
  if (priority) xml += `\n    <priority>${priority}</priority>`;
  xml += `\n  </url>`;
  return xml;
}

function generateSitemapXml(articles) {
  const now = new Date().toISOString().split("T")[0];
  const staticEntries = [
    renderSitemapUrl(toAbsoluteUrl("/"), now, "hourly", "1.0"),
    ...categories.map((category) => renderSitemapUrl(toAbsoluteUrl(`/category/${category}`), now, "daily", "0.9")),
    ...staticPages.map((page) => renderSitemapUrl(toAbsoluteUrl(page.route), now, "monthly", "0.7")),
  ];
  const articleEntries = articles.map((article) => {
    const lastmod = (article.updated_at || article.created_at || "").split("T")[0] || now;
    return renderSitemapUrl(toAbsoluteUrl(`/article/${article.slug}`), lastmod, "weekly", "0.8");
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...articleEntries].join("\n")}
</urlset>`;
}

// Flat sitemap (all URLs in one file) — kept as backup/fallback
function generateSitemapXmlFlat(articles) {
  return generateSitemapXml(articles);
}

// Paginated sitemaps: split articles into chunks of 200 for Google compatibility
function generatePaginatedSitemaps(articles, chunkSize = 200) {
  const now = new Date().toISOString().split("T")[0];
  const sitemaps = [];
  for (let i = 0; i < articles.length; i += chunkSize) {
    const chunk = articles.slice(i, i + chunkSize);
    const entries = chunk.map((article) => {
      const lastmod = (article.updated_at || article.created_at || "").split("T")[0] || now;
      return renderSitemapUrl(toAbsoluteUrl(`/article/${article.slug}`), lastmod, "weekly", "0.8");
    });
    sitemaps.push(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`);
  }
  return sitemaps;
}

function generateArticlesSitemapXml(articles) {
  const now = new Date().toISOString().split("T")[0];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${articles.map((article) => {
    const lastmod = (article.updated_at || article.created_at || "").split("T")[0] || now;
    return renderSitemapUrl(toAbsoluteUrl(`/article/${article.slug}`), lastmod, "weekly", "0.8");
  }).join("\n")}
</urlset>`;
}

function generateStaticSitemapXml() {
  const urls = [
    `${SITE_URL}/`,
    ...categories.map((category) => toAbsoluteUrl(`/category/${category}`)),
    ...staticPages.map((page) => toAbsoluteUrl(page.route)),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(renderSitemapUrl).join("\n")}
</urlset>`;
}

function generateSitemapIndexXml(now, articleChunkCount = 1) {
  let chunks = "";
  for (let i = 0; i < articleChunkCount; i++) {
    const suffix = articleChunkCount > 1 ? `-${i + 1}` : "";
    chunks += `  <sitemap>
    <loc>${SITE_URL}/sitemap-articles${suffix}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>\n`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-static.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
${chunks}  <sitemap>
    <loc>${SITE_URL}/sitemap-news.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;
}

function generateSitemapTxt(articles) {
  const urls = [
    toAbsoluteUrl("/"),
    ...categories.map((category) => toAbsoluteUrl(`/category/${category}`)),
    ...staticPages.map((page) => toAbsoluteUrl(page.route)),
    ...articles.map((article) => toAbsoluteUrl(`/article/${article.slug}`)),
  ];

  return urls.join("\n");
}

function escapeCData(input = "") {
  return String(input).replace(/\]\]>/g, "]]]]><![CDATA[>");
}

function generateRssXml(articles) {
  const latest = articles.slice(0, 60);
  const lastBuildDate = new Date().toUTCString();

  const items = latest
    .map((article) => {
      const url = toAbsoluteUrl(`/article/${article.slug}`);
      const pubDate = new Date(article.created_at || article.updated_at || Date.now()).toUTCString();
      const description = normalizeDescription(article.meta_description);
      return `<item>
      <title>${escapeHtml(article.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeHtml(article.category)}</category>
      <description><![CDATA[${escapeCData(description)}]]></description>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}/</link>
    <description>Latest AI, tech, business, and science news from ${SITE_NAME}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    ${items}
  </channel>
</rss>`;
}

function generateAtomXml(articles) {
  const latest = articles.slice(0, 60);
  const updated = new Date().toISOString();

  const entries = latest
    .map((article) => {
      const url = toAbsoluteUrl(`/article/${article.slug}`);
      const published = new Date(article.created_at || article.updated_at || Date.now()).toISOString();
      const modified = new Date(article.updated_at || article.created_at || Date.now()).toISOString();
      const description = normalizeDescription(article.meta_description);

      return `<entry>
    <title>${escapeHtml(article.title)}</title>
    <link href="${escapeXml(url)}" />
    <id>${escapeXml(url)}</id>
    <published>${published}</published>
    <updated>${modified}</updated>
    <category term="${escapeHtml(article.category)}" />
    <summary type="html"><![CDATA[${escapeCData(description)}]]></summary>
  </entry>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${SITE_NAME}</title>
  <subtitle>Latest AI, tech, business, and science coverage</subtitle>
  <link href="${SITE_URL}/atom.xml" rel="self" />
  <link href="${SITE_URL}/" />
  <id>${SITE_URL}/</id>
  <updated>${updated}</updated>
  ${entries}
</feed>`;
}

function generateNewsSitemapXml(articles) {
  // Google News Sitemap only includes articles from the last 2 days
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const recentArticles = articles.filter((article) => {
    const pubDate = new Date(article.created_at || article.updated_at);
    return pubDate >= twoDaysAgo;
  });

  const entries = recentArticles.map((article) => {
    const articleUrl = toAbsoluteUrl(`/article/${article.slug}`);
    const pubDate = toIsoDate(article.created_at || article.updated_at);
    return `  <url>
    <loc>${escapeXml(articleUrl)}</loc>
    <news:news>
      <news:publication>
        <news:name>${SITE_NAME}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries.join("\n")}
</urlset>`;
}

async function main() {
  console.log("🚀 Starting static generation...\n");

  const { data: articles, error } = await supabase
    .from("articles")
    .select("id,title,slug,meta_description,content,category,image_url,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Failed to fetch articles:", error.message);
    process.exit(1);
  }

  const safeArticles = Array.isArray(articles) ? articles : [];
  console.log(`✅ Loaded ${safeArticles.length} article(s)\n`);

  const distDir = path.join(__dirname, "..", "dist");
  ensureDir(distDir);

  console.log("📝 Generating article pages...");
  for (const article of safeArticles) {
    // Pass ALL other articles for cross-category internal linking
    const relatedArticles = safeArticles.filter(
      (candidate) => candidate.slug !== article.slug,
    );
    writeRouteIndex(distDir, `/article/${article.slug}`, generateArticleHtml(article, relatedArticles));
    console.log(`  ✓ /article/${article.slug}/`);
  }

  console.log("\n📝 Generating category pages...");
  for (const category of categories) {
    const categoryArticles = safeArticles.filter((article) => article.category === category);
    writeRouteIndex(distDir, `/category/${category}`, generateCategoryHtml(category, categoryArticles));
    console.log(`  ✓ /category/${category}/`);
  }

  console.log("\n📝 Generating static pages...");
  for (const page of staticPages) {
    writeRouteIndex(distDir, page.route, generateStaticPageHtml(page));
    console.log(`  ✓ ${normalizeRoute(page.route)}`);
  }

  console.log("\n📝 Generating HTML sitemap page...");
  writeRouteIndex(distDir, "/sitemap", generateSitemapHtml(safeArticles));
  console.log("  ✓ /sitemap/");

  console.log("\n📝 Generating Top Topics page...");
  writeRouteIndex(distDir, "/topics", generateTopicsHtml(safeArticles));
  console.log("  ✓ /topics/");

  console.log("\n📝 Generating Top Guides page...");
  writeRouteIndex(distDir, "/guides", generateGuidesHtml(safeArticles));
  console.log("  ✓ /guides/");

  const now = new Date().toISOString().split("T")[0];

  // PRIMARY: sitemap.xml — simple flat <urlset> with ALL URLs (Google-friendly)
  console.log("\n📍 Writing sitemap.xml (flat urlset)...");
  fs.writeFileSync(path.join(distDir, "sitemap.xml"), generateSitemapXml(safeArticles), "utf8");
  console.log("  ✓ /sitemap.xml");

  // sitemap.txt — plain text list of all URLs
  console.log("\n📍 Writing sitemap.txt...");
  fs.writeFileSync(path.join(distDir, "sitemap.txt"), generateSitemapTxt(safeArticles), "utf8");
  console.log("  ✓ /sitemap.txt");

  // Atom feed
  console.log("\n📍 Writing RSS + Atom feeds...");
  fs.writeFileSync(path.join(distDir, "rss.xml"), generateRssXml(safeArticles), "utf8");
  fs.writeFileSync(path.join(distDir, "atom.xml"), generateAtomXml(safeArticles), "utf8");
  console.log("  ✓ /rss.xml");
  console.log("  ✓ /atom.xml");

  // Google News Sitemap (last 2 days only)
  console.log("\n📍 Writing sitemap-news.xml...");
  fs.writeFileSync(path.join(distDir, "sitemap-news.xml"), generateNewsSitemapXml(safeArticles), "utf8");
  console.log("  ✓ /sitemap-news.xml");

  // Generate 404 page
  console.log("\n📍 Writing 404.html...");
  const notFoundHead = baseHead({
    title: "Page Not Found — Prophetic",
    description: "The page you are looking for does not exist or has been moved.",
    canonical: `${SITE_URL}/404`,
  });
  const notFoundHtml = shellTemplate({
    head: notFoundHead,
    heading: "Page Not Found",
    body: `
      <div style="text-align:center;padding:3rem 0">
        <p style="font-size:4rem;margin:0;opacity:.3">404</p>
        <p style="font-size:1.2rem;color:#94a3b8">The page you're looking for doesn't exist or has been moved.</p>
        <p style="margin-top:2rem"><a href="${SITE_URL}/" style="color:#3b82f6;text-decoration:underline">Go to Homepage</a></p>
        <section class="related-links" style="margin-top:3rem;text-align:left">
          <h2>Popular Sections</h2>
          <ul>
            ${categories.map(c => `<li><a href="${toAbsoluteUrl(`/category/${c}`)}">${c} Articles</a></li>`).join("")}
            <li><a href="${SITE_URL}/topics/">Top Topics</a></li>
            <li><a href="${SITE_URL}/guides/">Guides</a></li>
          </ul>
        </section>
      </div>
    `,
  });
  fs.writeFileSync(path.join(distDir, "404.html"), notFoundHtml, "utf8");
  console.log("  \u2713 /404.html");

  // Write canonical robots.txt
  console.log("\n📍 Writing robots.txt...");
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/

User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/atom.xml
`;
  fs.writeFileSync(path.join(distDir, "robots.txt"), robotsTxt, "utf8");
  console.log("  ✓ /robots.txt");

  console.log("\n🎉 SSG completed successfully.");
}

main().catch((err) => {
  console.error("❌ SSG failed:", err);
  process.exit(1);
});
