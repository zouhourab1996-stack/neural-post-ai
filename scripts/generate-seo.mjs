import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { TRACKING_HEAD } from "./head-tags.mjs";
import { fitDesc } from "./seo-fit.mjs";
import { chrome, themeCss, THEME_SCRIPT, FONT_LINKS } from "./site-chrome.mjs";
import { ADS_CSS, adHomepage } from "./ads.mjs";

const dist = path.resolve("dist");
const SITE = "https://prophetic.pw";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_KEY;

const staticPages = [
  ["/", "Prophetic — Astrology Guides, Retrograde Dates & Chart Tools", "Astrology guides with dates computed to the minute — Mercury and Venus retrogrades, eclipses, moon phases, Saturn returns — plus plain-language chart explainers and honest reading-cost guides."],
  ["/about/", "About Prophetic — How We Compute Our Astrology Dates", "Who writes Prophetic, how our astrology dates are computed from ephemeris data, our corrections policy, and our editorial independence."],
  ["/contact/", "Contact the Prophetic Editorial Team", "Contact the Prophetic editorial team with corrections, sourcing questions, feedback, or a carefully researched pitch."],
  ["/privacy/", "Prophetic Privacy Policy & Data Practices", "Read Prophetic's privacy policy, including the limited data collected by the site, analytics, advertising, and your available choices."],
  ["/terms/", "Prophetic Website Terms of Service", "Read the terms that apply when you use Prophetic's astrology guides, calculators, and other published content."],
  ["/disclaimer/", "Prophetic Disclaimer", "Read Prophetic's disclaimer about astrology, general information, AI-assisted publishing, editorial independence, and professional advice boundaries."],
  ["/editorial/", "Prophetic Editorial Policy & Standards", "Learn how Prophetic computes dates, checks service claims, handles corrections, and protects editorial independence."],
  ["/ai-policy/", "Prophetic AI Content Policy & Human Review", "Learn how Prophetic uses AI-assisted tools for research and drafting while requiring human review, source checks, and accountable publication."],
  ["/sitemap/", "Prophetic HTML Sitemap & Article Index", "Browse Prophetic's public pages, astrology guides, dated event explainers, calculators, and the latest published articles."],
  ["/topics/", "Astrology Topics: Retrogrades, Moons & Charts | Prophetic", "Every Prophetic astrology guide grouped by topic: retrogrades, zodiac seasons, moon phases and sky events, birth charts, numerology and tarot, and reading costs."],
  ["/author/hedi-touati/", "Meet Hedi Touati, Prophetic Founder & Editor", "Meet Hedi Touati, founder and editor of Prophetic, who computes the site's astrology dates and edits every guide before publication."]
];

const reviewPages = []; // /review/* (old software/business reviews) returns 410 Gone (middleware.js); nothing is built there.

// Off-topic / thin pages: kept live for readers and existing links, but kept OUT of
// Google's index and OUT of the sitemap so prophetic.pw reads as one topical site
// (astrology). `follow` keeps internal link equity flowing to the astrology cluster.
// /compare/ and /guides/ were removed on 2026-11-14 and return 410 (middleware.js).
const NOINDEX = [];
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
  // 2026-11-16: no affiliate/marketplace promotion anywhere on the site. Legacy rows that
  // promote Fiverr/ClickBank are not built (middleware.js returns 410 for them), and any
  // line linking to such content is stripped from the remaining legacy pages.
  var PROMO = /fiverr|clickbank|hop\.clickbank/i;
  return rows.filter(function(a) { return a && a.slug && a.title && !PROMO.test(a.slug) && !PROMO.test(a.title); })
    .map(function(a) { a.content = String(a.content || "").split("\n").filter(function(l){ return !PROMO.test(l); }).join("\n"); return a; });
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

