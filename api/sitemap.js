
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://prophetic.pw/</loc><priority>1.0</priority><lastmod>2024-05-20</lastmod></url>
  <url><loc>https://prophetic.pw/category/AI/</loc><priority>0.8</priority><lastmod>2024-05-20</lastmod></url>
  <url><loc>https://prophetic.pw/category/Tech/</loc><priority>0.8</priority><lastmod>2024-05-20</lastmod></url>
  <url><loc>https://prophetic.pw/about/</loc><priority>0.5</priority></url>
  <url><loc>https://prophetic.pw/privacy/</loc><priority>0.5</priority></url>
</urlset>`;

  res.status(200).send(sitemap);
}
