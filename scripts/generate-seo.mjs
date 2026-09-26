import fs from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
const SITE = "https://prophetic.pw";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_KEY;

const staticPages = [
  ["/", "Prophetic — Independent Software & Business Reviews", "Clear, independent reviews of software, financial products, and digital tools for modern business."],
  ["/compare/", "Compare Business Tools | Prophetic", "Compare software, finance, marketing, and developer tools with clear, independent analysis."],
  ["/about/", "About Prophetic", "Learn about Prophetic's editorial mission, research standards, and independent reviews."],
  ["/contact/", "Contact Prophetic", "Contact the Prophetic editorial team."],
  ["/privacy/", "Privacy Policy | Prophetic", "Prophetic's privacy policy and data practices."],
  ["/terms/", "Terms of Service | Prophetic", "Terms of service for the Prophetic website."],
  ["/disclaimer/", "Disclaimer | Prophetic", "Disclosures about editorial content, affiliate relationships, and AI-assisted publishing."],
  ["/editorial/", "Editorial Policy | Prophetic", "Prophetic's editorial standards, sourcing practices, corrections policy, and independence principles."],
  ["/ai-policy/", "AI Content Policy | Prophetic", "How Prophetic uses AI-assisted tools in research and content production."],
  ["/sitemap/", "HTML Sitemap | Prophetic", "Browse public pages and articles published by Prophetic."],
  ["/topics/", "Topics | Prophetic", "Browse Prophetic topics across AI, technology, business, science, and world news."],
  ["/guides/", "Guides | Prophetic", "Browse practical guides and explainers from Prophetic."]
];

const reviewPages = [
  ["/review/notion/", "Notion Review | Prophetic", "Independent review of Notion, including features, pricing, strengths, and limitations."],
  ["/review/linear/", "Linear Review | Prophetic", "Independent review of Linear for product and engineering teams."],
  ["/review/hubspot/", "HubSpot Review | Prophetic", "Independent review of HubSpot's CRM, marketing, sales, and service platform."],
  ["/review/wise-business/", "Wise Business Review | Prophetic", "Independent review of Wise Business for international payments and multi-currency operations."],
  ["/review/joiin/", "Joiin Review | Prophetic", "Independent review of Joiin for financial reporting and consolidation."],
  ["/review/volza/", "Volza Review | Prophetic", "Independent review of Volza for global trade intelligence."],
  ["/review/parallel-ai/", "Parallel AI Review | Prophetic", "Independent review of Parallel AI for AI-powered business growth."],
  ["/review/ahaslides/", "AhaSlides Review | Prophetic", "Independent review of AhaSlides for interactive presentations and audience engagement."],
  ["/review/salestarget-ai/", "SalesTarget.ai Review | Prophetic", "Independent review of SalesTarget.ai for B2B outbound sales and lead intelligence."],
  ["/review/babylovegrowth/", "BabyLoveGrowth.ai Review | Prophetic", "Independent review of BabyLoveGrowth.ai for automated SEO content and organic growth."],
  ["/review/woodpecker/", "Woodpecker.co Review | Prophetic", "Independent review of Woodpecker.co for cold email, LinkedIn outreach, and deliverability."]
];

function esc(v) {
  return String(v || "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
}

function markdown(text) {
  return String(text || "").replace(/\r\n?/g,"\n").split("\n").map(function(line) {
    var s = line.trim();
    if (!s) return "";
    if (/^###\s+/.test(s)) return "<h3>" + esc(s.replace(/^###\s+/,"")) + "</h3>";
    if (/^##\s+/.test(s)) return "<h2>" + esc(s.replace(/^##\s+/,"")) + "</h2>";
    if (/^#\s+/.test(s)) return "<h2>" + esc(s.replace(/^#\s+/,"")) + "</h2>";
    if (/^[-*]\s+/.test(s)) return "<ul><li>" + esc(s.replace(/^[-*]\s+/,"")) + "</li></ul>";
    return "<p>" + esc(s) + "</p>";
  }).join("\n");
}

async function getArticles() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("Supabase SEO source is not configured; generating static routes only.");
    return [];
  }
  var rows = [];
  for (var offset = 0; offset < 50000; offset += 1000) {
    var url = new URL("/rest/v1/articles", SUPABASE_URL);
    url.searchParams.set("select","slug,title,meta_description,content,category,image_url,created_at,updated_at");
    url.searchParams.set("order","created_at.desc");
    url.searchParams.set("limit","1000");
    url.searchParams.set("offset",String(offset));
    var res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY } });
    if (!res.ok) throw new Error("Supabase articles request failed: HTTP " + res.status);
    var batch = await res.json();
    rows = rows.concat(batch);
    if (batch.length < 1000) break;
  }
  return rows.filter(function(a) { return a && a.slug && a.title; });
}

function schema(article) {
  var url = SITE + "/article/" + article.slug + "/";
  return {
    "@context":"https://schema.org",
    "@type":"Article",
    "headline":article.title,
    "description":article.meta_description,
    "datePublished":article.created_at,
    "dateModified":article.updated_at || article.created_at,
    "author":{"@type":"Organization","name":"Prophetic Editorial Team"},
    "publisher":{"@type":"Organization","name":"Prophetic","url":SITE,"logo":{"@type":"ImageObject","url":SITE + "/logo.svg"}},
    "mainEntityOfPage":{"@type":"WebPage","@id":url},
    "url":url,
    "articleSection":article.category,
    "inLanguage":"en-US"
  };
}