// Static pages are pure static HTML — no SPA bundle. (Until 2026-11-14 they loaded the
// old Vite/React app, whose createRoot() replaced this astrology content with the
// retired "The Signal" software-comparison site and rendered "Page Not Found" on
// /author/, /editorial/, /ai-policy/ and /sitemap/.)
function html(url,title,description,body,json,robots,active) {
  var d = fitDesc(description || title);
  var jsonList = Array.isArray(json) ? json : (json ? [json] : []);
  var schemaTag = jsonList.map(function(j){ return '<script type="application/ld+json">' + JSON.stringify(j) + "</script>"; }).join("");
  var c = chrome(active);
  return '<!doctype html><html lang="en" class="dark"><head>' +
    '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">' +
    '<title>' + esc(title) + '</title>' +
    '<meta name="description" content="' + esc(d) + '">' +
    '<meta name="robots" content="' + (robots || "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1") + '">' +
    '<meta name="author" content="Hedi Touati">' +
    '<meta name="msvalidate.01" content="DF3557B334AD60DC263293F8F0967114">' +
    '<link rel="canonical" href="' + url + '">' +
    '<meta property="og:type" content="website"><meta property="og:url" content="' + url + '">' +
    '<meta property="og:title" content="' + esc(title) + '"><meta property="og:description" content="' + esc(d) + '">' +
    '<meta property="og:image" content="' + SITE + '/og-image.jpg"><meta property="og:site_name" content="Prophetic">' +
    '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="' + esc(title) + '">' +
    '<meta name="twitter:description" content="' + esc(d) + '"><meta name="twitter:image" content="' + SITE + '/og-image.jpg">' +
    '<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="any"><link rel="apple-touch-icon" href="/icon-192.png"><link rel="manifest" href="/manifest.json">' +
    '<meta name="theme-color" content="#0a0f1e">' +
    TRACKING_HEAD +
    '<link rel="alternate" type="application/rss+xml" title="Prophetic Blog" href="' + SITE + '/blog/feed.xml">' +
    FONT_LINKS + THEME_SCRIPT +
    '<style>' + themeCss + (url === SITE + "/" ? ADS_CSS : "") + '</style>' + schemaTag + '</head><body>' + c.header +
    '<main class="pb-container"><article class="pb-post"><div class="pb-body">' + body + '</div></article></main>' +
    c.footer + '</body></html>';
}

function writeRoute(route, content) {
  var clean = route.replace(/^\//,"").replace(/\/$/,"");
  var dir = clean ? path.join(dist,clean) : dist;
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,"index.html"),content,"utf8");
}

fs.mkdirSync(dist,{recursive:true});
// 2026-11-16: the 434 legacy "The Signal" tech/AI/business news rows in Supabase `articles`
// are off-niche for an astrology site. They are no longer built; /article/* returns 410 Gone
// (middleware.js). getArticles() is kept only for reference and is not called.
var articles = [];

// Blog pages are generated by scripts/generate-blog.mjs (runs before this script) and
// described in dist/blog/manifest.json. They are real static files, so writeRoute() must not touch them.
var blogManifestPath = path.join(dist, "blog", "manifest.json");
var blog = fs.existsSync(blogManifestPath) ? JSON.parse(fs.readFileSync(blogManifestPath, "utf8")) : { posts: [], tags: [], pages: [] };

