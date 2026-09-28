/*
 * Prophetic Blog generator — zero-dependency static blog built from /content/blog.
 *
 *   content/blog/<slug>.md    Markdown + YAML-ish front matter
 *   content/blog/<slug>.html  HTML fragment (body only) with front matter in a leading <!-- ... --> comment
 *   Files starting with "_" and posts with `draft: true` are ignored.
 *
 * Output (inside dist/):
 *   blog/index.html, blog/page/N/, blog/<slug>/index.html, blog/tag/<tag>/, blog/feed.xml, blog/manifest.json
 *
 * Runs after `vite build` (see package.json). generate-seo.mjs reads blog/manifest.json for the sitemap.
 */
import fs from "node:fs";
import path from "node:path";

const SITE = "https://prophetic.pw";
const SITE_NAME = "Prophetic";
const BLOG_TITLE = "Prophetic Blog";
const BLOG_DESCRIPTION = "Long-form guides, data-checked forecasts and deep dives from the Prophetic editorial team.";
const DEFAULT_AUTHOR = "Prophetic Editorial Team";
const DEFAULT_IMAGE = SITE + "/og-image.jpg";
const NETWORK = [
  { name: "Pro Reviewer", url: "https://www.pro-reviewer.cyou/", title: "Pro Reviewer — honest, in-depth product reviews", blurb: "Honest, in-depth reviews of digital and physical products." },
  { name: "Prophetic Guidance 2026", url: "https://propheticguidance2026.blogspot.com/", title: "Prophetic Guidance 2026 — spiritual reflection and mindfulness", blurb: "Grounded spiritual reflection, mindfulness and practical ancient wisdom." },
  { name: "BmrCalc", url: "https://www.bmrcalc.bond/", title: "BmrCalc — free BMR and daily calorie calculator", blurb: "Free BMR and daily-calorie calculator (Mifflin-St Jeor)." },
];
const networkBlock = () => `<aside class="pb-network" aria-label="Our other websites"><span class="eyebrow accent">Our network</span><h2>More from the people behind Prophetic</h2><p>Independent sites, same standards.</p><div class="pb-netbtns">${NETWORK.map((n) => `<a class="netbtn" href="${n.url}" target="_blank" rel="noopener" title="${esc(n.title)}"><strong>${esc(n.name)} ↗</strong><span>${esc(n.blurb)}</span></a>`).join("")}</div></aside>`;
const POSTS_PER_PAGE = 12;
const WORDS_PER_MINUTE = 200;

const root = process.cwd();
const contentDir = path.join(root, "content", "blog");
const dist = path.join(root, "dist");
const blogDist = path.join(dist, "blog");
const themeCss = fs.readFileSync(path.join(root, "scripts", "blog", "blog.css"), "utf8");

// ------------------------------------------------------------------ helpers
const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const slugify = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "section";
const stripTags = (h) => String(h).replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const wordCount = (h) => stripTags(h).split(/\s+/).filter(Boolean).length;
const fmtDate = (iso) => new Date(iso + (iso.length === 10 ? "T12:00:00Z" : "")).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
const isoDate = (iso) => new Date(iso + (iso.length === 10 ? "T12:00:00Z" : "")).toISOString();
const writeFile = (rel, content) => { const p = path.join(dist, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, content, "utf8"); };
const uniq = (arr) => Array.from(new Set(arr));

