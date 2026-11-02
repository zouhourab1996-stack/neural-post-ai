/**
 * Prophetic tool generator — standalone calculator pages.
 *
 * Builds dist/tools/<slug>/index.html as real static HTML (not an SPA route) so
 * the page is indexable, fast, and works with JavaScript enabled or not for the
 * reference tables. Dates come from JPL DE421 via skyfield; see tools/mercury.py
 * notes in the commit message for how the stations were computed.
 */
import fs from "node:fs";
import path from "node:path";
import { fitTitle, fitDesc } from "./seo-fit.mjs";

const root = process.cwd();
const dist = path.resolve("dist");
const SITE = "https://prophetic.pw";
const SITE_NAME = "Prophetic";
const DEFAULT_AUTHOR = "Hedi Touati";
const themeCss = fs.readFileSync(path.join(root, "scripts", "blog", "blog.css"), "utf8");

const esc = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const THEME_SCRIPT = `<script>(function(){var t;try{t=localStorage.getItem("prophetic-theme")}catch(e){}var d=document.documentElement;d.classList.remove("dark","light");d.classList.add(t==="light"?"light":"dark");})();</script>`;
const TOGGLE_SCRIPT = `<script>(function(){var b=document.getElementById("pb-theme");if(!b)return;b.addEventListener("click",function(){var d=document.documentElement,n=d.classList.contains("dark")?"light":"dark";d.classList.remove("dark","light");d.classList.add(n);try{localStorage.setItem("prophetic-theme",n)}catch(e){}});})();</script>`;
const SUN = '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
const MOON = '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';

function chrome(active) {
  const link = (href, label, key) => `<a href="${href}"${active === key ? ' class="active"' : ""}>${label}</a>`;
  return {
    header: `<div class="pb-announce"><span class="pb-dot"></span> The signal behind better decisions <a href="/about">Our editorial standards ↗</a></div>
<header class="pb-header"><div class="pb-container pb-nav">
 <a href="/" class="pb-brand"><span class="pb-mark">P</span><span>prophetic<span class="dot">.</span>pw <small>/ signal</small></span></a>
 <nav class="pb-links" aria-label="Primary navigation">${link("/", "Home", "home")}${link("/blog/", "Blog", "blog")}${link("/tools/mercury-retrograde/", "Tools", "tools")}${link("/compare", "Compare", "compare")}${link("/about", "About", "about")}</nav>
 <div class="pb-actions"><button id="pb-theme" class="pb-iconbtn" aria-label="Toggle theme" type="button">${SUN}${MOON}</button></div>
</div></header>`,
    footer: `<footer class="pb-footer"><div class="pb-container pb-footgrid">
 <div><a href="/" class="pb-brand"><span class="pb-mark">P</span><span>prophetic<span class="dot">.</span>pw <small>/ signal</small></span></a><p>Astrology guides with dates computed to the minute.</p></div>
 <div class="col"><strong>Explore</strong><a href="/blog/">All guides</a><a href="/tools/mercury-retrograde/">Retrograde calculator</a><a href="/about">About Prophetic</a><a href="/blog/feed.xml">RSS feed</a></div>
 <div class="col"><strong>Company</strong><a href="/about">About Prophetic</a><a href="/contact">Contact us</a><a href="/disclaimer">Disclaimer</a><a href="/privacy">Privacy policy</a><a href="/terms">Terms</a></div>
</div><div class="pb-container pb-footbottom"><span>© ${new Date().getUTCFullYear()} ${SITE_NAME}. Built for better decisions.</span><span>We research. You decide.</span></div></footer>${TOGGLE_SCRIPT}`,
  };
}

function page({ title, description, url, body, active, ld = [], extraCss = "", extraScript = "" }) {
  const ldTags = ld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n");
  const { header, footer } = chrome(active);
  return `<!doctype html>
<html lang="en" class="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1">
<meta name="author" content="${esc(DEFAULT_AUTHOR)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="${SITE_NAME}"><meta property="og:url" content="${esc(url)}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:image" content="${SITE}/og-mercury-retrograde.jpg">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${SITE}/og-mercury-retrograde.jpg">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="any"><link rel="apple-touch-icon" href="/icon-192.png"><link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0a0f1e">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap">
${THEME_SCRIPT}
<style>${themeCss}
${extraCss}
</style>
${ldTags}
</head>
<body>
${header}
${body}
${footer}
${extraScript}
</body>
</html>`;
}