// ---- Static page content (pure static HTML; no client-side app) ----
function postsList(withDesc) {
  var latest = blog.posts.filter(function(p){ return !p.noindex && p.category !== 'Fiverr Reviews'; }).sort(function(a,b){ return String(b.date||'').localeCompare(String(a.date||'')); }).slice(0, withDesc ? 7 : 6);
  return '<ul>' + latest.map(function(p){
    var loc = String(p.url||'').replace(SITE,'');
    return '<li><a href="' + loc + '">' + esc(p.title) + '</a>' + (withDesc && p.description ? ' — ' + esc(String(p.description).slice(0,150)) : '') + '</li>';
  }).join('') + '</ul>';
}
var EXPLORE_LIST = '<ul>' + [
  ['/blog/','All astrology articles'], ['/topics/','Guides by topic'], ['/about/','About Prophetic'], ['/editorial/','Editorial policy'],
  ['/ai-policy/','AI content policy'], ['/contact/','Contact'], ['/sitemap/','HTML sitemap']
].map(function(x){ return '<li><a href="' + x[0] + '">' + x[1] + '</a></li>'; }).join('') + '</ul>';
var HOMEPAGE_BODY = ''
 + '<h1>Astrology guides with dates you can check</h1>'
 + '<p>Prophetic publishes astrology guides with their dates computed to the minute — retrogrades and their shadow periods, eclipses, moon phases, meteor showers and portals — alongside plain-language explainers for reading your own chart, and honest cost guides for readings and spiritual services. No filler: every guide is dated, sourced, and updated when the sky changes.</p>'
 + '<section><h2>Latest astrology guides</h2>' + postsList(true) + '</section>'
 + adHomepage()
 + '<section><h2>Free calculators and tools</h2><ul>'
 + '<li><a href="/blog/mercury-retrograde-2026/">Mercury retrograde chart checker</a> — find out whether you were born with Mercury retrograde and whether the 2026 stations touch your chart.</li>'
 + '<li><a href="/blog/venus-retrograde-2026/">Venus retrograde calculator</a> — check any birth chart against the 2026 Venus stations.</li>'
 + '<li><a href="/blog/jupiter-retrograde-2026/">Jupiter retrograde guide</a> — the quiet background review running underneath the 2026 retrograde season.</li>'
 + '<li><a href="https://daysuntil.bond/" rel="noopener">daysuntil.bond</a> — live countdowns to every eclipse, full moon and retrograde station.</li>'
 + '</ul></section>'
 + '<section><h2>Explore Prophetic</h2>' + EXPLORE_LIST + '</section>'
 ;
// ---- /topics/: the topic hub. Every indexable post appears under exactly one cluster.
var CLUSTERS = [
  ["retrogrades", "Retrogrades", /retrograde/, "Mercury, Venus, Mars and Jupiter retrogrades: station dates and times, shadow periods, and what each one is read as in a chart."],
  ["saturn", "Saturn and major transits", /saturn/, "Slow-moving transits that mark life phases, starting with the Saturn return."],
  ["seasons", "Zodiac seasons and calendars", /season|zodiac-sign-dates|astrology-calendar/, "When each zodiac season starts, with exact ingress times, and month-by-month astrology calendars."],
  ["moon-sky", "Moon phases and sky events", /moon|meteor|portal|gardening/, "Full and new moons, meteor showers and other dated sky events, with times and viewing notes."],
  ["birth-chart", "Birth chart basics", /natal|planets-mean|sun-moon-rising|read-birth-chart|chart-generator|astro-com|horoscope-platform|compatibility/, "How to read your own chart: the big three, what each planet means, working without a birth time, and which free chart tools to use."],
  ["numerology-tarot", "Numerology and tarot", /life-path|tarot-spreads/, "Life path numbers and beginner tarot spreads, explained step by step."],
  ["readings", "Readings, costs and services", /./, "What paid readings cost, what to expect, red flags to watch for, and how the marketplaces that sell them compare."]
];
function topicsBody() {
  var groups = CLUSTERS.map(function(c){ return { c: c, posts: [] }; });
  blog.posts.filter(function(p){ return !p.noindex; }).forEach(function(p){
    for (var i = 0; i < groups.length; i++) { if (groups[i].c[2].test(p.slug)) { groups[i].posts.push(p); return; } }
  });
  var nav = '<ul>' + groups.filter(function(g){ return g.posts.length; }).map(function(g){ return '<li><a href="#' + g.c[0] + '">' + esc(g.c[1]) + '</a> (' + g.posts.length + ')</li>'; }).join('') + '</ul>';
  return '<h1>Astrology topics</h1><p>Every guide on Prophetic, grouped by subject. Dated guides give event times computed from ephemeris data; explainers cover what those events and chart placements mean.</p>' + nav
    + groups.filter(function(g){ return g.posts.length; }).map(function(g){
      return '<section><h2 id="' + g.c[0] + '">' + esc(g.c[1]) + '</h2><p>' + esc(g.c[3]) + '</p><ul>'
        + g.posts.sort(function(a,b){ return String(b.date).localeCompare(String(a.date)); }).map(function(p){
          return '<li><a href="' + String(p.url).replace(SITE,'') + '">' + esc(p.title) + '</a>' + (p.description ? ' — ' + esc(String(p.description).slice(0,160)) : '') + '</li>';
        }).join('') + '</ul></section>';
    }).join('')
    + '<section><h2>Explore Prophetic</h2>' + EXPLORE_LIST + '</section>';
}

