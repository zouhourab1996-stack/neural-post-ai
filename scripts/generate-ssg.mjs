/**
 * Static Site Generation Script for Article Pages
 * 
 * This script fetches all articles from Supabase and generates
 * physical HTML files with hardcoded SEO meta tags for each article.
 * This allows Googlebot to see content without executing JavaScript.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SITE_URL = 'https://prophetic.pw';
const SITE_NAME = 'NeuralPost';
const DEFAULT_IMAGE = 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1200';

// Get Supabase credentials from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Generate JSON-LD schema for an article
 */
function generateArticleSchema(article) {
  const articleUrl = `${SITE_URL}/article/${article.slug}/`;
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${articleUrl}#article`,
    "headline": article.title,
    "description": article.meta_description,
    "image": {
      "@type": "ImageObject",
      "url": article.image_url || DEFAULT_IMAGE,
      "width": 1200,
      "height": 630
    },
    "datePublished": article.created_at,
    "dateModified": article.updated_at,
    "author": {
      "@type": "Person",
      "name": "NeuralPost AI",
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
      "@id": articleUrl
    },
    "articleSection": article.category,
    "isAccessibleForFree": true
  };
}

/**
 * Generate breadcrumb schema for an article
 */
function generateBreadcrumbSchema(article) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${SITE_URL}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": article.category,
        "item": `${SITE_URL}/category/${article.category}/`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": `${SITE_URL}/article/${article.slug}/`
      }
    ]
  };
}

/**
 * Escape HTML entities for safe insertion
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate the static HTML template for an article
 */
function generateArticleHtml(article) {
  const articleUrl = `${SITE_URL}/article/${article.slug}/`;
  const imageUrl = article.image_url || DEFAULT_IMAGE;
  const escapedTitle = escapeHtml(article.title);
  const escapedDescription = escapeHtml(article.meta_description);
  const articleSchema = JSON.stringify(generateArticleSchema(article));
  const breadcrumbSchema = JSON.stringify(generateBreadcrumbSchema(article));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- Primary Meta Tags -->
  <title>${escapedTitle} | ${SITE_NAME}</title>
  <meta name="title" content="${escapedTitle} | ${SITE_NAME}" />
  <meta name="description" content="${escapedDescription}" />
  <meta name="author" content="NeuralPost AI" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${articleUrl}" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${articleUrl}" />
  <meta property="og:title" content="${escapedTitle}" />
  <meta property="og:description" content="${escapedDescription}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="article:published_time" content="${article.created_at}" />
  <meta property="article:modified_time" content="${article.updated_at}" />
  <meta property="article:section" content="${escapeHtml(article.category)}" />
  <meta property="article:author" content="NeuralPost AI" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${articleUrl}" />
  <meta name="twitter:title" content="${escapedTitle}" />
  <meta name="twitter:description" content="${escapedDescription}" />
  <meta name="twitter:image" content="${imageUrl}" />
  
  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  
  <!-- Google Search Console Verification -->
  <meta name="google-site-verification" content="LinTLA24lUQNkp3-Jnmx63UIro3uY1tF8Y9fN-XMrmk" />
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">${articleSchema}</script>
  <script type="application/ld+json">${breadcrumbSchema}</script>
  
  <!-- Redirect to SPA after bots have indexed -->
  <script>
    // Allow crawlers to see the static content, then redirect users to the SPA
    // This check is simple; crawlers will not execute this, users will
    if (typeof window !== 'undefined' && window.location) {
      // Small delay to ensure content is visible
      setTimeout(function() {
        window.location.replace('${SITE_URL}/#/article/${article.slug}');
      }, 100);
    }
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=${SITE_URL}/#/article/${article.slug}" />
  </noscript>
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #0a0a0a;
      color: #fafafa;
      line-height: 1.6;
    }
    .loading {
      text-align: center;
      padding: 40px;
      color: #888;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    .meta {
      color: #888;
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }
    .category {
      background: #10b981;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 0.8rem;
      text-transform: uppercase;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    .description {
      font-size: 1.1rem;
      color: #ccc;
      margin-bottom: 2rem;
    }
  </style>
</head>
<body>
  <article>
    <span class="category">${escapeHtml(article.category)}</span>
    <h1>${escapedTitle}</h1>
    <p class="meta">Published: ${new Date(article.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <img src="${imageUrl}" alt="${escapedTitle}" />
    <p class="description">${escapedDescription}</p>
    <p class="loading">Loading full article...</p>
  </article>
</body>
</html>`;
}

/**
 * Generate sitemap.xml with all articles
 */
function generateSitemap(articles) {
  const now = new Date().toISOString().split('T')[0];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Category Pages -->
  <url>
    <loc>${SITE_URL}/category/AI/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${SITE_URL}/category/Tech/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${SITE_URL}/category/Business/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${SITE_URL}/category/Science/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Static Pages -->
  <url>
    <loc>${SITE_URL}/about/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${SITE_URL}/contact/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${SITE_URL}/privacy/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <url>
    <loc>${SITE_URL}/terms/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
`;

  // Add all article URLs
  for (const article of articles) {
    const articleDate = article.updated_at ? article.updated_at.split('T')[0] : now;
    sitemap += `
  <!-- Article: ${escapeHtml(article.title)} -->
  <url>
    <loc>${SITE_URL}/article/${article.slug}/</loc>
    <lastmod>${articleDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    ${article.image_url ? `<image:image>
      <image:loc>${article.image_url}</image:loc>
      <image:title>${escapeHtml(article.title)}</image:title>
    </image:image>` : ''}
  </url>
`;
  }

  sitemap += `
</urlset>`;

  return sitemap;
}

/**
 * Main function to generate all static pages
 */
async function main() {
  console.log('🚀 Starting Static Site Generation...\n');

  // Fetch all articles from Supabase
  console.log('📡 Fetching articles from database...');
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching articles:', error.message);
    process.exit(1);
  }

  console.log(`✅ Found ${articles.length} articles\n`);

  // Create output directory
  const distDir = path.join(__dirname, '..', 'dist');
  const articleDir = path.join(distDir, 'article');
  
  // Ensure dist directory exists (might not exist if running before build)
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  if (!fs.existsSync(articleDir)) {
    fs.mkdirSync(articleDir, { recursive: true });
  }

  // Generate static HTML for each article
  console.log('📝 Generating static article pages...');
  for (const article of articles) {
    const slugDir = path.join(articleDir, article.slug);
    
    if (!fs.existsSync(slugDir)) {
      fs.mkdirSync(slugDir, { recursive: true });
    }
    
    const htmlContent = generateArticleHtml(article);
    const htmlPath = path.join(slugDir, 'index.html');
    
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log(`  ✓ /article/${article.slug}/index.html`);
  }

  // Generate updated sitemap
  console.log('\n📍 Generating sitemap.xml...');
  const sitemapContent = generateSitemap(articles);
  const sitemapPath = path.join(distDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
  console.log('  ✓ /sitemap.xml');

  console.log('\n🎉 Static Site Generation complete!');
  console.log(`   Generated ${articles.length} article pages`);
  console.log(`   Updated sitemap.xml with all URLs`);
}

main().catch((err) => {
  console.error('❌ SSG failed:', err);
  process.exit(1);
});
