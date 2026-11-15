// Manual AdSense units, inserted at build time. Slot IDs come from scripts/ads-config.json;
// an empty slot emits nothing (no box, no reserved height). The single adsbygoogle.js loader
// lives in head-tags.mjs and is not repeated here. Auto ads stay on and fill around these.
import fs from "node:fs";
import path from "node:path";

const cfg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "scripts", "ads-config.json"), "utf8"));
const CLIENT = cfg.client || "ca-pub-3898992716389443";
const slot = (k) => String(cfg[k] || "").trim();
const PUSH = `<script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>`;

export const ADS_CSS = `
.ad-slot{display:block;clear:both;margin:28px auto;text-align:center;min-height:280px;max-width:100%;overflow:hidden;contain:layout}
.ad-slot::before{content:"Advertisement";display:block;font:500 11px/1.4 system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#8a90a2;margin-bottom:6px}
.ad-slot--leader{min-height:100px}
@media (max-width:767px){.ad-slot,.ad-slot--leader{min-height:280px}}
.ad-slot--multiplex{min-height:400px}
.ad-slot:has(ins[data-ad-status="unfilled"]){min-height:0;margin:0}
.ad-slot:has(ins[data-ad-status="unfilled"])::before{display:none}
.ad-rail{display:none}
@media (min-width:1200px){
 .pb-layout{display:grid;grid-template-columns:minmax(0,780px) 300px;gap:48px;justify-content:center;align-items:start}
 .pb-layout>.pb-post{margin:0}
 .ad-rail{display:block;padding-top:40px;align-self:stretch}
 .ad-rail__inner{position:sticky;top:88px;min-height:600px;width:300px}
 .ad-rail__inner::before{content:"Advertisement";display:block;font:500 11px/1.4 system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#8a90a2;margin-bottom:6px;text-align:center}
}`;

const display = (id, cls = "") => id ? `<div class="ad-slot${cls}"><ins class="adsbygoogle" style="display:block" data-ad-client="${CLIENT}" data-ad-slot="${id}" data-ad-format="auto" data-full-width-responsive="true"></ins>${PUSH}</div>` : "";
export const adAfterIntro = () => display(slot("afterIntro"), " ad-slot--leader");
export const adBeforeFaq = () => display(slot("beforeFaq"));
export const adHomepage = () => display(slot("homepage"));
export const adInArticle = () => slot("inArticle") ? `<div class="ad-slot"><ins class="adsbygoogle" style="display:block;text-align:center" data-ad-layout="in-article" data-ad-format="fluid" data-ad-client="${CLIENT}" data-ad-slot="${slot("inArticle")}"></ins>${PUSH}</div>` : "";
export const adMultiplex = () => slot("multiplex") ? `<div class="ad-slot ad-slot--multiplex"><ins class="adsbygoogle" style="display:block" data-ad-format="autorelaxed" data-ad-client="${CLIENT}" data-ad-slot="${slot("multiplex")}"></ins>${PUSH}</div>` : "";
export const adRail = () => slot("sidebar") ? `<aside class="ad-rail" aria-label="Advertisement"><div class="ad-rail__inner"><ins class="adsbygoogle" style="display:inline-block;width:300px;height:600px" data-ad-client="${CLIENT}" data-ad-slot="${slot("sidebar")}"></ins><script>if(window.matchMedia&&matchMedia('(min-width:1200px)').matches)(adsbygoogle=window.adsbygoogle||[]).push({});</script></div></aside>` : "";
export const hasRail = () => !!slot("sidebar");

const words = (h) => h.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
const CONTAINERS = ["div", "section", "aside", "details", "table", "ul", "ol", "blockquote", "figure", "form", "nav"];
function depthAt(html, pos) {
  const pre = html.slice(0, pos);
  let d = 0;
  for (const t of CONTAINERS) {
    d += (pre.match(new RegExp(`<${t}[\\s>]`, "gi")) || []).length;
    d -= (pre.match(new RegExp(`</${t}\\s*>`, "gi")) || []).length;
  }
  return d;
}

// A: after the intro (before the first top-level H2 once ~150 words are in).
// B: in-article before a top-level H2, >=500 words since the last unit; cap 1/2/3/4 by length.
// C: before the FAQ H2 unless a unit sits within 300 words above. No B units after the FAQ starts.
// Units are only placed at top-level H2 boundaries, never inside lists, tables, callouts or the FAQ.
export function insertAds(html, totalWords) {
  const A = adAfterIntro(), B = adInArticle(), C = adBeforeFaq();
  if (!A && !B && !C) return html;
  const max = totalWords < 1200 ? 1 : totalWords < 2500 ? 2 : totalWords < 4000 ? 3 : 4;
  // mask scripts/styles/comments (same length) so markup inside JS strings is ignored
  const masked = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, (m) => " ".repeat(m.length));
  // Body-level H2s: the shallowest nesting level among all H2s (0 for plain posts, 1 for
  // posts wrapped in a single <div class="pp-article">). Deeper H2s sit in callouts/boxes.
  const h2s = Array.from(masked.matchAll(/<h2[\s>]/gi)).map((m) => ({ i: m.index, d: depthAt(masked, m.index) }));
  if (!h2s.length) return html;
  const base = Math.min(...h2s.map((h) => h.d));
  if (base > 1) return html;
  const cuts = h2s.filter((h) => h.d === base).map((h) => h.i);
  if (!cuts.length) return html;
  const bounds = [0, ...cuts, html.length];
  let out = "", since = 0, total = 0, placedB = 0, aDone = !A, faqSeen = false, lastAdAt = -1e9;
  for (let k = 0; k < bounds.length - 1; k++) {
    const part = html.slice(bounds[k], bounds[k + 1]);
    if (k > 0) {
      const head = part.slice(0, 300);
      const isFaq = /<h2[^>]*>[\s\S]{0,80}?(FAQ|Frequently asked)/i.test(head);
      const isEnd = /<h2[^>]*>[\s\S]{0,40}?(Method|Sources|Related)/i.test(head);
      if (isFaq) faqSeen = true;
      if (!aDone && total >= 150 && !isFaq) { out += A; aDone = true; since = 0; }
      else if (isFaq && C && since >= 300) { out += C; since = 0; }
      else if (!faqSeen && !isEnd && B && since >= 500 && placedB < max && k < bounds.length - 2) { out += B; placedB++; since = 0; }
    }
    out += part;
    const w = words(part); since += w; total += w;
  }
  return out;
}
