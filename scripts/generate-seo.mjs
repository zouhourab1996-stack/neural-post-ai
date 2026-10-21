import fs from "node:fs";
import path from "node:path";
import { TRACKING_HEAD } from "./head-tags.mjs";

const dist = path.resolve("dist");
const SITE = "https://prophetic.pw";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_KEY;

const staticPages = [
  ["/", "Prophetic — Astrology Guides, Retrograde Dates & Chart Tools", "Astrology guides with dates computed to the minute — Mercury and Venus retrogrades, eclipses, moon phases, Saturn returns — plus plain-language chart explainers and honest reading-cost guides."],
  ["/compare/", "Compare Business Tools | Prophetic", "Compare software, finance, marketing, and developer tools with clear, independent analysis."],
  ["/about/", "About Prophetic — How We Compute Our Astrology Dates", "Who writes Prophetic, how our astrology dates are computed from ephemeris data, our corrections policy, and how affiliate links are handled."],
  ["/contact/", "Contact Prophetic", "Contact the Prophetic editorial team."],
  ["/privacy/", "Privacy Policy | Prophetic", "Prophetic's privacy policy and data practices."],
  ["/terms/", "Terms of Service | Prophetic", "Terms of service for the Prophetic website."],
  ["/disclaimer/", "Disclaimer | Prophetic", "Disclosures about editorial content, affiliate relationships, and AI-assisted publishing."],
  ["/editorial/", "Editorial Policy | Prophetic", "Prophetic's editorial standards, sourcing practices, corrections policy, and independence principles."],
  ["/ai-policy/", "AI Content Policy | Prophetic", "How Prophetic uses AI-assisted tools in research and content production."],
  ["/sitemap/", "HTML Sitemap | Prophetic", "Browse public pages and articles published by Prophetic."],
  ["/topics/", "Topics | Prophetic", "Browse Prophetic topics across AI, technology, business, science, and world news."],
  ["/guides/", "Guides | Prophetic", "Browse practical guides and explainers from Prophetic."],
  ["/author/hedi-touati/", "Hedi Touati — Founder & Editor of Prophetic", "Hedi Touati is the founder and editor of Prophetic: he computes the site's astrology dates from ephemeris data and edits every guide before publication."]
];

const reviewPages = [
  ["/review/notion/", "Notion Review | Prophetic", "Independent review of Notion, including features, pricing, strengths, and limitations."],
  ["/review/linear/", "Linear Review | Prophetic", "Independent review of Linear for product and engineering teams."],
  ["/review/hubspot/", "HubSpot Review | Prophetic", "Independent review of HubSpot's CRM, marketing, sales, and service platform."],
  ["/review/wise-business/", "Wise Business Review | Prophetic", "Independent review of Wise Business for international payments and multi-currency operations."],
  ["/review/joiin/", "Joiin Review | Prophetic", "Independent review of Joiin for financial reporting and consolidation."],
  ["/review/volza/", "Volza Review | Prophetic", "Independent review of Volza for global trade intelligence."],
  ["/review/mera-work/", "Mera Work Review | Prophetic", "Independent review of Mera Work (formerly Mera Monitor): live screen streaming, stealth mode, AI productivity reports and attendance tracking from $3 per user per month, with pricing versus Hubstaff, Time Doctor and Teramind."],
  ["/review/involve-me/", "involve.me Review | Prophetic", "Independent review of involve.me: quiz funnels, calculators, lead scoring, AI funnel builder and email automation from $29/month with unlimited responses — current 2026 pricing versus Typeform, Paperform and Jotform."],
  ["/review/convert/", "Convert.com Review | Prophetic", "Convert.com review: transparent A/B testing from $299/mo, dual stats engines, 90+ integrations, SOC 2 and HIPAA compliance — with honest limits vs VWO."]
];

// Off-topic / thin pages: kept live for readers and existing links, but kept OUT of
// Google's index and OUT of the sitemap so prophetic.pw reads as one topical site
// (astrology). `follow` keeps internal link equity flowing to the astrology cluster.
const NOINDEX = ["/compare/", "/topics/", "/guides/"];
const isNoindex = (route) => NOINDEX.includes(route) || route.startsWith("/review/");

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
    "author":{"@type":"Person","@id":SITE + "/author/hedi-touati/#person","name":"Hedi Touati","url":SITE + "/author/hedi-touati/","jobTitle":"Founder & Editor"},
    "publisher":{"@type":"Organization","name":"Prophetic","url":SITE,"logo":{"@type":"ImageObject","url":SITE + "/logo.svg"}},
    "mainEntityOfPage":{"@type":"WebPage","@id":url},
    "url":url,
    "articleSection":article.category,
    "inLanguage":"en-US"
  };
}