var PAGE_INTRO = {
 "/about/": '<p>Prophetic is an independent astrology publisher. Every guide on this site is built from primary ephemeris data — the same astronomical tables professional astrologers use — and published with the date and time of each event to the minute, in UTC and in your local timezone where it matters. When a retrograde station or a moon phase moves, we update the article rather than publishing a new one.</p>'
   + '<h2>What we publish</h2><p>Three things: dated event guides (retrogrades, eclipses, moon phases, meteor showers, portals), chart explainers (what a planet, house or aspect actually means when you read it in your own chart), and honest cost guides for readings and spiritual services — what you get at $15, at $60 and at $300, and where the marketplace sits in between.</p>'
   + '<h2>How we work</h2><p>Dates come from ephemeris computation, not from copying other astrology sites. Claims about services come from their published pricing and terms on the day we check them, and we say which day that was. Where we cannot verify something, we say so instead of inventing a number.</p>'
   + '<h2>Independence and corrections</h2><p>Prophetic carries no affiliate links and accepts no payment for coverage. Errors are corrected in place and the correction is noted in the article it affects — email the editor and the fix is published with the next update.</p>'
   + '<h2>What astrology is — and is not</h2><p>We treat astrology as a symbolic and reflective practice with a long history, not as a prediction engine and not as a substitute for medical, legal or financial advice. That boundary is stated on every page that touches health, money or major life decisions.</p>',
 "/contact/": '<p>The fastest way to reach the Prophetic editorial team is email: <a href="mailto:anistouati74@gmail.com">anistouati74@gmail.com</a>. We read everything and usually reply within two working days.</p><h2>What to write about</h2><p>Corrections (include the page address and the source you are relying on), questions about a guide, privacy requests, and advertising or partnership enquiries. Corrections are published with the next update of the article they concern.</p><h2>Who you are writing to</h2><p>Prophetic is edited by <a href="/author/hedi-touati/">Hedi Touati</a>. Read more <a href="/about/">about Prophetic</a> and our <a href="/editorial/">editorial policy</a>.</p>',
 "/editorial/": '<p>Our editorial standards in one sentence: dates computed from primary sources, opinions owned and dated, cons published as loudly as pros, and corrections logged in public.</p>',
 "/ai-policy/": '<p>We use AI assistance the way a calculator is used in accounting: for computation and drafts, never for judgment. Every published sentence is reviewed by an editor who owns it.</p>',
 "/sitemap/": '<p>The complete list of pages and articles on Prophetic.</p>',
 "/privacy/": '<p>Last updated: November 16, 2026. Prophetic (prophetic.pw) is a static astrology publication. There are no accounts, no comment forms and no newsletter sign-up, so we do not ask you for personal information. This policy explains what data is collected when you read the site, by whom, and the choices you have.</p><h2>Information collected automatically</h2><p>Like any website, our hosting providers (Vercel and Cloudflare) receive standard technical data such as your IP address, browser type, the page requested and the time of the request. This is used to deliver pages, keep the site secure and stop abuse, and is kept only as long as those providers need it.</p><h2>Analytics</h2><p>We use Google Analytics to understand which guides are read and how visitors find them. Google Analytics uses cookies and collects data such as pages viewed, approximate location and device type. We do not use it to identify individual visitors. You can opt out with the <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener">Google Analytics opt-out browser add-on</a>.</p><h2>Advertising and cookies</h2><p>Prophetic is free to read and is funded by advertising. Ads are served by Google (Google AdSense and Google Ad Manager) and by our authorised advertising partner Advergic, as listed in our public <a href="/ads.txt">ads.txt</a> file.</p><p>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites. Google&rsquo;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet. You can read <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">how Google uses information from sites or apps that use its services</a>.</p><p>You can opt out of personalised advertising in <a href="https://adssettings.google.com" rel="noopener">Google Ads Settings</a>, or opt out of some third-party vendors&rsquo; use of cookies for personalised advertising at <a href="https://www.aboutads.info/choices/" rel="noopener">aboutads.info</a>. Blocking third-party cookies in your browser has a similar effect; every page still works without them.</p><h2>Consent in the EEA, UK and Switzerland</h2><p>Visitors in the European Economic Area, the United Kingdom and Switzerland are shown a consent message from a Google-certified consent management platform before advertising cookies or personalised ads are used. You can accept, refuse or change your choice at any time through the privacy settings link that the consent message provides.</p><h2>US state privacy rights</h2><p>Residents of California and other US states with privacy laws can opt out of the sale or sharing of personal information for targeted advertising through the opt-out tools above or by emailing us.</p><h2>Children</h2><p>Prophetic is a general-audience site and is not directed at children under 13. We do not knowingly collect personal information from children.</p><h2>Your rights</h2><p>Because we hold no accounts, we normally have no personal data to access, correct or delete. If you are in a jurisdiction with data protection rights and want to exercise them, email us and we will reply within 30 days. You can also complain to your local data protection authority.</p><h2>Changes and contact</h2><p>If our practices change, this page and its date change with them. Questions about privacy: <a href="mailto:anistouati74@gmail.com">anistouati74@gmail.com</a>.</p>',
 "/terms/": '<p>Last updated: November 16, 2026. These terms apply when you use prophetic.pw (&ldquo;Prophetic&rdquo;). By using the site you agree to them; if you do not, please do not use it.</p><h2>What the site is</h2><p>Prophetic publishes astrology and sky-event guides: dates of retrogrades, eclipses, moon phases and meteor showers, and explanations of astrological concepts. Astrology is presented as a symbolic and reflective practice, not as prediction or professional advice. See our <a href="/disclaimer/">disclaimer</a>.</p><h2>Use of content</h2><p>All articles, tables and images are owned by Prophetic or used under licence. You may read, link to and share our pages and quote short extracts with a link back. You may not copy articles in bulk, scrape the site automatically, or republish our content as your own.</p><h2>Accuracy</h2><p>We compute dates from ephemeris data and check them against primary sources such as NASA and timeanddate.com, but errors can occur and times can differ slightly by source and time zone. Confirm anything time-critical independently. Corrections are welcome through our <a href="/contact/">contact page</a>.</p><h2>Advertising</h2><p>The site shows advertising from Google and our authorised partner Advergic. Advertisers have no influence over editorial content. Please do not click ads to support us: artificial clicks break advertisers&rsquo; rules. Details are in our <a href="/privacy/">privacy policy</a>.</p><h2>External links</h2><p>We link to outside sources for reference. We are not responsible for their content or practices.</p><h2>No warranty and limitation of liability</h2><p>The site is provided &ldquo;as is&rdquo; without warranties of any kind. To the extent the law allows, Prophetic is not liable for any loss arising from use of, or reliance on, the site.</p><h2>Changes and contact</h2><p>We may update these terms; the current version always appears here with its date. Questions: <a href="mailto:anistouati74@gmail.com">anistouati74@gmail.com</a>.</p>',
 "/disclaimer/": '<p>Astrology is a symbolic, reflective practice: not a prediction engine and not professional advice. This page explains what that means for how you use Prophetic.</p><h2>Not professional advice</h2><p>Nothing on Prophetic is medical, psychological, legal, financial or relationship advice. Do not make health, money, legal or safety decisions based on astrology. If you need advice, speak to a qualified professional.</p><h2>Astronomy versus astrology</h2><p>The astronomical facts we publish (when Mercury stations, when an eclipse peaks, when a meteor shower is best seen) are measurable and checked against sources such as NASA. Their astrological meaning is interpretation, offered for reflection and entertainment, and other astrologers may read the same sky differently.</p><h2>Accuracy of dates</h2><p>We compute times carefully, but they can differ by a few minutes between ephemerides and by a day across time zones. Check the time zone shown on each guide.</p><h2>Advertising</h2><p>The site is supported by advertising from Google and our partner Advergic. Ads are labelled and are not endorsements; advertisers do not see or approve our articles. Prophetic carries no affiliate links.</p><h2>Questions</h2><p>Email <a href="mailto:anistouati74@gmail.com">anistouati74@gmail.com</a>.</p>',
 "/author/hedi-touati/": '<p>Hedi Touati is the founder and editor of Prophetic. He is responsible for every guide published here: computing the astrology dates from ephemeris data, checking the prices quoted in the service guides against sellers’ own terms, and editing each piece before it goes live.</p>'
   + '<h2>What he does here</h2><p>Retrograde stations, eclipses, moon phases and meteor-shower peaks are calculated rather than copied, which is why Prophetic’s times sometimes differ by a few hours from other astrology sites. Each guide carries the date it was last checked, and corrections are made in place rather than quietly replaced.</p>'
   + '<h2>Background</h2><p>Prophetic began as a set of private notes on retrograde dates — the kind of table you build when you are tired of websites that disagree with each other by a day. It is now a public reference for people who want to check the sky for themselves: what is happening, when exactly, and what it means for a chart.</p>'
   + '<h2>Standards and independence</h2><p>Prophetic carries no affiliate links and accepts no payment for coverage; the site is funded by display advertising, which never changes a date or a conclusion. Corrections are published on the article they affect, with the date of the change. The full standards are in the <a href="/editorial/">editorial policy</a>.</p>'
   + '<h2>Contact</h2><p>Corrections, questions and pitches go through the <a href="/contact/">contact page</a>. Everything is read, and verified corrections are published with the next update of the article.</p>',
};

