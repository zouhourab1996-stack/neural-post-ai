import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const ago48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, title, published_at, category')
      .gte('published_at', ago48h)
      .order('published_at', { ascending: false });

    const base = 'https://prophetic.pw';
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;

    articles?.forEach(a => {
      xml += `
  <url>
    <loc>${base}/article/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Prophetic</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(a.published_at).toISOString()}</news:publication_date>
      <news:title><![CDATA[${a.title}]]></news:title>
      <news:keywords>${a.category}</news:keywords>
    </news:news>
  </url>`;
    });

    xml += '\n</urlset>';
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=1800');
    return res.status(200).send(xml);
  } catch {
    res.setHeader('Content-Type', 'application/xml');
    return res.status(500).send('<?xml version="1.0"?><e>error</e>');
  }
}