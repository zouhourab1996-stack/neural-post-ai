import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, published_at, updated_at')
      .order('published_at', { ascending: false });

    const base  = 'https://prophetic.pw';
    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${base}/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${base}/category/ai-predictions</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${base}/category/tech-forecasts</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${base}/category/market-outlook</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${base}/category/world-events</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${base}/category/science-innovation</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${base}/category/crypto-finance</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${base}/category/future-of-work</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${base}/about</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>${base}/privacy</loc><lastmod>${today}</lastmod><changefreq>yearly</changefreq><priority>0.4</priority></url>`;

    articles?.forEach(a => {
      const lastmod = a.updated_at
        ? new Date(a.updated_at).toISOString().split('T')[0]
        : new Date(a.published_at).toISOString().split('T')[0];
      xml += `
  <url>
    <loc>${base}/article/${a.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += '\n</urlset>';

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(xml);
  } catch (err) {
    res.setHeader('Content-Type', 'application/xml');
    return res.status(500).send('<?xml version="1.0"?><e>error</e>');
  }
}