// ---- Sitemaps (sitemap.xml + sitemap.txt) ----
// Only canonical, indexable, 200-serving URLs, all in trailing-slash form.
// lastmod is the page's real last-modified date — never the build date:
//   * blog posts: front-matter `updated` (falls back to `date`) — the same value
//     emitted as BlogPosting.dateModified; falls back to the source file's last git
//     commit when the front-matter date is missing or in the future.
//   * static pages: STATIC_LASTMOD below — bump it only when their copy changes.
//   * homepage and /blog/: newest of STATIC_LASTMOD and the newest post (they list posts).
// No changefreq/priority (Google ignores both).
var STATIC_LASTMOD = "2026-11-14"; // SPA removed + new static chrome for all static pages
var today = new Date().toISOString().slice(0,10);
var dayOnly = function(d){ return String(d || "").slice(0,10); };
function gitDate(file) {
  try {
    var out = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], { encoding: "utf8" }).trim();
    return /^\d{4}-\d{2}-\d{2}/.test(out) ? out.slice(0,10) : "";
  } catch (e) { return ""; }
}
function postLastmod(p) {
  var d = dayOnly(p.updated || p.date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || d > today) d = (p.file && gitDate(path.join("content","blog",p.file))) || "";
  return d;
}
var maxDate = function(list){ return list.filter(Boolean).sort().pop() || ""; };

