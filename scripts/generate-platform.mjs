import fs from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
const site = "https://prophetic.pw";
const routes = [
  "/",
  "/compare",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/disclaimer",
  "/review/notion",
  "/review/linear",
  "/review/hubspot",
  "/review/wise-business",
  "/review/joiin",
  "/review/volza",
  "/review/parallel-ai",
  "/review/ahaslides",
  "/review/salestarget-ai",
  "/review/babylovegrowth",
  "/review/woodpecker",
  "/review/reditus",
];
const now = new Date().toISOString().slice(0, 10);
const index = path.join(dist, "index.html");

const urlset = routes
  .map(
    (route) =>
      `  <url><loc>${site}${route}</loc><lastmod>${now}</lastmod><changefreq>${route.startsWith("/review/") ? "monthly" : "weekly"}</changefreq><priority>${route === "/" ? "1.0" : "0.7"}</priority></url>`,
  )
  .join("\n");

fs.writeFileSync(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>\n`,
);

fs.writeFileSync(
  path.join(dist, "robots.txt"),
  `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${site}/sitemap.xml\n`,
);

// GitHub Pages has no rewrite rules. Create real 200-serving entry points for
// every public SPA route so direct requests and Googlebot do not receive 404.
for (const route of routes.filter(Boolean)) {
  const routeDir = path.join(dist, route.slice(1));
  fs.mkdirSync(routeDir, { recursive: true });
  const routeIndex = path.join(routeDir, "index.html");
  let routeHtml = fs.readFileSync(index, "utf8");
  const monetizationScripts = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3898992716389443" crossorigin="anonymous"></script><script async src="https://www.googletagmanager.com/gtag/js?id=G-1W7PC1JDKH"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}gtag("js",new Date());gtag("config","G-1W7PC1JDKH");</script>';
  routeHtml = routeHtml.replace("</head>", `${monetizationScripts}</head>`);
  fs.writeFileSync(routeIndex, routeHtml);
}

// Keep the browser fallback for unknown routes. Known public routes above are
// served as normal 200 responses by their generated route/index.html files.
fs.copyFileSync(index, path.join(dist, "404.html"));
console.log(`Generated ${routes.length} platform routes, route entry points, and 404.html`);
