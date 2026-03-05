import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://prophetic.pw";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: articles, error } = await supabase
      .from("articles")
      .select("slug, category, updated_at, created_at, title, image_url")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const now = new Date().toISOString().split("T")[0];

    const categories = [...new Set((articles || []).map((a: { category: string }) => a.category))];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

    // Category pages
    for (const cat of categories) {
      xml += `
  <url>
    <loc>${SITE_URL}/category/${encodeURIComponent(cat)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
    }

    // Static pages
    const staticPages = [
      { path: "/about", priority: "0.7", freq: "monthly" },
      { path: "/contact", priority: "0.7", freq: "monthly" },
      { path: "/privacy", priority: "0.5", freq: "yearly" },
      { path: "/terms", priority: "0.5", freq: "yearly" },
      { path: "/disclaimer", priority: "0.5", freq: "yearly" },
    ];

    for (const page of staticPages) {
      xml += `
  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.freq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    }

    // Article pages
    for (const article of articles || []) {
      const lastmod = article.updated_at
        ? article.updated_at.split("T")[0]
        : article.created_at.split("T")[0];
      
      const escapedTitle = (article.title || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

      xml += `
  <url>
    <loc>${SITE_URL}/article/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${
      article.image_url
        ? `
    <image:image>
      <image:loc>${article.image_url.replace(/&/g, "&amp;")}</image:loc>
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
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        ...corsHeaders,
      },
    });
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