function parseValue(raw) {
  const v = raw.trim();
  if (/^\[.*\]$/.test(v)) return v.slice(1, -1).split(",").map((x) => x.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
  if (v === "true") return true;
  if (v === "false") return false;
  return v.replace(/^["']|["']$/g, "");
}

function parseFrontMatter(raw, ext) {
  let fm = "", body = raw;
  if (ext === ".md") {
    const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
    if (m) { fm = m[1]; body = raw.slice(m[0].length); }
  } else {
    const m = raw.match(/^\s*<!--\s*\n?([\s\S]*?)\n?\s*-->\s*\n?/);
    if (m) { fm = m[1]; body = raw.slice(m[0].length); }
  }
  const meta = {};
  fm.split("\n").forEach((line) => {
    const mm = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (mm) meta[mm[1]] = parseValue(mm[2]);
  });
  if (typeof meta.tags === "string") meta.tags = meta.tags.split(",").map((t) => t.trim()).filter(Boolean);
  if (!Array.isArray(meta.tags)) meta.tags = [];
  return { meta, body };
}

// ------------------------------------------------------------------ markdown (trusted content: raw HTML passes through)
function inline(text) {
  const codes = [];
  let t = text.replace(/`([^`]+)`/g, (_, c) => { codes.push("<code>" + esc(c) + "</code>"); return "\u0000" + (codes.length - 1) + "\u0000"; });
  t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, alt, src, title) => `<img src="${esc(src)}" alt="${esc(alt)}"${title ? ` title="${esc(title)}"` : ""} loading="lazy" decoding="async">`);
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, txt, href, title) => `<a href="${esc(href)}"${title ? ` title="${esc(title)}"` : ""}${/^https?:\/\//.test(href) && !href.startsWith(SITE) ? ' rel="noopener" target="_blank"' : ""}>${txt}</a>`);
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/__([^_]+)__/g, "<strong>$1</strong>");
  t = t.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>").replace(/(^|[\s(])_([^_\n]+)_(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>");
  t = t.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  t = t.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[Number(i)]);
  return t;
}

function renderMarkdown(src, ctx = { ids: new Map() }) {
  const lines = String(src).replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  let i = 0;
  const isBlank = (l) => /^\s*$/.test(l);
  const listRe = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
  const headingId = (text) => { let id = slugify(text); const n = ctx.ids.get(id) || 0; ctx.ids.set(id, n + 1); return n ? `${id}-${n + 1}` : id; };
  while (i < lines.length) {
    const line = lines[i];
    if (isBlank(line)) { i++; continue; }
    if (/^```/.test(line)) {
      const lang = line.slice(3).trim(); const buf = []; i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push(`<pre><code${lang ? ` class="language-${esc(lang)}"` : ""}>${esc(buf.join("\n"))}</code></pre>`);
      continue;
    }
    if (/^:::\s*[\w-]+/.test(line)) {
      const m = line.match(/^:::\s*([\w-]+)\s*(.*)$/); const buf = []; i++;
      while (i < lines.length && !/^:::\s*$/.test(lines[i])) buf.push(lines[i++]);
      i++;
      const map = { tldr: "tldr", "quick-answer": "tldr", summary: "tldr", note: "note", tip: "note", info: "note", callout: "callout", important: "callout", warning: "callout warn", danger: "callout warn", toc: "toc" };
      const cls = map[m[1]] || "callout";
      const title = m[2] ? `<p class="box-title">${inline(m[2])}</p>` : "";
      out.push(`<div class="${cls}">${title}${renderMarkdown(buf.join("\n"), ctx)}</div>`);
      continue;
    }
    if (/^\s*<(\/?[a-zA-Z!])/.test(line)) { // raw HTML block until blank line
      const buf = [];
      while (i < lines.length && !isBlank(lines[i])) buf.push(lines[i++]);
      out.push(buf.join("\n"));
      continue;
    }
    let m;
    if ((m = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/))) {
      const lvl = m[1].length; const text = m[2];
      out.push(`<h${lvl} id="${headingId(text)}">${inline(text)}</h${lvl}>`); i++; continue;
    }
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { out.push("<hr>"); i++; continue; }
    if (/^\s*>/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) buf.push(lines[i++].replace(/^\s*>\s?/, ""));
      out.push(`<blockquote>${renderMarkdown(buf.join("\n"), ctx)}</blockquote>`); continue;
    }
    if (/\|/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1])) {
      const splitRow = (r) => r.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      const header = splitRow(line); const aligns = splitRow(lines[i + 1]).map((a) => (/^:-+:$/.test(a) ? "center" : /-+:$/.test(a) ? "right" : "left"));
      i += 2; const rows = [];
      while (i < lines.length && /\|/.test(lines[i]) && !isBlank(lines[i])) rows.push(splitRow(lines[i++]));
      const th = header.map((c, k) => `<th style="text-align:${aligns[k] || "left"}">${inline(c)}</th>`).join("");
      const tb = rows.map((r) => `<tr>${r.map((c, k) => `<td style="text-align:${aligns[k] || "left"}">${inline(c)}</td>`).join("")}</tr>`).join("");
      out.push(`<div class="tablewrap"><table><thead><tr>${th}</tr></thead><tbody>${tb}</tbody></table></div>`); continue;
    }
    if (listRe.test(line)) {
      const block = [];
      while (i < lines.length && !isBlank(lines[i]) ) block.push(lines[i++]);
      // allow list continuation after single blank line if next non-blank line is an indented item
      while (i + 1 < lines.length && isBlank(lines[i]) && /^\s{2,}\S/.test(lines[i + 1] || "")) { i++; while (i < lines.length && !isBlank(lines[i])) block.push(lines[i++]); }
      out.push(renderList(block, ctx)); continue;
    }
    const buf = [];
    while (i < lines.length && !isBlank(lines[i]) && !/^(#{1,6}\s|```|:::|\s*>|\s*<[a-zA-Z!\/])/.test(lines[i]) && !listRe.test(lines[i])) buf.push(lines[i++]);
    if (buf.length) out.push(`<p>${inline(buf.join("\n").replace(/ {2,}\n/g, "<br>\n"))}</p>`);
    else { out.push(`<p>${inline(lines[i])}</p>`); i++; }
  }
  return out.join("\n");
}