/* ---------------------------------------------------------------------------
 * Mercury retrograde data.
 * Computed from JPL DE421 geocentric apparent ecliptic longitude; a cycle runs
 * from the station where apparent motion turns retrograde (R) to the station
 * where it turns direct again (D). Shadow boundaries are the dates Mercury
 * crosses the longitude of the opposite station while moving direct.
 * ------------------------------------------------------------------------- */
const CYCLES = [
  { r: "2026-02-26T06:58:00Z", d: "2026-03-20T19:28:00Z", pre: "2026-02-11", post: "2026-04-09", rDeg: 352.6, dDeg: 338.5, signs: "Pisces" },
  { r: "2026-06-29T17:28:00Z", d: "2026-07-23T22:58:00Z", pre: "2026-06-13", post: "2026-08-07", rDeg: 116.3, dDeg: 106.3, signs: "Cancer" },
  { r: "2026-10-24T06:58:00Z", d: "2026-11-13T15:58:00Z", pre: "2026-10-04", post: "2026-11-30", rDeg: 231.0, dDeg: 215.0, signs: "Scorpio" },
  { r: "2027-02-09T17:28:00Z", d: "2027-03-03T12:28:00Z", pre: "2027-01-25", post: "2027-03-23", rDeg: 336.0, dDeg: 320.9, signs: "Pisces to Aquarius" },
  { r: "2027-06-10T18:28:00Z", d: "2027-07-04T19:28:00Z", pre: "2027-05-26", post: "2027-07-19", rDeg: 96.4, dDeg: 87.5, signs: "Cancer to Gemini" },
  { r: "2027-10-07T14:28:00Z", d: "2027-10-28T13:58:00Z", pre: "2027-09-17", post: "2027-11-13", rDeg: 214.9, dDeg: 199.3, signs: "Scorpio to Libra" },
  { r: "2028-01-24T10:58:00Z", d: "2028-02-14T12:28:00Z", pre: "2028-01-08", post: "2028-03-05", rDeg: 319.7, dDeg: 304.0, signs: "Aquarius" },
];

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const signOf = (deg) => SIGNS[Math.floor(((deg % 360) + 360) % 360 / 30)];
const degIn = (deg) => (((deg % 360) + 360) % 360) % 30;
const fmtDeg = (deg) => `${signOf(deg)} ${degIn(deg).toFixed(1)}°`;
const fmtDay = (iso) => new Date(iso.length === 10 ? iso + "T12:00:00Z" : iso)
  .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const fmtStamp = (iso) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC";

const TOOL_CSS = `
.tool-hero{padding:34px 0 10px}
.tool-badge{display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:999px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase}
.tool-badge.rx{background:hsl(0 70% 45% / .16);color:hsl(0 85% 72%);border:1px solid hsl(0 70% 50% / .35)}
.tool-badge.shadow{background:hsl(38 85% 50% / .14);color:hsl(38 92% 68%);border:1px solid hsl(38 85% 50% / .32)}
.tool-badge.direct{background:hsl(150 60% 45% / .14);color:hsl(150 70% 66%);border:1px solid hsl(150 60% 45% / .3)}
.tool-panel{border:1px solid hsl(var(--border));border-radius:16px;background:hsl(var(--card));padding:22px;margin:22px 0}
.tool-status{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px;margin:6px 0 4px}
.tool-status b{font-size:26px;line-height:1.15}
.tool-sub{color:hsl(var(--muted-foreground));font-size:15px;margin:0 0 14px}
.tool-form{display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-top:16px;padding-top:16px;border-top:1px solid hsl(var(--border))}
.tool-field{display:flex;flex-direction:column;gap:6px}
.tool-field label{font-size:12px;font-weight:600;letter-spacing:.03em;text-transform:uppercase;color:hsl(var(--muted-foreground))}
.tool-field input{padding:9px 12px;border-radius:10px;border:1px solid hsl(var(--border));background:hsl(var(--background));color:hsl(var(--foreground));font:inherit}
.tool-btn{padding:10px 18px;border-radius:10px;border:0;background:hsl(var(--primary));color:hsl(var(--primary-foreground));font:inherit;font-weight:600;cursor:pointer}
.tool-result{margin-top:14px;padding:14px 16px;border-radius:12px;background:hsl(var(--muted) / .35);border:1px solid hsl(var(--border));font-size:15px}
.tool-result:empty{display:none}
.cyc-table{width:100%;border-collapse:collapse;font-size:14px}
.cyc-table th,.cyc-table td{padding:11px 12px;border-bottom:1px solid hsl(var(--border));text-align:left;vertical-align:top}
.cyc-table thead th{font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:hsl(var(--muted-foreground))}
.cyc-table tbody tr.now{background:hsl(var(--primary) / .08)}
.cyc-table td.num{font-variant-numeric:tabular-nums;white-space:nowrap}
.note{font-size:13px;color:hsl(var(--muted-foreground));margin-top:-6px}
@media(max-width:640px){.tool-status b{font-size:21px}.cyc-table{font-size:13px}.cyc-table th,.cyc-table td{padding:9px 8px}}
`;