var indexable = staticPages.filter(function(p){ return !isNoindex(p[0]); });
var sitemapUrls = []; // [loc, lastmod]
var indexablePosts = blog.posts.filter(function(p){ return !p.noindex && (!p.canonical || p.canonical === p.url) && (p.rankyak || /\/$/.test(p.url)); });
var newestPost = maxDate(indexablePosts.map(postLastmod));
indexable.forEach(function(p){
  sitemapUrls.push([p[0], (p[0] === "/" || p[0] === "/topics/") ? maxDate([STATIC_LASTMOD, newestPost]) : STATIC_LASTMOD]);
});
if (indexablePosts.length) {
  sitemapUrls.push(["/blog/", maxDate([STATIC_LASTMOD, newestPost])]);
  indexablePosts.forEach(function(p){ sitemapUrls.push([p.url.replace(SITE, ""), postLastmod(p)]); });
  // Tag archives are listed only if not thin (see generate-blog.mjs isThinTag); thin ones are noindex,follow.
  blog.tags.filter(function(t){ return !t.thin; }).forEach(function(t){
    var tagPosts = indexablePosts.filter(function(p){ return p.tags.indexOf(t.name) !== -1; });
    sitemapUrls.push([t.url.replace(SITE, ""), maxDate(tagPosts.map(postLastmod))]);
  });
}
// Legacy off-niche "The Signal" news pages (/article/*) are removed (410 Gone, 2026-11-16); never listed.