function renderList(block, ctx) {
  const listRe = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
  const first = block[0].match(listRe);
  const base = first[1].length; const ordered = /\d/.test(first[2]);
  const items = []; let cur = null;
  for (const l of block) {
    const m = l.match(listRe); const ind = (l.match(/^\s*/) || [""])[0].length;
    if (m && ind <= base) { cur = { text: m[3], sub: [] }; items.push(cur); }
    else if (cur) cur.sub.push(l.slice(Math.min(l.length, base + 2)));
  }
  const tasks = items.length && items.every((it) => /^\[( |x|X)\]\s+/.test(it.text));
  const li = items.map((it) => {
    let text = it.text; let cls = "";
    if (tasks) { cls = /^\[(x|X)\]/.test(text) ? ' class="done"' : ""; text = text.replace(/^\[( |x|X)\]\s+/, ""); }
    const sub = it.sub.length ? renderMarkdown(it.sub.join("\n"), ctx) : "";
    return `<li${cls}>${inline(text)}${sub}</li>`;
  }).join("");
  const tag = ordered ? "ol" : "ul";
  return `<${tag}${tasks ? ' class="checklist"' : ""}>${li}</${tag}>`;
}

function buildToc(html) {
  const items = Array.from(html.matchAll(/<h2 id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)).map((m) => `<li><a href="#${m[1]}">${stripTags(m[2])}</a></li>`);
  return items.length > 1 ? `<div class="toc"><strong>On this page</strong><ol>${items.join("")}</ol></div>` : "";
}

