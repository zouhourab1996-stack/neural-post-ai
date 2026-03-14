import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://prophetic.pw";
const SITE_NAME = "NeuralPost";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const categories = ["AI", "Tech", "Business", "Science"];

const staticPages = [
  { path: "/about/", priority: "0.7", freq: "monthly" },
  { path: "/contact/", priority: "0.7", freq: "monthly" },
  { path: "/privacy/", priority: "0.5", freq: "yearly" },
  { path: "/terms/", priority: "0.5", freq: "yearly" },
  { path: "/disclaimer/", priority: "0.5", freq: "yearly" },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const format = url.searchParams.get("format") || "xml";

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: articles, error } = await supabase
      .from("articles")
      .select("slug, category, updated_at, created_at, title, image_url")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const safeArticles = articles || [];
    const now = new Date().toISOString().split("T")[0];

    if (format === "txt") {
      return generateTxtSitemap(safeArticles);
    }

    if (format === "rss") {
      return generateRssFeed(safeArticles);
    }

    if (format === "atom") {
      return generateAtomFeed(safeArticles);
    }

    // Default: XML sitemap
    return generateXmlSitemap(safeArticles, now);
  } catch (error: unknown) {
    console.error("Sitemap generation error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`,
      {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          ...corsHeaders,
        },
      }
    );
  }
});

function generateXmlSitemap(articles: any[], now: string) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>`;

  for (const cat of categories) {
    xml += `
  <url>
    <loc>${SITE_URL}/category/${encodeURIComponent(cat)}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
  }

  for (const page of staticPages) {
    xml += `
  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.freq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }

  for (const article of articles) {
    const lastmod = article.updated_at
      ? article.updated_at.split("T")[0]
      : article.created_at.split("T")[0];

    const escapedTitle = escapeXml(article.title || "");

    xml += `
  <url>
    <loc>${SITE_URL}/article/${article.slug}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${
      article.image_url
        ? `
    <image:image>
      <image:loc>${escapeXml(article.image_url)}</image:loc>
      <image:title>${escapedTitle}</image:title>
    </image:image>`
        : ""
    }
  </url>`;
  }

  xml += `
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800, s-maxage=1800",
      ...corsHeaders,
    },
  });
}

function generateTxtSitemap(articles: any[]) {
  const urls = [
    `${SITE_URL}/`,
    ...categories.map((c) => `${SITE_URL}/category/${c}/`),
    ...staticPages.map((p) => `${SITE_URL}${p.path}`),
    ...articles.map((a) => `${SITE_URL}/article/${a.slug}/`),
  ];

  return new Response(urls.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=1800",
      ...corsHeaders,
    },
  });
}

function generateRssFeed(articles: any[]) {
  const latest = articles.slice(0, 50);
  const lastBuildDate = new Date().toUTCString();

  const items = latest
    .map((a) => {
      const url = `${SITE_URL}/article/${a.slug}/`;
      const pubDate = new Date(a.created_at).toUTCString();
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(a.category)}</category>
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}/</link>
    <description>Latest AI, tech, business, and science news</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800",
      ...corsHeaders,
    },
  });
}

function generateAtomFeed(articles: any[]) {
  const latest = articles.slice(0, 50);
  const updated = new Date().toISOString();

  const entries = latest
    .map((a) => {
      const url = `${SITE_URL}/article/${a.slug}/`;
      const published = new Date(a.created_at).toISOString();
      const modified = new Date(a.updated_at || a.created_at).toISOString();
      return `  <entry>
    <title>${escapeXml(a.title)}</title>
    <link href="${url}"/>
    <id>${url}</id>
    <published>${published}</published>
    <updated>${modified}</updated>
    <category term="${escapeXml(a.category)}"/>
  </entry>`;
    })
    .join("\n");

  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${SITE_NAME}</title>
  <subtitle>Latest AI, tech, business, and science coverage</subtitle>
  <link href="${SITE_URL}/atom.xml" rel="self"/>
  <link href="${SITE_URL}/"/>
  <id>${SITE_URL}/</id>
  <updated>${updated}</updated>
${entries}
</feed>`;

  return new Response(atom, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800",
      ...corsHeaders,
    },
  });
}