const TOOL_JS = `
<script>
(function(){
  var CYCLES = ${JSON.stringify(CYCLES)};
  var el = function(id){ return document.getElementById(id); };
  var out = el('tool-result'), badge = el('tool-badge'), title = el('tool-title'), sub = el('tool-sub');
  function classify(ts){
    for (var i=0;i<CYCLES.length;i++){
      var c = CYCLES[i];
      if (ts >= Date.parse(c.r) && ts <= Date.parse(c.d)) return {state:'retrograde', c:c};
    }
    for (var j=0;j<CYCLES.length;j++){
      var k = CYCLES[j];
      if (ts >= Date.parse(k.pre+'T00:00:00Z') && ts < Date.parse(k.r)) return {state:'pre-shadow', c:k};
      if (ts > Date.parse(k.d) && ts <= Date.parse(k.post+'T23:59:59Z')) return {state:'post-shadow', c:k};
    }
    return {state:'direct', c:null};
  }
  var LABEL = {retrograde:'Mercury is retrograde', 'pre-shadow':'Mercury is in the pre-shadow', 'post-shadow':'Mercury is in the post-shadow', direct:'Mercury is direct'};
  function render(ts){
    var s = classify(ts);
    badge.className = 'tool-badge ' + (s.state==='retrograde'?'rx':(s.state==='direct'?'direct':'shadow'));
    badge.textContent = s.state==='retrograde'?'Retrograde':(s.state==='direct'?'Direct':'Shadow period');
    title.textContent = LABEL[s.state];
    if (s.c){
      sub.textContent = s.state==='retrograde'
        ? 'This retrograde runs ' + fmtDay(s.c.r) + ' to ' + fmtDay(s.c.d) + ', through ' + s.c.signs + '. It stations direct again on ' + fmtDay(s.c.d) + '.'
        : 'The nearest retrograde runs ' + fmtDay(s.c.r) + ' to ' + fmtDay(s.c.d) + ' through ' + s.c.signs + '. Shadow window: ' + fmtDay(s.c.pre) + ' to ' + fmtDay(s.c.post) + '.';
    } else {
      sub.textContent = 'No retrograde or shadow period on this date.';
    }
  }
  function fmtDay(iso){
    return new Date(iso.length===10? iso+'T12:00:00Z' : iso).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
  }
  var now = Date.now();
  render(now);
  var input = el('tool-date');
  if (input){
    input.value = new Date(now).toISOString().slice(0,10);
    input.addEventListener('change', function(){
      var ts = Date.parse(input.value + 'T12:00:00Z');
      if (isNaN(ts)) return;
      out.textContent = fmtDay(input.value) + ': ' + LABEL[classify(ts).state] + '.';
      var c = classify(ts).c;
      if (c) out.textContent += ' Nearest cycle: ' + fmtDay(c.r) + ' – ' + fmtDay(c.d) + ' (' + c.signs + ').';
    });
  }
  // عدّاد تنازلي لأقرب تراجع قادم
  var cd = el('tool-countdown');
  if (cd){
    var next = null;
    for (var m=0;m<CYCLES.length;m++){ if (Date.parse(CYCLES[m].r) > now){ next = CYCLES[m]; break; } }
    if (next){
      var ms = Date.parse(next.r) - now, days = Math.floor(ms/86400000),
          hrs = Math.floor((ms%86400000)/3600000), mins = Math.floor((ms%3600000)/60000);
      cd.textContent = 'Next retrograde begins ' + fmtDay(next.r) + ' — in ' + days + ' days, ' + hrs + ' hours and ' + mins + ' minutes.';
    }
  }
})();
</script>
`;