// ------------------------------------------------------------------ load posts
function loadPosts() {
  if (!fs.existsSync(contentDir)) return [];
  const files = fs.readdirSync(contentDir).filter((f) => /\.(md|html)$/i.test(f) && !f.startsWith("_") && !/^readme\.md$/i.test(f));
  const posts = [];
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const raw = fs.readFileSync(path.join(contentDir, file), "utf8");
    const { meta, body } = parseFrontMatter(raw, ext);
    if (meta.draft === true) continue;
    if (!meta.title || !meta.date) { console.warn(`[blog] skipping ${file}: title and date are required`); continue; }
    const slug = slugify(meta.slug || path.basename(file, ext));
    let html = body, styles = "", ld = [];
    if (ext === ".md") html = renderMarkdown(body);
    // hoist <style> and JSON-LD blocks into <head>; other <script>s stay in the body
    html = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, css) => { styles += css + "\n"; return ""; });
    html = html.replace(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi, (_, j) => { ld.push(j.trim()); return ""; });
    if (meta.toc === true) { const toc = buildToc(html); html = html.includes("<!-- toc -->") ? html.replace("<!-- toc -->", toc) : toc + html; }
    html = html.replace(/<img(?![^>]*\bloading=)/gi, '<img loading="lazy" decoding="async"');
    const words = wordCount(html);
    const image = meta.image ? (meta.image.startsWith("http") ? meta.image : SITE + meta.image) : DEFAULT_IMAGE;
    posts.push({
      slug, file, html, styles, ld, words,
      title: String(meta.title), seoTitle: String(meta.seoTitle || meta.title), description: String(meta.description || "").slice(0, 300),
      date: String(meta.date), updated: String(meta.updated || meta.date),
      author: String(meta.author || DEFAULT_AUTHOR),
      tags: uniq(meta.tags.map(String)), category: String(meta.category || meta.tags[0] || "Guides"),
      image, imageAlt: String(meta.imageAlt || meta.title), showImage: meta.showImage !== false && !!meta.image,
      readingTime: Math.max(1, Math.round(wordCount(html.replace(/<table[\s\S]*?<\/table>/gi, " ")) / WORDS_PER_MINUTE)),
      canonical: meta.canonical || `${SITE}/blog/${slug}/`, url: `${SITE}/blog/${slug}/`, lang: String(meta.lang || "en"),
      noindex: meta.noindex === true,
    });
  }
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));
  const seen = new Set();
  for (const p of posts) { if (seen.has(p.slug)) throw new Error(`[blog] duplicate slug: ${p.slug}`); seen.add(p.slug); }
  return posts;
}

// ------------------------------------------------------------------ layout
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
 <nav class="pb-links" aria-label="Primary navigation">${link("/", "Home", "home")}${link("/blog/", "Blog", "blog")}${link("/compare", "Compare", "compare")}${link("/about", "About", "about")}${link("/contact", "Contact", "contact")}</nav>
 <div class="pb-actions"><a href="/blog/feed.xml" class="pb-iconbtn" aria-label="RSS feed" title="RSS feed"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg></a><button id="pb-theme" class="pb-iconbtn" aria-label="Toggle theme" type="button">${SUN}${MOON}</button></div>
</div></header>`,
    footer: `<footer class="pb-footer"><div class="pb-container pb-footgrid">
 <div><a href="/" class="pb-brand"><span class="pb-mark">P</span><span>prophetic<span class="dot">.</span>pw <small>/ signal</small></span></a><p>Independent research, long-form guides and data-checked forecasts.</p></div>
 <div class="col"><strong>Explore</strong><a href="/blog/">Blog</a><a href="/">Latest reviews</a><a href="/compare">Comparisons</a><a href="/blog/feed.xml">RSS feed</a></div>
 <div class="col"><strong>Company</strong><a href="/about">About Prophetic</a><a href="/contact">Contact us</a><a href="/disclaimer">Disclaimer</a><a href="/privacy">Privacy policy</a><a href="/terms">Terms</a></div>
 <div class="col"><strong>Our network</strong>${NETWORK.map((n) => `<a href="${n.url}" target="_blank" rel="noopener" title="${esc(n.title)}">${esc(n.name)} ↗</a>`).join("")}</div>
