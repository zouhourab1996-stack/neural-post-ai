import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { TRACKING_HEAD, ADSENSE_HEAD } from "./head-tags.mjs";
import { fitDesc, fitTitle } from "./seo-fit.mjs";
import { chrome, themeCss, THEME_SCRIPT, FONT_LINKS } from "./site-chrome.mjs";
import { ADS_CSS, adHomepage } from "./ads.mjs";
import { STATIC_FAQ } from "./static-faq.mjs";

const dist = path.resolve("dist");
const SITE = "https://prophetic.pw";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_KEY;

const staticPages = [
  ["/", "Prophetic — Astrology Guides & Free Profection Calculator", "Explore astrology guides, moon phases, eclipses and birth-chart tools. Use our free annual profection calculator to find your house, zodiac sign and Time Lord."],
  ["/about/", "About Prophetic — Our Editorial Approach", "Who publishes Prophetic, how we distinguish astronomy from astrological interpretation, how we handle sources and corrections, and our editorial standards."],
  ["/contact/", "Contact the Prophetic Editorial Team", "Contact the Prophetic editorial team with corrections, sourcing questions, feedback, or a carefully researched pitch."],
  ["/privacy/", "Prophetic Privacy Policy & Data Practices", "Read Prophetic's privacy policy, including the limited data collected by the site, analytics, advertising, and your available choices."],
  ["/terms/", "Prophetic Website Terms of Service", "Read the terms that apply when you use Prophetic's astrology guides, calculators, and other published content."],
  ["/disclaimer/", "Prophetic Disclaimer", "Read Prophetic's disclaimer about astrology, general information, AI-assisted publishing, editorial independence, and professional advice boundaries."],
  ["/editorial/", "Prophetic Editorial Policy & Standards", "Learn how Prophetic distinguishes observable astronomy from astrological interpretation, identifies sources, handles corrections, and protects editorial independence."],
  ["/ai-policy/", "Prophetic AI Content Policy & Human Review", "Learn where automation may assist site operations and why sources, factual claims, dates and safety must be checked before publication."],
  ["/sitemap/", "Prophetic HTML Sitemap & Article Index", "Browse Prophetic's public pages, astrology guides, dated event explainers, calculators, and the latest published articles."],
  ["/topics/", "Astrology Topics: Retrogrades, Moons & Charts | Prophetic", "Every Prophetic astrology guide grouped by topic: retrogrades, zodiac seasons, moon phases and sky events, birth charts, numerology and tarot, and reading costs."],
  ["/profection-year-calculator/", "Profection Year Calculator: Find Your Time Lord", "Calculate your annual profection year by age and rising sign. Find the activated whole-sign house, profected zodiac sign and traditional year lord."],
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
  title = fitTitle(title);
  var d = fitDesc(description || title);
  var jsonList = Array.isArray(json) ? json.slice() : (json ? [json] : []);
  var orgSchema = {"@context":"https://schema.org","@type":"Organization","@id":SITE + "/#organization","name":"Prophetic","url":SITE + "/","logo":{"@type":"ImageObject","url":SITE + "/logo.svg"}};
  if (!jsonList.some(function(j){ return j && j["@type"] === "Organization"; })) jsonList.push(orgSchema);
  jsonList.push({"@context":"https://schema.org","@type":"WebSite","@id":SITE + "/#website","name":"Prophetic","url":SITE + "/","publisher":{"@id":SITE + "/#organization"},"inLanguage":"en-US"});
  jsonList.push({"@context":"https://schema.org","@type":"WebPage","@id":url + "#webpage","url":url,"name":title,"description":d,"isPartOf":{"@id":SITE + "/#website"},"publisher":{"@id":SITE + "/#organization"},"inLanguage":"en-US"});
  var faqRows = STATIC_FAQ[new URL(url).pathname] || [];
  if (faqRows.length) jsonList.push({"@context":"https://schema.org","@type":"FAQPage","mainEntity":faqRows.map(function(row){ return {"@type":"Question","name":row[0],"acceptedAnswer":{"@type":"Answer","text":row[1]}}; })});
  var schemaTag = jsonList.map(function(j){ return '<script type="application/ld+json">' + JSON.stringify(j) + "</script>"; }).join("");
  var c = chrome(active);
  var faqHtml = faqRows.length ? '<section class="pb-faq"><h2>Frequently asked questions</h2>' + faqRows.map(function(row){ return '<details><summary>' + esc(row[0]) + '</summary><p>' + esc(row[1]) + '</p></details>'; }).join('') + '</section>' : '';
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
    ([SITE + "/", SITE + "/topics/", SITE + "/profection-year-calculator/"].includes(url) ? ADSENSE_HEAD : "") +
    '<link rel="alternate" type="application/rss+xml" title="Prophetic Blog" href="' + SITE + '/blog/feed.xml">' +
    FONT_LINKS + THEME_SCRIPT +
    '<style>' + themeCss + (url === SITE + "/" ? ADS_CSS : "") + '</style>' + schemaTag + '</head><body>' + c.header +
    '<main class="pb-container"><article class="pb-post"><div class="pb-body">' + body + faqHtml + '</div></article></main>' +
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
  ['/ai-policy/','AI content policy'], ['/contact/','Contact'], ['/profection-year-calculator/','Annual profection calculator'], ['/sitemap/','HTML sitemap']
].map(function(x){ return '<li><a href="' + x[0] + '">' + x[1] + '</a></li>'; }).join('') + '</ul>';
var HOMEPAGE_BODY = ''
 + '<h1>Astrology guides with context and sources</h1>'
 + '<p>Prophetic is an independent guide to astrology, birth-chart concepts and observable sky events. We distinguish astronomical observations from symbolic astrological interpretations, link to references where available, and explain uncertainty and time zones.</p>'
 + '<section><h2>Free Annual Profection Year Calculator</h2><p>Calculate your annual profection house, profected zodiac sign and traditional Lord of the Year using your completed age and natal rising sign. The tool uses whole-sign houses and explains the method and its limitations.</p><p><a href="/profection-year-calculator/">Use the free Profection Year Calculator</a></p></section>'
 + '<section><h2>Latest astrology guides</h2>' + postsList(true) + '</section>'
 + adHomepage()
 + '<section><h2>Explore related guides</h2><ul>'
 + '<li><a href="/blog/mercury-retrograde-2026/">Mercury retrograde 2026</a> — an explainer on the retrograde period, its dates and astrological context.</li>'
 + '<li><a href="/blog/venus-retrograde-2026/">Venus retrograde 2026</a> — a guide to the cycle and its astrological interpretation.</li>'
 + '<li><a href="/blog/jupiter-retrograde-2026/">Jupiter retrograde 2026</a> — background on the cycle and how it is discussed in astrology.</li>'

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
  return '<h1>Astrology topics</h1><p>Guides grouped by subject, with context on astronomical observations and symbolic astrological interpretations.</p>' + nav
    + groups.filter(function(g){ return g.posts.length; }).map(function(g){
      return '<section><h2 id="' + g.c[0] + '">' + esc(g.c[1]) + '</h2><p>' + esc(g.c[3]) + '</p><ul>'
        + g.posts.sort(function(a,b){ return String(b.date).localeCompare(String(a.date)); }).map(function(p){
          return '<li><a href="' + String(p.url).replace(SITE,'') + '">' + esc(p.title) + '</a>' + (p.description ? ' — ' + esc(String(p.description).slice(0,160)) : '') + '</li>';
        }).join('') + '</ul></section>';
    }).join('')
    + '<section><h2>Explore Prophetic</h2>' + EXPLORE_LIST + '</section>';
}