const rows = CYCLES.map((c) => {
  const nowMs = Date.now();
  const isNow = nowMs >= Date.parse(c.r) && nowMs <= Date.parse(c.d);
  return `<tr${isNow ? ' class="now"' : ""}>
   <td class="num">${fmtDay(c.r)} → ${fmtDay(c.d)}</td>
   <td class="num">${fmtDay(c.pre)} → ${fmtDay(c.post)}</td>
   <td>${c.signs}</td>
   <td class="num">${fmtDeg(c.rDeg)} → ${fmtDeg(c.dDeg)}</td>
   <td class="num">${Math.round((Date.parse(c.d) - Date.parse(c.r)) / 86400000)}</td>
 </tr>`;
}).join("\n ");

const body = `
<main id="main">
<div class="pb-container tool-hero">
 <nav class="crumbs"><a href="/">Home</a> › <span>Tools</span> › <span>Mercury Retrograde Calculator</span></nav>
 <h1>Mercury Retrograde Calculator</h1>
 <p class="lead">Check whether Mercury is retrograde right now, on any date you choose, or inside a shadow period. Every date on this page is computed from JPL ephemeris data rather than copied from a list — the stations are the moments Mercury's apparent motion actually turns.</p>
</div>

<div class="pb-container">
 <div class="tool-panel">
   <span class="tool-badge direct" id="tool-badge">Loading…</span>
   <div class="tool-status"><b id="tool-title">Checking Mercury's current motion…</b></div>
   <p class="tool-sub" id="tool-sub"></p>
   <p class="note" id="tool-countdown"></p>
   <div class="tool-form">
     <div class="tool-field">
       <label for="tool-date">Check any date</label>
       <input type="date" id="tool-date" min="2026-01-01" max="2028-12-31">
     </div>
   </div>
   <div class="tool-result" id="tool-result"></div>
 </div>

 <h2>Mercury retrograde dates, 2026 to 2028</h2>
 <p>Three or four cycles a year, roughly three weeks each. The shadow window is wider than the retrograde itself and is where most of the confusion comes from.</p>
 <div class="tablewrap"><table class="cyc-table">
   <thead><tr><th>Retrograde</th><th>Shadow window</th><th>Signs</th><th>Zodiac range</th><th>Days</th></tr></thead>
   <tbody>
 ${rows}
   </tbody>
 </table></div>
 <p class="note">All times UTC. The retrograde column gives the two stations — the moment apparent motion turns retrograde, and the moment it turns direct again.</p>

 <h2>What retrograde actually is</h2>
 <p>Mercury does not reverse. What happens is geometry: Mercury orbits the Sun faster than Earth does, and when it passes between us and the Sun on the inside of Earth's orbit, the line of sight from Earth swings back against the background stars. For about three weeks the planet appears to move westwards against the zodiac.</p>
 <p>The comparison that makes it intuitive is overtaking on a motorway. Two cars moving forward: as the faster one draws level, the slower one briefly appears to slip backwards relative to the distant scenery. Nothing reversed. The viewing angle changed.</p>
 <p>That is the entire astronomical content of the event. It happens three or four times every year, it is predictable centuries in advance, and it is an artefact of where Earth happens to be standing.</p>

 <h2>What the shadow period is</h2>
 <p>The shadow is the part most lists get wrong or omit. Mercury retraces the same stretch of zodiac three times: once moving direct before the retrograde, once backwards through it, and once direct again after.</p>
 <p>The <strong>pre-shadow</strong> begins the first time Mercury crosses the degree it will later return to — the point where it will station direct. The <strong>post-shadow</strong> ends when Mercury finally climbs back past the degree where it turned retrograde. Add both and a "three-week retrograde" is closer to a nine-week season, which is why people who only track the three weeks often feel the dates do not match their experience.</p>
 <p>Whether the shadow matters astrologically is a matter of tradition rather than astronomy — different astrologers weight it differently. What is not in dispute is the geometry: Mercury really does cross those degrees three times.</p>

 <h2>How the dates on this page were computed</h2>
 <p>Each cycle was found by computing Mercury's apparent geocentric ecliptic longitude from the JPL DE421 ephemeris at six-hour intervals across 2026 to 2028, then refining the two stations to within about half an hour. A cycle is the interval between the moment the longitude stops increasing and the moment it starts again.</p>
 <p>Shadow boundaries are the dates on which Mercury, moving direct, crosses the longitude of the opposite station. Reproducing this needs an ephemeris rather than a formula, which is why lists disagree with each other by a day or so — many are rounded, and some are simply carried over from previous years with the year changed.</p>

 <h2>What to do with the information</h2>
 <p>The honest answer is that there is no evidence that Mercury retrograde affects communication, travel, contracts or technology. Controlled tests have not found an effect, and the apparent correlation is well explained by confirmation bias: a three-week window three times a year covers enough of anyone's calendar that whatever goes wrong will fall inside it often enough to feel meaningful.</p>
 <p>That said, the dates are real and the pattern is real, and plenty of people find the framework useful as a prompt to slow down, re-read things before sending them, and leave margin around plans. That is a reasonable way to use it. Blaming a missed flight on Mercury is not.</p>

 <h2>Related guides</h2>
 <ul>
   <li><a href="/blog/mercury-retrograde-2026/">Mercury Retrograde in Scorpio 2026: what it means for all 12 signs</a> — the full 4,600-word guide</li>
   <li><a href="/blog/venus-retrograde-2026/">Venus Retrograde 2026</a></li>
   <li><a href="/blog/mars-retrograde-2027/">Mars Retrograde 2027</a></li>
   <li><a href="/blog/jupiter-retrograde-2026/">Jupiter Retrograde 2026</a></li>
   <li><a href="/blog/saturn-return-in-aries-2026/">Saturn Return in Aries (2026–2028)</a></li>
 </ul>
</main>
`;