</div><div class="pb-container pb-footbottom"><span>© ${new Date().getUTCFullYear()} ${SITE_NAME}. Built for better decisions.</span><span>We research. You decide.</span></div></footer>${TOGGLE_SCRIPT}`,
  };
}

function page({ title, description, url, body, active, ld = [], extraCss = "", image = DEFAULT_IMAGE, type = "website", noindex = false, published, modified, lang = "en", feed = true }) {
  const ldTags = ld.filter(Boolean).map((j) => `<script type="application/ld+json">${typeof j === "string" ? j : JSON.stringify(j)}</script>`).join("\n");
  const { header, footer } = chrome(active);
  return `<!doctype html>
<html lang="${esc(lang)}" class="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
<meta name="robots" content="${noindex ? "noindex,follow" : "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"}">
<meta name="author" content="${esc(DEFAULT_AUTHOR)}">
<meta property="og:type" content="${type}"><meta property="og:site_name" content="${SITE_NAME}"><meta property="og:url" content="${esc(url)}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:image" content="${esc(image)}">
${published ? `<meta property="article:published_time" content="${published}"><meta property="article:modified_time" content="${modified || published}">` : ""}
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:site" content="@PropheticAI"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${esc(image)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="any"><link rel="apple-touch-icon" href="/icon-192.png"><link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0a0f1e">
${feed ? `<link rel="alternate" type="application/rss+xml" title="${BLOG_TITLE}" href="${SITE}/blog/feed.xml">` : ""}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap">
${THEME_SCRIPT}
<style>${themeCss}${extraCss ? "\n/* post styles */\n" + extraCss : ""}</style>
${ldTags}
</head>
<body>
${header}
${body}
${footer}
</body>
</html>`;
}

const card = (p, featured = false) => `<a class="pb-card${featured ? " featured" : ""}" href="/blog/${p.slug}/">
 <span class="eyebrow accent">${esc(p.category)}</span>
 ${featured ? `<h2>${esc(p.title)}</h2>` : `<h3>${esc(p.title)}</h3>`}
 <p>${esc(p.description)}</p>
 <span class="meta"><span>${fmtDate(p.date)}</span><b>${p.readingTime} min read →</b></span>
</a>`;

// ------------------------------------------------------------------ renderers
function renderPost(p, all) {
  const idx = all.indexOf(p); const prev = all[idx + 1]; const next = all[idx - 1];
  const related = all.filter((o) => o !== p && o.tags.some((t) => p.tags.includes(t))).slice(0, 3);
  const schema = {
    "@context": "https://schema.org", "@type": "BlogPosting",
    headline: p.title, description: p.description, image: [p.image],
    datePublished: isoDate(p.date), dateModified: isoDate(p.updated),
    author: { "@type": "Organization", name: p.author, url: SITE + "/about/" },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE, logo: { "@type": "ImageObject", url: SITE + "/logo.svg" } },
    mainEntityOfPage: { "@type": "WebPage", "@id": p.url }, url: p.url,
    articleSection: p.category, keywords: p.tags.join(", "), wordCount: p.words, inLanguage: p.lang === "en" ? "en-US" : p.lang,
    isPartOf: { "@type": "Blog", "@id": SITE + "/blog/#blog", name: BLOG_TITLE },
  };
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
    { "@type": "ListItem", position: 2, name: "Blog", item: SITE + "/blog/" },
    { "@type": "ListItem", position: 3, name: p.title, item: p.url } ] };
  const share = encodeURIComponent(p.url), shareT = encodeURIComponent(p.title);
  const body = `<main class="pb-container"><article class="pb-post">
 <nav class="pb-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> › <a href="/blog/">Blog</a> › <span>${esc(p.category)}</span></nav>
 <header class="pb-post-head">
  <div>${p.tags.map((t) => `<a class="kicker" href="/blog/tag/${slugify(t)}/" style="margin:0 6px 6px 0">${esc(t)}</a>`).join("")}</div>
  <h1>${esc(p.title)}</h1>
  <p class="pb-lede">${esc(p.description)}</p>
  <div class="pb-meta"><span><span class="av">${esc(p.author.slice(0, 1))}</span>${esc(p.author)}</span><span>Published <time datetime="${isoDate(p.date)}">${fmtDate(p.date)}</time></span>${p.updated !== p.date ? `<span>Updated <time datetime="${isoDate(p.updated)}">${fmtDate(p.updated)}</time></span>` : ""}<span>${p.readingTime} min read</span><span>${p.words.toLocaleString("en-US")} words</span></div>
  ${p.showImage ? `<figure class="pb-hero-img"><img src="${esc(p.image)}" alt="${esc(p.imageAlt)}" loading="eager" fetchpriority="high"></figure>` : ""}
 </header>
 <div class="pb-body">
