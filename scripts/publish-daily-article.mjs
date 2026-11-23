import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const contentDir = path.join(root, "content", "blog");
const apiBase = String(process.env.ARTICLE_API_URL || "").replace(/\/+$/, "");
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || "";
const requestUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL || "";
const requestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN || "";
if (!apiBase || !publishableKey || !requestUrl || !requestToken) {
  throw new Error("Missing daily publisher configuration or GitHub Actions OIDC context.");
}

const categories = ["Transits", "Moon Phases", "Numerology", "Zodiac", "Rituals"];
const dayStart = Date.UTC(new Date().getUTCFullYear(), 0, 0);
const dayOfYear = Math.floor((Date.now() - dayStart) / 86400000);
const category = categories[(dayOfYear - 1) % categories.length];

const oneLine = (v) => String(v ?? "").replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
const plainText = (html) => String(html || "")
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&")
  .replace(/\s+/g, " ").trim();

function readExistingTitles() {
  if (!fs.existsSync(contentDir)) return [];
  return fs.readdirSync(contentDir).filter((file) => /\.(html|md)$/i.test(file)).map((file) => {
    const text = fs.readFileSync(path.join(contentDir, file), "utf8");
    const match = text.match(/^title:\s*(.+)$/m);
    return match ? oneLine(match[1].replace(/^["']|["']$/g, "")) : "";
  }).filter(Boolean).slice(0, 150);
}

function validate(article) {
  const title = oneLine(article?.title);
  const slug = oneLine(article?.slug);
  const description = oneLine(article?.meta_description);
  const html = String(article?.content || "");
  const text = plainText(html);
  const words = text ? text.split(/\s+/).length : 0;
  const hosts = new Set();
  for (const match of html.matchAll(/href\s*=\s*["'](https?:\/\/[^"']+)["']/gi)) {
    try {
      const host = new URL(match[1]).hostname.toLowerCase().replace(/^www\./, "");
      if (host && host !== "prophetic.pw" && !host.endsWith(".prophetic.pw")) hosts.add(host);
    } catch {}
  }
  if (title.length < 20 || title.length > 60) throw new Error("Generated title failed length validation.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 90) throw new Error("Generated slug failed validation.");
  if (description.length < 120 || description.length > 160) throw new Error("Generated meta description failed length validation.");
  if (words < 1500 || words > 2500) throw new Error("Generated article failed word-count validation: " + words);
  if ((html.match(/<h2\b/gi) || []).length < 3 || (html.match(/<h3\b/gi) || []).length < 4) throw new Error("Generated article has an incomplete heading structure.");
  if (!/frequently asked questions|\bfaq\b/i.test(html)) throw new Error("Generated article is missing its FAQ section.");
  if (/<script\b|<iframe\b|<object\b|<embed\b|\bon[a-z]+\s*=|javascript:/i.test(html)) throw new Error("Generated article contains unsafe HTML.");
  if (hosts.size < 2) throw new Error("Generated article needs links to at least two distinct external source domains.");
  if (!/^https:\/\//i.test(String(article?.image_url || ""))) throw new Error("Generated article is missing a secure featured image URL.");
  return { title, slug, description, html, words };
}

const oidcUrl = new URL(requestUrl);
oidcUrl.searchParams.set("audience", "prophetic-daily-publisher");
const oidcResponse = await fetch(oidcUrl, { headers: { Authorization: "Bearer " + requestToken } });
if (!oidcResponse.ok) throw new Error("GitHub OIDC token request failed: HTTP " + oidcResponse.status);
const oidcPayload = await oidcResponse.json();
if (!oidcPayload.value) throw new Error("GitHub OIDC response did not contain a token.");

const response = await fetch(apiBase + "/functions/v1/generate-article", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "apikey": publishableKey,
    "Authorization": "Bearer " + oidcPayload.value,
  },
  body: JSON.stringify({ category, autoPublish: false, avoidTitles: readExistingTitles() }),
});
const responseText = await response.text();
if (!response.ok) throw new Error("Article generation endpoint returned HTTP " + response.status + ": " + responseText.slice(0, 1200));
let result;
try { result = JSON.parse(responseText); } catch { throw new Error("Article generation endpoint returned invalid JSON."); }
if (!result.success || result.published !== false || !result.article) {
  throw new Error("Article generation did not return a validated draft: " + JSON.stringify(result).slice(0, 1000));
}

const article = result.article;
const checked = validate(article);
fs.mkdirSync(contentDir, { recursive: true });
const output = path.join(contentDir, checked.slug + ".html");
if (fs.existsSync(output)) throw new Error("Refusing to overwrite an existing article: " + checked.slug);
const tagsByCategory = {
  "Transits": ["Astrology", "Planetary Transits", "2026"],
  "Moon Phases": ["Moon Phases", "Lunar Cycle", "Astrology"],
  "Numerology": ["Numerology", "Angel Numbers", "2026"],
  "Zodiac": ["Zodiac Signs", "Astrology", "2026"],
  "Rituals": ["Astrology", "Rituals", "Personal Reflection"],
};
const today = new Date().toISOString().slice(0, 10);
const image = oneLine(article.image_url);
const tags = tagsByCategory[category] || ["Astrology", category];
const frontMatter = [
  "<!--",
  "title: " + checked.title,
  "heading: " + checked.title,
  "seoTitle: " + checked.title,
  "description: " + checked.description,
  "date: " + today,
  "updated: " + today,
  "author: Hedi Touati",
  "category: " + category,
  "tags: [" + tags.join(", ") + "]",
  "image: " + image,
  "imageAlt: " + checked.title,
  "showImage: true",
  "-->",
].join("\n");
fs.writeFileSync(output, frontMatter + "\n" + checked.html.trim() + "\n", "utf8");

execFileSync("git", ["config", "user.name", "github-actions[bot]"]);
execFileSync("git", ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);
execFileSync("git", ["add", path.relative(root, output)]);
let stagedChanges = false;
try {
  execFileSync("git", ["diff", "--cached", "--quiet"], { stdio: "ignore" });
} catch (error) {
  if (error.status === 1) stagedChanges = true;
  else throw error;
}
if (!stagedChanges) throw new Error("Generated article produced no staged changes.");
execFileSync("git", ["commit", "-m", "chore(content): publish daily article [skip ci]"], { stdio: "inherit" });
execFileSync("git", ["push", "origin", "HEAD:main"], { stdio: "inherit" });
console.log("Validated and committed daily article: /blog/" + checked.slug + "/ (" + checked.words + " words, " + category + ").");