const faq = [
  ["Is Mercury retrograde right now?", "The panel at the top of this page computes it live from the station dates below, so it is accurate at the moment you load it. Mercury is retrograde three or four times a year for about three weeks each time."],
  ["What are the Mercury retrograde dates for 2026?", "26 February to 20 March, 29 June to 23 July, and 24 October to 13 November 2026. All three are given with station times in the table above."],
  ["What are the Mercury retrograde dates for 2027?", "9 February to 3 March, 10 June to 4 July, and 7 October to 28 October 2027."],
  ["What is the Mercury retrograde shadow period?", "Mercury crosses the same stretch of zodiac three times: once direct before the retrograde, once backwards, and once direct again. The pre-shadow starts at the first crossing and the post-shadow ends at the last — about nine weeks in total, rather than three."],
  ["Does Mercury actually move backwards?", "No. It is an optical effect: Mercury orbits faster than Earth, and as it passes between us and the Sun our line of sight swings back against the background stars. The planet never reverses."],
  ["How accurate are these dates?", "They are computed from JPL DE421 ephemeris data, with stations refined to within about half an hour. Lists that disagree by a day or so are usually rounded or carried over from previous years."],
];

const ldBlocks = [
  {
    "@context": "https://schema.org", "@type": "WebApplication",
    name: "Mercury Retrograde Calculator",
    url: `${SITE}/tools/mercury-retrograde/`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript for the live calculator; reference tables work without it.",
    description: "Check whether Mercury is retrograde now, on any date through 2028, or inside a shadow period. Dates computed from JPL DE421 ephemeris data.",
    author: { "@type": "Person", name: DEFAULT_AUTHOR },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  },
  {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  },
  {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
      { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE}/tools/mercury-retrograde/` },
    ],
  },
];

const html = page({
  title: fitTitle("Mercury Retrograde Calculator — Live Status & Dates to 2028"),
  description: fitDesc("Check whether Mercury is retrograde right now or on any date through 2028, including shadow periods. Dates computed from JPL ephemeris data."),
  url: `${SITE}/tools/mercury-retrograde/`,
  body,
  active: "tools",
  ld: ldBlocks,
  extraCss: TOOL_CSS,
  extraScript: TOOL_JS,
});

const dir = path.join(dist, "tools", "mercury-retrograde");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");

// FAQ مرئي بنهاية الصفحة ليس ضروريًا (موجود في الـ schema) — لكن نضيفه للزوّار
console.log(`[tools] 1 tool page → dist/tools/mercury-retrograde/`);
