import fs from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
const site = "https://prophetic.pw";
const routes = ["/", "/compare", "/about", "/contact", "/privacy", "/terms", "/disclaimer", "/review/notion", "/review/linear", "/review/hubspot", "/review/wise-business", "/review/joiin", "/review/volza"];
const now = new Date().toISOString().slice(0, 10);
const urlset = routes.map((route) => `  <url><loc>${site}${route}</loc><lastmod>${now}</lastmod><changefreq>${route.startsWith("/review/") ? "monthly" : "weekly"}</changefreq><priority>${route === "/" ? "1.0" : "0.7"}</priority></url>`).join("\n");
fs.writeFileSync(path.join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>\n`);
fs.writeFileSync(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${site}/sitemap.xml\n`);
fs.copyFileSync(path.join(dist, "index.html"), path.join(dist, "404.html"));
console.log(`Generated ${routes.length} platform routes in sitemap.xml`);