function html(url,title,description,body,scriptSrc,json) {
  var d = String(description || title).slice(0,160);
  var schemaTag = json ? '<script type="application/ld+json">' + JSON.stringify(json) + "</script>" : "";
  return '<!doctype html><html lang="en"><head>' +
    '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">' +
    '<title>' + esc(title) + '</title>' +
    '<meta name="description" content="' + esc(d) + '">' +
    '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">' +
    '<meta name="author" content="Prophetic Editorial Team">' +
    '<link rel="canonical" href="' + url + '">' +
    '<link rel="alternate" hreflang="en" href="' + url + '">' +
    '<link rel="alternate" hreflang="x-default" href="' + url + '">' +
    '<meta property="og:type" content="article"><meta property="og:url" content="' + url + '">' +
    '<meta property="og:title" content="' + esc(title) + '"><meta property="og:description" content="' + esc(d) + '">' +
    '<meta property="og:image" content="' + SITE + '/og-image.jpg"><meta property="og:site_name" content="Prophetic">' +
    '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="' + esc(title) + '">' +
    '<meta name="twitter:description" content="' + esc(d) + '"><meta name="twitter:image" content="' + SITE + '/og-image.jpg">' +
    '<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="manifest" href="/manifest.json">' +
    styles + '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3898992716389443" crossorigin="anonymous"></script>' + '<script async src="https://www.googletagmanager.com/gtag/js?id=G-1W7PC1JDKH"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}gtag("js",new Date());gtag("config","G-1W7PC1JDKH");</script>' + schemaTag + '</head><body><div id="root">' + body + '</div>' +
    '<script type="module" crossorigin src="' + scriptSrc + '"></script></body></html>';
}

function writeRoute(route, content) {
  var clean = route.replace(/^\//,"").replace(/\/$/,"");
  var dir = clean ? path.join(dist,clean) : dist;
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,"index.html"),content,"utf8");
}

fs.mkdirSync(dist,{recursive:true});
var built = fs.readFileSync(path.join(dist,"index.html"),"utf8");
var match = built.match(/<script[^>]*type="module"[^>]*src="([^"]+)"[^>]*><\/script>/i);
var scriptSrc = match ? match[1] : "/assets/index.js";
var styleLinks = Array.from(built.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/gi)).map(function(m){ return m[1]; });
var styles = styleLinks.map(function(href){ return '<link rel="stylesheet" href="' + href + '">'; }).join("");
var articles = await getArticles();

var urls = staticPages.concat(reviewPages).map(function(p){ return p[0]; });
var sitemapEntries = staticPages.concat(reviewPages).map(function(p){
  return "  <url><loc>" + SITE + p[0] + "</loc></url>";
});
articles.forEach(function(a){
  urls.push("/article/" + a.slug + "/");
  sitemapEntries.push("  <url><loc>" + SITE + "/article/" + a.slug + "/</loc><lastmod>" + new Date(a.updated_at || a.created_at).toISOString() + "</lastmod></url>");
});

fs.writeFileSync(path.join(dist,"sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  sitemapEntries.join("\n") + '\n</urlset>\n',"utf8");

fs.writeFileSync(path.join(dist,"robots.txt"),
  "User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: " + SITE + "/sitemap.xml\n","utf8");

staticPages.concat(reviewPages).forEach(function(p){
  var heading = p[1].replace(" | Prophetic","").replace("Prophetic — ","");
  writeRoute(p[0],html(SITE+p[0],p[1],p[2],"<main><h1>"+esc(heading)+"</h1><p>"+esc(p[2])+"</p></main>",scriptSrc,null));
});

articles.forEach(function(a){
  var url = SITE + "/article/" + a.slug + "/";
  var body = "<main><article><header><p>"+esc(a.category || "Prophetic")+"</p><h1>"+esc(a.title)+"</h1><p>"+esc(a.meta_description || "")+"</p></header><div>"+markdown(a.content)+"</div></article></main>";
  writeRoute("/article/"+a.slug+"/",html(url,a.title+" | Prophetic",a.meta_description || a.title,body,scriptSrc,schema(a)));
});

fs.writeFileSync(path.join(dist,"404.html"),
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><title>Page Not Found | Prophetic</title></head><body><main><h1>Page Not Found</h1><p>The page you requested does not exist.</p><a href="/">Return to Prophetic</a></main></body></html>');

["manifest.json","ads.txt","googlec2dbc31ac222183d.html","favicon.ico","favicon.svg","logo.svg","icon-192.png","icon-512.png","og-image.jpg","BingSiteAuth.xml"].forEach(function(f){
  var src=path.join("public",f), dst=path.join(dist,f);
  if(fs.existsSync(src)){fs.copyFileSync(src,dst);}
});
fs.writeFileSync(path.join(dist,"CNAME"),"prophetic.pw\n","utf8");
console.log("SEO build generated " + articles.length + " article pages and " + urls.length + " sitemap URLs.");