${p.html}
 </div>
 <div class="pb-share"><span>Share:</span><a href="https://twitter.com/intent/tweet?url=${share}&text=${shareT}" rel="noopener" target="_blank">X / Twitter</a><a href="https://www.facebook.com/sharer/sharer.php?u=${share}" rel="noopener" target="_blank">Facebook</a><a href="https://www.linkedin.com/sharing/share-offsite/?url=${share}" rel="noopener" target="_blank">LinkedIn</a><a href="https://www.reddit.com/submit?url=${share}&title=${shareT}" rel="noopener" target="_blank">Reddit</a><a href="mailto:?subject=${shareT}&body=${share}">Email</a></div>
 ${networkBlock()}
 <aside class="pb-author"><div class="av">${esc(p.author.slice(0, 1))}</div><div><strong>${esc(p.author)}</strong><p>We publish data-checked guides: every date and figure is computed or sourced, not copied. Found an error? <a href="/contact">Tell us</a> and we will fix it and credit you. Last review: ${fmtDate(p.updated)}.</p></div></aside>
 ${prev || next ? `<nav class="pb-prevnext" aria-label="More posts">${prev ? `<a href="/blog/${prev.slug}/"><span>← Older</span>${esc(prev.title)}</a>` : "<span></span>"}${next ? `<a class="next" href="/blog/${next.slug}/"><span>Newer →</span>${esc(next.title)}</a>` : ""}</nav>` : ""}
 ${related.length ? `<section class="pb-related"><h2>Related guides</h2><div class="pb-grid">${related.map((r) => card(r)).join("")}</div></section>` : ""}
 <a class="pb-back" href="/blog/">← All posts</a>
</article></main>`;
  return page({ title: `${p.seoTitle} | ${SITE_NAME}`, description: p.description, url: p.canonical, body, active: "blog", ld: [schema, crumbs, ...p.ld], extraCss: p.styles, image: p.image, type: "article", noindex: p.noindex, published: isoDate(p.date), modified: isoDate(p.updated), lang: p.lang });
}

function renderList_(posts, { title, heading, description, url, base, pageNo, pages, tag, allTags }) {
  const pager = pages > 1 ? `<nav class="pb-pager" aria-label="Pagination">${Array.from({ length: pages }, (_, k) => k + 1).map((n) => n === pageNo ? `<span class="current">${n}</span>` : `<a href="${n === 1 ? base : `${base}page/${n}/`}">${n}</a>`).join("")}</nav>` : "";
  const tagBar = `<div class="pb-tags"><a class="pill${!tag ? " active" : ""}" href="/blog/">All posts</a>${allTags.map((t) => `<a class="pill${tag === t ? " active" : ""}" href="/blog/tag/${slugify(t)}/">${esc(t)}</a>`).join("")}</div>`;
  const grid = posts.length ? `<div class="pb-grid">${posts.map((p, k) => card(p, pageNo === 1 && k === 0 && !tag)).join("")}</div>` : `<p class="pb-empty">No posts yet.</p>`;
  const body = `<section class="pb-hero"><div class="pb-container"><span class="eyebrow accent">${tag ? "Topic" : "The Prophetic Blog"}</span><h1>${heading}</h1><p>${esc(description)}</p>${tagBar}</div></section>