var seenLoc = {};
sitemapUrls = sitemapUrls.filter(function(u){ if (seenLoc[u[0]] || (!/^https:\/\//.test(u[0]) && !/\/$/.test(u[0]))) return false; seenLoc[u[0]] = 1; return true; });
var urls = sitemapUrls.map(function(u){ return u[0]; });

fs.writeFileSync(path.join(dist,"sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  sitemapUrls.map(function(u){
    return "  <url><loc>" + esc(/^https:\/\//.test(u[0]) ? u[0] : SITE + u[0]) + "</loc>" + (u[1] ? "<lastmod>" + u[1] + "</lastmod>" : "") + "</url>";
  }).join("\n") + '\n</urlset>\n',"utf8");
fs.writeFileSync(path.join(dist,"sitemap.txt"), sitemapUrls.map(function(u){ return /^https:\/\//.test(u[0]) ? u[0] : SITE + u[0]; }).join("\n") + "\n", "utf8");

// Preserve the hand-written robots.txt from public/ (explicit Allow rules for AI
// crawlers); make sure both sitemaps are referenced.
var robotsSrc = path.join("public","robots.txt");
var robotsTxt = fs.existsSync(robotsSrc)
  ? fs.readFileSync(robotsSrc,"utf8")
  : "User-agent: *\nAllow: /\nDisallow: /api/\n";
robotsTxt = robotsTxt.replace(/^\s*Sitemap:.*$/gim, "").replace(/\s*$/,"");
// sitemaps.prophetic.pw is a Cloudflare Worker that proxies prophetic.pw's
// /sitemap.xml, /sitemap.txt and /blog/feed.xml (works around GSC "Couldn't fetch"
// on Vercel). The locs inside the sitemap stay https://prophetic.pw/...
robotsTxt += "\n\nSitemap: " + SITE + "/sitemap.xml\nSitemap: https://sitemaps.prophetic.pw/sitemap.xml\nSitemap: " + SITE + "/sitemap.txt\n";
fs.writeFileSync(path.join(dist,"robots.txt"), robotsTxt,"utf8");

var AUTHOR_SCHEMA = {
  "@context":"https://schema.org","@type":"Person","@id":SITE + "/author/hedi-touati/#person",
  name:"Hedi Touati", url:SITE + "/author/hedi-touati/", jobTitle:"Founder & Editor",
  description:"Founder and editor of Prophetic. Computes the site\u2019s astrology dates from ephemeris data and edits every guide before publication.",
  worksFor:{"@type":"Organization","name":"Prophetic","url":SITE + "/"},
  knowsAbout:["Astrology","Birth charts","Planetary transits","Retrograde motion","Moon phases"]
};

var AUTHOR_PROFILE_SCHEMA = {
  "@context":"https://schema.org","@type":"ProfilePage","url":SITE + "/author/hedi-touati/",
  "mainEntity":Object.assign({}, AUTHOR_SCHEMA, {"@context":undefined})
};
var HOME_SCHEMA = [
  {"@context":"https://schema.org","@type":"WebSite","@id":SITE + "/#website","name":"Prophetic","url":SITE + "/","inLanguage":"en-US",
   "description":"Astrology guides with dates computed to the minute: retrogrades, eclipses, moon phases and plain-language birth chart explainers.",
   "publisher":{"@id":SITE + "/#organization"}},
  {"@context":"https://schema.org","@type":"Organization","@id":SITE + "/#organization","name":"Prophetic","url":SITE + "/",
   "logo":{"@type":"ImageObject","url":SITE + "/logo.svg"},"founder":{"@id":SITE + "/author/hedi-touati/#person"}}
];

staticPages.concat(reviewPages).forEach(function(p){
  var heading = p[1].replace(" | Prophetic","").replace(/^Prophetic — /,"");
  var body;
  if (p[0] === "/") {
    body = HOMEPAGE_BODY;
  } else if (p[0] === "/topics/") {
    body = topicsBody();
  } else {
    body = "<h1>"+esc(heading)+"</h1><p>"+esc(p[2])+"</p>"
         + (PAGE_INTRO[p[0]] || "")
         + "<section><h2>More from Prophetic</h2>"
         + "<h3>Latest astrology guides</h3>"+postsList(false)
         + "<h3>Explore</h3>"+EXPLORE_LIST
         + "</section>";
  }
  var ACTIVE = { "/": "home", "/about/": "about", "/contact/": "contact", "/topics/": "topics" };
  writeRoute(p[0],html(SITE+p[0],p[1],p[2],body,
    p[0] === "/author/hedi-touati/" ? AUTHOR_PROFILE_SCHEMA : (p[0] === "/" ? HOME_SCHEMA : null),
    isNoindex(p[0]) ? "noindex,follow" : null, ACTIVE[p[0]]));
});

articles.forEach(function(a){
  var url = SITE + "/article/" + a.slug + "/";
  var body = "<header><p>"+esc(a.category || "Prophetic")+"</p><h1>"+esc(a.title)+"</h1><p>"+esc(a.meta_description || "")+"</p></header><div>"+markdown(a.content)+"</div>";
  writeRoute("/article/"+a.slug+"/",html(url,a.title+" | Prophetic",a.meta_description || a.title,body,null,"noindex,follow"));
});

fs.writeFileSync(path.join(dist,"404.html"),
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><title>Page Not Found | Prophetic</title></head><body><main><h1>Page Not Found</h1><p>The page you requested does not exist.</p><a href="/">Return to Prophetic</a></main></body></html>');

["manifest.json","ads.txt","googlec2dbc31ac222183d.html","favicon.ico","favicon.svg","logo.svg","icon-192.png","icon-512.png","og-image.jpg","BingSiteAuth.xml"].forEach(function(f){
  var src=path.join("public",f), dst=path.join(dist,f);
  if(fs.existsSync(src)){fs.copyFileSync(src,dst);}
});
fs.writeFileSync(path.join(dist,"CNAME"),"prophetic.pw\n","utf8");
console.log("SEO build generated " + articles.length + " article pages and " + urls.length + " sitemap URLs.");