function html(url,title,description,body,scriptSrc,json,robots) {
  var d = String(description || title).slice(0,160);
  var schemaTag = json ? '<script type="application/ld+json">' + JSON.stringify(json) + "</script>" : "";
  return '<!doctype html><html lang="en"><head>' +
    '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">' +
    '<title>' + esc(title) + '</title>' +
    '<meta name="description" content="' + esc(d) + '">' +
    '<meta name="robots" content="' + (robots || "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1") + '">' +
    '<meta name="author" content="Hedi Touati">' +
    '<link rel="canonical" href="' + url + '">' +
    '<link rel="alternate" hreflang="en" href="' + url + '">' +
    '<link rel="alternate" hreflang="x-default" href="' + url + '">' +
    '<meta property="og:type" content="article"><meta property="og:url" content="' + url + '">' +
    '<meta property="og:title" content="' + esc(title) + '"><meta property="og:description" content="' + esc(d) + '">' +
    '<meta property="og:image" content="' + SITE + '/og-image.jpg"><meta property="og:site_name" content="Prophetic">' +
    '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="' + esc(title) + '">' +
    '<meta name="twitter:description" content="' + esc(d) + '"><meta name="twitter:image" content="' + SITE + '/og-image.jpg">' +
    '<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="manifest" href="/manifest.json">' +
    TRACKING_HEAD + styles + schemaTag + '</head><body><div id="root">' + body + '</div>' +
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

// Blog pages are generated by scripts/generate-blog.mjs (runs before this script) and
// described in dist/blog/manifest.json. They are real static files, so writeRoute() must not touch them.
var blogManifestPath = path.join(dist, "blog", "manifest.json");
var blog = fs.existsSync(blogManifestPath) ? JSON.parse(fs.readFileSync(blogManifestPath, "utf8")) : { posts: [], tags: [], pages: [] };

// ---- Static crawlable content (raw HTML for crawlers; the SPA replaces #root on mount) ----
function postsList(withDesc) {
  var latest = blog.posts.slice().sort(function(a,b){ return String(b.date||'').localeCompare(String(a.date||'')); }).slice(0, withDesc ? 7 : 6);
  return '<ul>' + latest.map(function(p){
    var loc = String(p.url||'').replace(SITE,'');
    return '<li><a href="' + loc + '">' + esc(p.title) + '</a>' + (withDesc && p.description ? ' — ' + esc(String(p.description).slice(0,150)) : '') + '</li>';
  }).join('') + '</ul>';
}
var EXPLORE_LIST = '<ul>' + [
  ['/blog/','All astrology articles'], ['/about/','About Prophetic'], ['/editorial/','Editorial policy'],
  ['/ai-policy/','AI content policy'], ['/contact/','Contact'], ['/sitemap/','HTML sitemap']
].map(function(x){ return '<li><a href="' + x[0] + '">' + x[1] + '</a></li>'; }).join('') + '</ul>';
var HOMEPAGE_BODY = '<main>'
 + '<h1>Astrology guides with dates you can check</h1>'
 + '<p>Prophetic publishes astrology guides with their dates computed to the minute — retrogrades and their shadow periods, eclipses, moon phases, meteor showers and portals — alongside plain-language explainers for reading your own chart, and honest cost guides for readings and spiritual services. No filler: every guide is dated, sourced, and updated when the sky changes.</p>'
 + '<section><h2>Latest astrology guides</h2>' + postsList(true) + '</section>'
 + '<section><h2>Free calculators and tools</h2><ul>'
 + '<li><a href="/blog/mercury-retrograde-2026/">Mercury retrograde chart checker</a> — find out whether you were born with Mercury retrograde and whether the 2026 stations touch your chart.</li>'
 + '<li><a href="/blog/venus-retrograde-2026/">Venus retrograde calculator</a> — check any birth chart against the 2026 Venus stations.</li>'
 + '<li><a href="/blog/jupiter-retrograde-2026/">Jupiter retrograde guide</a> — the quiet background review running underneath the 2026 retrograde season.</li>'
 + '<li><a href="https://daysuntil.bond/" rel="noopener">daysuntil.bond</a> — live countdowns to every eclipse, full moon and retrograde station.</li>'
 + '</ul></section>'
 + '<section><h2>Explore Prophetic</h2>' + EXPLORE_LIST + '</section>'
 + '</main>';
var PAGE_INTRO = {
 "/about/": '<p>Prophetic is an independent astrology publisher. Every guide on this site is built from primary ephemeris data — the same astronomical tables professional astrologers use — and published with the date and time of each event to the minute, in UTC and in your local timezone where it matters. When a retrograde station or a moon phase moves, we update the article rather than publishing a new one.</p>'
   + '<h2>What we publish</h2><p>Three things: dated event guides (retrogrades, eclipses, moon phases, meteor showers, portals), chart explainers (what a planet, house or aspect actually means when you read it in your own chart), and honest cost guides for readings and spiritual services — what you get at $15, at $60 and at $300, and where the marketplace sits in between.</p>'
   + '<h2>How we work</h2><p>Dates come from ephemeris computation, not from copying other astrology sites. Claims about services come from their published pricing and terms on the day we check them, and we say which day that was. Where we cannot verify something, we say so instead of inventing a number.</p>'
   + '<h2>Independence and corrections</h2><p>Some guides contain affiliate links, always labelled at the point of the link; they never change a date, a price we quote, or a conclusion. We accept no payment for coverage. Errors are corrected in place and the correction is noted in the article it affects — email the editor and the fix is published with the next update.</p>'
   + '<h2>What astrology is — and is not</h2><p>We treat astrology as a symbolic and reflective practice with a long history, not as a prediction engine and not as a substitute for medical, legal or financial advice. That boundary is stated on every page that touches health, money or major life decisions.</p>',
 "/compare/": '<p>Side-by-side comparisons of the tools teams actually pay for — what each one does well, where it breaks, and which plan to start on. Every comparison is built from hands-on use and published pricing, not vendor copy.</p>',
 "/contact/": '<p>The fastest way to reach the editorial team is email: anistouati74@gmail.com. We read everything, and corrections are published with the next update of the article they concern.</p>',
 "/topics/": '<p>Browse everything Prophetic covers by topic — astrology transits and retrogrades, numerology, manifestation rituals, and the software categories we review.</p>',
 "/guides/": '<p>Practical, step-by-step guides: how to read a retrograde, how to use the 11/11 portal, how to check your chart against a transit — written for people who want the instruction, not the mood board.</p>',
 "/editorial/": '<p>Our editorial standards in one sentence: dates computed from primary sources, opinions owned and dated, cons published as loudly as pros, and corrections logged in public.</p>',
 "/ai-policy/": '<p>We use AI assistance the way a calculator is used in accounting: for computation and drafts, never for judgment. Every published sentence is reviewed by an editor who owns it.</p>',
 "/sitemap/": '<p>The complete list of pages and articles on Prophetic.</p>',
 "/privacy/": '<p>Prophetic is a static website: no accounts, no comment forms, minimal analytics. This page describes exactly what little data is collected and by whom.</p>',
 "/terms/": '<p>The plain-language terms that apply when you use prophetic.pw.</p>',
 "/disclaimer/": '<p>Astrology is a symbolic, reflective practice — not a prediction engine and not professional advice. Our reviews contain affiliate links, disclosed at the point of the link. This page details both.</p>',
 "/author/hedi-touati/": '<p>Hedi Touati is the founder and editor of Prophetic. He is responsible for every guide published here: computing the astrology dates from ephemeris data, checking the prices quoted in the service guides against sellers’ own terms, and editing each piece before it goes live.</p>'
   + '<h2>What he does here</h2><p>Retrograde stations, eclipses, moon phases and meteor-shower peaks are calculated rather than copied, which is why Prophetic’s times sometimes differ by a few hours from other astrology sites. Each guide carries the date it was last checked, and corrections are made in place rather than quietly replaced.</p>'
   + '<h2>Background</h2><p>Prophetic began as a set of private notes on retrograde dates — the kind of table you build when you are tired of websites that disagree with each other by a day. It is now a public reference for people who want to check the sky for themselves: what is happening, when exactly, and what it means for a chart.</p>'
   + '<h2>Standards and independence</h2><p>Some guides carry affiliate links, disclosed at the point of the link. They fund the site and never change a date, a quoted price or a conclusion. Corrections are published on the article they affect, with the date of the change. The full standards are in the <a href="/editorial/">editorial policy</a>.</p>'
   + '<h2>Contact</h2><p>Corrections, questions and pitches: <a href="mailto:anistouati74@gmail.com">anistouati74@gmail.com</a>. Everything is read, and verified corrections are published with the next update of the article.</p>',
 "/review/notion/": '<p>Notion remains the most flexible all-in-one workspace, and the one most teams adopt enthusiastically and then drown in. Our review covers where it genuinely shines — docs, wikis, linked databases — and where it costs you: speed at scale, the mobile app, and per-seat pricing that compounds.</p>',
 "/review/linear/": '<p>Linear is the issue tracker that product and engineering teams actually enjoy using — opinionated, fast, and built around cycles rather than ticket churn. Our review covers where that opinionation helps and where it fights your process.</p>',
 "/review/hubspot/": '<p>HubSpot bundles CRM, marketing, sales and service hubs into one platform — powerful, and priced accordingly. Our review covers which hubs earn their cost, where the free tier is genuinely usable, and where the pricing staircase bites.</p>',
 "/review/wise-business/": '<p>Wise Business is the multi-currency account for companies that pay and get paid across borders — real exchange rates, local account details in many currencies. Our review covers the fees that matter and where it beats — and loses to — business accounts at traditional banks.</p>',
 "/review/joiin/": '<p>Joiin consolidates multi-entity financials straight from Xero and QuickBooks — currency conversion, eliminations, group reporting — from around $28/month with a free plan. Our review covers who it fits and who still needs a full CPM platform.</p>',
 "/review/volza/": '<p>Volza aggregates bills of lading and customs data across 190+ countries: real buyers, real suppliers, real volumes. Our review covers what the data actually shows, how fresh it is per country, and who the subscription pays off for.</p>',
 "/review/mera-work/": '<p>Mera Work is the budget entry in employee monitoring — screenshots, activity levels and time tracking from about $3 per user per month, with a usable free tier. Our review compares it honestly against Insightful, Hubstaff and Time Doctor.</p>',
 "/review/involve-me/": '<p>involve.me builds quiz funnels with the CRM and email automation attached — from $29/month on top of a capable free plan. Our review covers the quiz builder, the automation depth, and how it compares to Typeform and Jotform for lead generation.</p>',
 "/review/convert/": '<p>Convert.com is enterprise-grade A/B testing from $299/month — client and server-side experiments, privacy-safe analytics, and support staffed by testing people. Our review covers what you get for the price and who should stay on cheaper tools.</p>'
};

var indexable = staticPages.concat(reviewPages).filter(function(p){ return !isNoindex(p[0]); });
var urls = indexable.map(function(p){ return p[0]; });
var sitemapEntries = indexable.map(function(p){
  return "  <url><loc>" + SITE + p[0] + "</loc></url>";
});
if (blog.posts.length) {
  var blogLastmod = blog.posts.map(function(p){ return p.updated || p.date; }).sort().pop();
  urls.push("/blog/");
  sitemapEntries.push("  <url><loc>" + SITE + "/blog/</loc><lastmod>" + blogLastmod + "</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>");
  blog.posts.forEach(function(p){
    var loc = p.url.replace(SITE, "");
    urls.push(loc);
    sitemapEntries.push("  <url><loc>" + SITE + loc + "</loc><lastmod>" + (p.updated || p.date) + "</lastmod><priority>0.8</priority></url>");
  });
  blog.tags.filter(function(t){ return !t.thin; }).forEach(function(t){
    var loc = t.url.replace(SITE, "");
    urls.push(loc);
    sitemapEntries.push("  <url><loc>" + SITE + loc + "</loc><lastmod>" + blogLastmod + "</lastmod><priority>0.4</priority></url>");
  });
}
articles.forEach(function(a){
  urls.push("/article/" + a.slug + "/");
  sitemapEntries.push("  <url><loc>" + SITE + "/article/" + a.slug + "/</loc><lastmod>" + new Date(a.updated_at || a.created_at).toISOString() + "</lastmod></url>");
});

fs.writeFileSync(path.join(dist,"sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  sitemapEntries.join("\n") + '\n</urlset>\n',"utf8");

fs.writeFileSync(path.join(dist,"robots.txt"),
  "User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: " + SITE + "/sitemap.xml\n","utf8");

var AUTHOR_SCHEMA = {
  "@context":"https://schema.org","@type":"Person","@id":SITE + "/author/hedi-touati/#person",
  name:"Hedi Touati", url:SITE + "/author/hedi-touati/", jobTitle:"Founder & Editor",
  description:"Founder and editor of Prophetic. Computes the site\u2019s astrology dates from ephemeris data and edits every guide before publication.",
  worksFor:{"@type":"Organization","name":"Prophetic","url":SITE + "/"},
  knowsAbout:["Astrology","Birth charts","Planetary transits","Retrograde motion","Moon phases"],
  email:"mailto:anistouati74@gmail.com"
};

staticPages.concat(reviewPages).forEach(function(p){
  var heading = p[1].replace(" | Prophetic","").replace("Prophetic — ","");
  var body;
  if (p[0] === "/") {
    body = HOMEPAGE_BODY;
  } else {
    body = "<main><h1>"+esc(heading)+"</h1><p>"+esc(p[2])+"</p>"
         + (PAGE_INTRO[p[0]] || "")
         + "<section><h2>More from Prophetic</h2>"
         + "<h3>Latest astrology guides</h3>"+postsList(false)
         + "<h3>Explore</h3>"+EXPLORE_LIST
         + "</section></main>";
  }
  writeRoute(p[0],html(SITE+p[0],p[1],p[2],body,scriptSrc,
    p[0] === "/author/hedi-touati/" ? AUTHOR_SCHEMA : null,
    isNoindex(p[0]) ? "noindex,follow" : null));
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