var PAGE_INTRO = {
 "/about/": '<p>Prophetic is an independent publication about astrology, birth-chart concepts and sky events. We distinguish astronomical observations that can be checked against external references from astrological interpretations, which are symbolic traditions rather than scientifically established predictions. Each guide should identify its sources, explain relevant time zones and make clear when information was last checked.</p>'
   + '<h2>What we publish</h2><p>Three things: dated sky-event explainers (retrogrades, eclipses, moon phases and meteor showers), chart explainers (planets, houses and aspects), and reflective-practice guides that distinguish tradition from evidence.</p>'
   + '<h2>How we work</h2><p>We aim to explain where dates and factual claims come from and link to primary references where available. We do not claim that astrological interpretations are scientific findings. If a source or detail cannot be verified, we say so rather than inventing an answer.</p>'
   + '<h2>Independence and corrections</h2><p>Prophetic carries no affiliate links and accepts no payment for coverage. Errors are corrected in place and the correction is noted in the article it affects — email the editor and the fix is published with the next update.</p>'
   + '<h2>What astrology is — and is not</h2><p>We treat astrology as a symbolic and reflective practice with a long history, not as a prediction engine and not as a substitute for medical, legal or financial advice. That boundary is stated on every page that touches health, money or major life decisions.</p>',
 "/contact/": '<p>The fastest way to reach the Prophetic editorial team is email: <a href="mailto:anistouati74@gmail.com">anistouati74@gmail.com</a>. We read everything and usually reply within two working days.</p><h2>What to write about</h2><p>Corrections (include the page address and the source you are relying on), questions about a guide, privacy requests, and advertising or partnership enquiries. Corrections are published with the next update of the article they concern.</p><h2>Who you are writing to</h2><p>Prophetic is edited by <a href="/author/hedi-touati/">Hedi Touati</a>. Read more <a href="/about/">about Prophetic</a> and our <a href="/editorial/">editorial policy</a>.</p>',
 "/editorial/": '<p>Our editorial standards: distinguish observable astronomy from astrological interpretation, identify sources for factual claims, explain uncertainty, date meaningful updates and correct verified errors transparently.</p>',
 "/ai-policy/": '<p>Automation and AI tools may assist parts of research, drafting or site operations. They are not evidence or independent verification. Content should be checked for factual accuracy, sources, dates and safety before publication; we do not claim a human review occurred unless it actually did.</p>',
 "/sitemap/": '<p>The complete list of pages and articles on Prophetic.</p>',
 "/privacy/": '<p>Last updated: November 16, 2026. Prophetic (prophetic.pw) is a static astrology publication. There are no accounts, no comment forms and no newsletter sign-up, so we do not ask you for personal information. This policy explains what data is collected when you read the site, by whom, and the choices you have.</p><h2>Information collected automatically</h2><p>Like any website, our hosting providers (Vercel and Cloudflare) receive standard technical data such as your IP address, browser type, the page requested and the time of the request. This is used to deliver pages, keep the site secure and stop abuse, and is kept only as long as those providers need it.</p><h2>Analytics</h2><p>We use Google Analytics to understand which guides are read and how visitors find them. Google Analytics uses cookies and collects data such as pages viewed, approximate location and device type. We do not use it to identify individual visitors. You can opt out with the <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener">Google Analytics opt-out browser add-on</a>.</p><h2>Advertising and cookies</h2><p>Prophetic is free to read and is funded by advertising. Ads are served by Google (Google AdSense and Google Ad Manager) and by our authorised advertising partner Advergic, as listed in our public <a href="/ads.txt">ads.txt</a> file.</p><p>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites. Google&rsquo;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet. You can read <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">how Google uses information from sites or apps that use its services</a>.</p><p>You can opt out of personalised advertising in <a href="https://adssettings.google.com" rel="noopener">Google Ads Settings</a>, or opt out of some third-party vendors&rsquo; use of cookies for personalised advertising at <a href="https://www.aboutads.info/choices/" rel="noopener">aboutads.info</a>. Blocking third-party cookies in your browser has a similar effect; every page still works without them.</p><h2>Regional advertising choices</h2><p>Ad serving and the availability of consent controls may vary by location and applicable law. You can manage Google personalised-ad preferences in <a href="https://adssettings.google.com" rel="noopener">Google Ads Settings</a> and control cookies through your browser. We do not claim that a consent prompt is active in every region; the publisher must verify the certified consent-management configuration before enabling personalised advertising where required.</p><h2>US state privacy rights</h2><p>Residents of California and other US states with privacy laws can opt out of the sale or sharing of personal information for targeted advertising through the opt-out tools above or by emailing us.</p><h2>Children</h2><p>Prophetic is a general-audience site and is not directed at children under 13. We do not knowingly collect personal information from children.</p><h2>Your rights</h2><p>Because we hold no accounts, we normally have no personal data to access, correct or delete. If you are in a jurisdiction with data protection rights and want to exercise them, email us and we will reply within 30 days. You can also complain to your local data protection authority.</p><h2>Changes and contact</h2><p>If our practices change, this page and its date change with them. Questions about privacy: <a href="mailto:anistouati74@gmail.com">anistouati74@gmail.com</a>.</p>',
 "/terms/": '<p>Last updated: November 16, 2026. These terms apply when you use prophetic.pw (&ldquo;Prophetic&rdquo;). By using the site you agree to them; if you do not, please do not use it.</p><h2>What the site is</h2><p>Prophetic publishes astrology and sky-event guides: dates of retrogrades, eclipses, moon phases and meteor showers, and explanations of astrological concepts. Astrology is presented as a symbolic and reflective practice, not as prediction or professional advice. See our <a href="/disclaimer/">disclaimer</a>.</p><h2>Use of content</h2><p>All articles, tables and images are owned by Prophetic or used under licence. You may read, link to and share our pages and quote short extracts with a link back. You may not copy articles in bulk, scrape the site automatically, or republish our content as your own.</p><h2>Accuracy</h2><p>Dates and event details can vary by source, calculation method and time zone. Where available, consult the references linked in each guide and independently verify time-critical information. Corrections are welcome through our <a href="/contact/">contact page</a>.</p><h2>Advertising</h2><p>The site shows advertising from Google and our authorised partner Advergic. Advertisers have no influence over editorial content. Please do not click ads to support us: artificial clicks break advertisers&rsquo; rules. Details are in our <a href="/privacy/">privacy policy</a>.</p><h2>External links</h2><p>We link to outside sources for reference. We are not responsible for their content or practices.</p><h2>No warranty and limitation of liability</h2><p>The site is provided &ldquo;as is&rdquo; without warranties of any kind. To the extent the law allows, Prophetic is not liable for any loss arising from use of, or reliance on, the site.</p><h2>Changes and contact</h2><p>We may update these terms; the current version always appears here with its date. Questions: <a href="mailto:anistouati74@gmail.com">anistouati74@gmail.com</a>.</p>',
 "/disclaimer/": '<p>Astrology is a symbolic, reflective practice: not a prediction engine and not professional advice. This page explains what that means for how you use Prophetic.</p><h2>Not professional advice</h2><p>Nothing on Prophetic is medical, psychological, legal, financial or relationship advice. Do not make health, money, legal or safety decisions based on astrology. If you need advice, speak to a qualified professional.</p><h2>Astronomy versus astrology</h2><p>Astronomical events are measurable, but the exact details should be checked against the references linked in the relevant guide. Their astrological meaning is interpretation, offered for reflection and entertainment, and other astrologers may read the same sky differently.</p><h2>Accuracy of dates</h2><p>Event times may differ by source, calculation method and time zone. Check the source and time zone stated in each guide, and verify time-critical details independently.</p><h2>Advertising</h2><p>The site is supported by advertising from Google and our partner Advergic. Ads are labelled and are not endorsements; advertisers do not see or approve our articles. Prophetic carries no affiliate links.</p><h2>Questions</h2><p>Email <a href="mailto:anistouati74@gmail.com">anistouati74@gmail.com</a>.</p>',
 "/author/hedi-touati/": "<p>Hedi Touati is the founder and editor of Prophetic, an independent publication about astrology, birth-chart concepts and sky events. This profile identifies the person responsible for the publication's editorial direction.</p>"
   + '<h2>What he does here</h2><p>Prophetic covers retrograde stations, eclipses, moon phases, meteor showers and birth-chart concepts. Astronomical observations and dates should be checked against the cited external references; astrological meanings are presented as interpretations, not established scientific conclusions.</p>'
   + '<h2>Background</h2><p>Prophetic began as a set of private notes on retrograde dates — the kind of table you build when you are tired of websites that disagree with each other by a day. It is now a public reference for people who want to check the sky for themselves: what is happening, when exactly, and what it means for a chart.</p>'
   + '<h2>Standards and independence</h2><p>Prophetic is supported by display advertising. Advertising does not constitute an editorial endorsement. Any commercial relationships or sponsored links should be clearly disclosed where they appear. Corrections are published on the article they affect, with the date of the change. The full standards are in the <a href="/editorial/">editorial policy</a>.</p>'
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
var STATIC_LASTMOD = "2026-11-21"; // editorial identity and methodology copy updated
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
// Keep one authoritative, same-host XML sitemap. A second cross-host sitemap
// endpoint on sitemaps.prophetic.pw is unnecessary and can complicate property
// verification and fetch diagnostics in Search Console.
robotsTxt += "\n\nSitemap: " + SITE + "/sitemap.xml\n";
fs.writeFileSync(path.join(dist,"robots.txt"), robotsTxt,"utf8");

var AUTHOR_SCHEMA = {
  "@context":"https://schema.org","@type":"Person","@id":SITE + "/author/hedi-touati/#person",
  name:"Hedi Touati", url:SITE + "/author/hedi-touati/", jobTitle:"Founder & Editor",
  description:"Founder and editor of Prophetic, an independent publication about astrology, birth-chart concepts and sky events.",
  worksFor:{"@type":"Organization","@id":SITE + "/#organization","name":"Prophetic","url":SITE + "/","logo":{"@type":"ImageObject","url":SITE + "/logo.svg"}},
  knowsAbout:["Astrology","Birth charts","Planetary transits","Retrograde motion","Moon phases"]
};

var AUTHOR_PROFILE_SCHEMA = {
  "@context":"https://schema.org","@type":"ProfilePage","url":SITE + "/author/hedi-touati/",
  "mainEntity":Object.assign({}, AUTHOR_SCHEMA, {"@context":undefined})
};
var HOME_SCHEMA = [
  {"@context":"https://schema.org","@type":"WebSite","@id":SITE + "/#website","name":"Prophetic","url":SITE + "/","inLanguage":"en-US",
   "description":"Astrology, birth-chart concepts and sky-event guides, with a clear distinction between astronomical observations and symbolic astrological interpretations.",
   "publisher":{"@id":SITE + "/#organization"}},
  {"@context":"https://schema.org","@type":"Organization","@id":SITE + "/#organization","name":"Prophetic","url":SITE + "/",
   "logo":{"@type":"ImageObject","url":SITE + "/logo.svg"},"founder":{"@id":SITE + "/author/hedi-touati/#person"}}
];

staticPages.concat(reviewPages).forEach(function(p){
  // This route is a hand-authored interactive calculator copied from public/.
  if (p[0] === "/profection-year-calculator/") return;
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
  writeRoute(p[0],html(SITE+p[0],p[0] === "/" ? fitTitle(p[1]) : fitTitle((p[1].length <= 46 ? p[1] : fitTitle(p[1].slice(0,46))) + " | Prophetic"),p[2],body,
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