<main class="pb-container">${grid}${pager}${networkBlock()}</main>`;
  const ld = [{ "@context": "https://schema.org", "@type": tag ? "CollectionPage" : "Blog", "@id": tag ? url : SITE + "/blog/#blog", name: title, description, url,
    blogPost: posts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: p.url, datePublished: isoDate(p.date) })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [ { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" }, { "@type": "ListItem", position: 2, name: "Blog", item: SITE + "/blog/" }, ...(tag ? [{ "@type": "ListItem", position: 3, name: tag, item: url }] : []) ] }];
  return page({ title, description, url, body, active: "blog", ld, noindex: pageNo > 1 });
}

function renderFeed(posts) {
  const items = posts.slice(0, 20).map((p) => `  <item>
   <title>${esc(p.title)}</title>
   <link>${p.url}</link>
   <guid isPermaLink="true">${p.url}</guid>
   <pubDate>${new Date(isoDate(p.date)).toUTCString()}</pubDate>
   <description>${esc(p.description)}</description>
   ${p.tags.map((t) => `<category>${esc(t)}</category>`).join("")}
  </item>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
 <channel>
  <title>${esc(BLOG_TITLE)}</title>
  <link>${SITE}/blog/</link>
  <description>${esc(BLOG_DESCRIPTION)}</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${SITE}/blog/feed.xml" rel="self" type="application/rss+xml"/>
${items}
 </channel>
</rss>
`;
}

// ------------------------------------------------------------------ main
const posts = loadPosts();
const allTags = uniq(posts.flatMap((p) => p.tags)).sort((a, b) => a.localeCompare(b));
fs.mkdirSync(blogDist, { recursive: true });

posts.forEach((p) => writeFile(`blog/${p.slug}/index.html`, renderPost(p, posts)));

const pages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
for (let n = 1; n <= pages; n++) {
  const slice = posts.slice((n - 1) * POSTS_PER_PAGE, n * POSTS_PER_PAGE);
  const rel = n === 1 ? "blog/index.html" : `blog/page/${n}/index.html`;
  const url = n === 1 ? `${SITE}/blog/` : `${SITE}/blog/page/${n}/`;
  writeFile(rel, renderList_(slice, { title: n === 1 ? `${BLOG_TITLE} — Guides, Forecasts & Deep Dives` : `${BLOG_TITLE} — Page ${n}`, heading: `Guides, forecasts<br><em>and deep dives.</em>`, description: BLOG_DESCRIPTION, url, base: "/blog/", pageNo: n, pages, tag: null, allTags }));
}
allTags.forEach((t) => {
  const slice = posts.filter((p) => p.tags.includes(t));
  writeFile(`blog/tag/${slugify(t)}/index.html`, renderList_(slice, { title: `${t} — ${BLOG_TITLE}`, heading: `${esc(t)}`, description: `${slice.length} post${slice.length === 1 ? "" : "s"} about ${t} from the Prophetic editorial team.`, url: `${SITE}/blog/tag/${slugify(t)}/`, base: `/blog/tag/${slugify(t)}/`, pageNo: 1, pages: 1, tag: t, allTags }));
});
writeFile("blog/feed.xml", renderFeed(posts));
writeFile("blog/manifest.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  index: `${SITE}/blog/`,
  tags: allTags.map((t) => ({ name: t, url: `${SITE}/blog/tag/${slugify(t)}/`, count: posts.filter((p) => p.tags.includes(t)).length })),
  pages: Array.from({ length: pages }, (_, k) => k === 0 ? `${SITE}/blog/` : `${SITE}/blog/page/${k + 1}/`),
  posts: posts.map((p) => ({ slug: p.slug, url: p.url, title: p.title, description: p.description, date: p.date, updated: p.updated, tags: p.tags, category: p.category, readingTime: p.readingTime, image: p.image })),
}, null, 2));
console.log(`[blog] ${posts.length} post(s), ${allTags.length} tag(s), ${pages} index page(s) → dist/blog/`);
