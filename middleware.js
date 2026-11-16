// Vercel Routing Middleware: returns 410 Gone for off-niche content removed on 2026-11-14 and 2026-11-16
// (off-niche AI/dev Fiverr posts, the old /compare/ and /guides/ pages, and tag
// archives that only those posts used). 410 tells search engines the removal is permanent.
export const config = {
  matcher: [
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
const GONE_TAGS = new Set(["ai", "ai-agents", "ai-developers", "ai-ugc", "automation", "claude-code", "video-ads", "video-editing", "arabic",
  // 2026-11-16: tags used only by the removed affiliate/review posts
  "review", "bazi", "chinese-astrology", "consumer-protection", "costs", "dreams", "energy-healing", "fiverr", "interpretation", "kasamba", "keen", "law-of-attraction", "online-readings", "reiki", "reviews", "scams", "self-study", "soulmate-sketch", "twin-flame", "clickbank"]);

const BODY = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page removed | Prophetic</title></head><body style="font-family:system-ui,sans-serif;max-width:640px;margin:60px auto;padding:0 20px"><h1>This page has been removed</h1><p>It is no longer part of Prophetic.</p><p><a href="/">Prophetic home</a> · <a href="/blog/">All astrology guides</a> · <a href="/topics/">Guides by topic</a></p></body></html>';

export default function middleware(request) {
  const p = new URL(request.url).pathname.toLowerCase();
  const norm = p.endsWith("/") ? p : p + "/";
  const tag = norm.match(/^\/blog\/tag\/([^/]+)\/$/);
  if (GONE_POSTS.has(norm) || (tag && GONE_TAGS.has(tag[1])) || norm.startsWith("/compare/") || norm.startsWith("/guides/") || GONE_PREFIX.test(norm)) {
    return new Response(BODY, { status: 410, headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex", "cache-control": "public, max-age=3600" } });
  }
  // otherwise fall through to the normal static response
}
