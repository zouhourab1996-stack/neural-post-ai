import { next } from "@vercel/functions";
// Vercel Routing Middleware: returns 410 Gone for off-niche content removed on 2026-11-14 and 2026-11-16
// (off-niche AI/dev Fiverr posts, the old /compare/ and /guides/ pages, and tag
// archives that only those posts used). 410 tells search engines the removal is permanent.
export const config = {
  runtime: "nodejs",
  matcher: [
    "/",
    "/blog/best-fiverr-ai-agent-developers-2026", "/blog/best-fiverr-ai-agent-developers-2026/",
    "/blog/best-fiverr-claude-code-developers-2026", "/blog/best-fiverr-claude-code-developers-2026/",
    "/blog/best-fiverr-ai-ugc-video-ads-2026", "/blog/best-fiverr-ai-ugc-video-ads-2026/",
    "/blog/best-fiverr-ai-video-editors-2026", "/blog/best-fiverr-ai-video-editors-2026/",
    "/blog/tag/:tag", "/blog/tag/:tag/",
    "/compare", "/compare/", "/compare/:path*",
    "/guides", "/guides/", "/guides/:path*",
    "/article", "/article/", "/article/:path*",
    "/review", "/review/", "/review/:path*",
    "/category", "/category/", "/category/:path*",
    // Legacy Blogger article paths were retired when Prophetic moved to /blog/<slug>/.
    "/2026/:year/:month/:path*",
  ],
};

const GONE_POSTS = new Set([
  "/blog/best-fiverr-ai-agent-developers-2026/",
  "/blog/best-fiverr-claude-code-developers-2026/",
  "/blog/best-fiverr-ai-ugc-video-ads-2026/",
  "/blog/best-fiverr-ai-video-editors-2026/",
]);
// 2026-11-16: prophetic.pw is astrology/astronomy only. Every legacy "The Signal" page is gone:
// /article/* (434 AI/tech/business/science news pages), /review/* (software/business reviews)
// and /category/* (news category archives).
const GONE_PREFIX = /^\/(article|review|category)\//;
const GONE_LEGACY_BLOGGER = /^\/2026\/\d{2}\//;
const GONE_TAGS = new Set(["ai", "ai-agents", "ai-developers", "ai-ugc", "automation", "claude-code", "video-ads", "video-editing", "arabic",
  // 2026-11-16: tags used only by the removed affiliate/review posts
  "review", "bazi", "chinese-astrology", "consumer-protection", "costs", "dreams", "energy-healing", "fiverr", "interpretation", "kasamba", "keen", "law-of-attraction", "online-readings", "reiki", "reviews", "scams", "self-study", "cafe-astrology", "soulmate-sketch", "twin-flame", "clickbank"]);

const BODY = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page removed | Prophetic</title></head><body style="font-family:system-ui,sans-serif;max-width:640px;margin:60px auto;padding:0 20px"><h1>This page has been removed</h1><p>It is no longer part of Prophetic.</p><p><a href="/">Prophetic home</a> · <a href="/blog/">All astrology guides</a> · <a href="/topics/">Guides by topic</a></p></body></html>';

export default function middleware(request) {
  const requestUrl = new URL(request.url);
  // Blogger appends ?m=1 to mobile links. Strip only that legacy parameter while
  // preserving every unrelated query parameter, so the canonical URL is stable.
  if (requestUrl.pathname === "/" && (requestUrl.searchParams.has("m") || requestUrl.searchParams.has("tool"))) {
    // Normalize legacy Blogger mobile URLs and retired homepage-tool query URLs.
    requestUrl.searchParams.delete("m");
    requestUrl.searchParams.delete("tool");
    return Response.redirect(requestUrl, 308);
  }
  const p = requestUrl.pathname.toLowerCase();
  const norm = p.endsWith("/") ? p : p + "/";
  const legacyRedirects = new Map([
    ["/2026/09/total-solar-eclipse-august-2027-leo-century.html/", "/blog/solar-eclipse-2027/"],
    ["/2026/08/venus-retrograde-2026-dates-meaning.html/", "/blog/venus-retrograde-2026/"],
  ]);
  const legacyDestination = legacyRedirects.get(norm);
  if (legacyDestination) {
    return Response.redirect(new URL(legacyDestination, requestUrl.origin), 301);
  }
  const tag = norm.match(/^\/blog\/tag\/([^/]+)\/$/);
  if (GONE_POSTS.has(norm) || (tag && GONE_TAGS.has(tag[1])) || norm.startsWith("/compare/") || norm.startsWith("/guides/") || GONE_PREFIX.test(norm) || GONE_LEGACY_BLOGGER.test(norm)) {
    return new Response(BODY, { status: 410, headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex", "cache-control": "public, max-age=3600" } });
  }
  // Continue to the generated static page for every route not handled above.
  return next();
}
