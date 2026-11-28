// Live smoke test for the deployed static site.
// Usage: node scripts/smoke-test.mjs https://prophetic.pw
const base = (process.argv[2] || "https://prophetic.pw").replace(/\/$/, "");
const headers = { "user-agent": "Mozilla/5.0 (compatible; prophetic-site-smoke-test/1.0)" };
const failures = [];
const check = (condition, message) => {
  if (!condition) {
    failures.push(message);
    console.error("FAIL:", message);
  }
};
const get = (url) => fetch(url, { redirect: "manual", headers, signal: AbortSignal.timeout(20000) });
const text = async (response) => response.text();

async function getWithRetry(url, attempts = 5) {
  let last;
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await get(url);
      if (response.status >= 200 && response.status < 500) return response;
      last = new Error(`HTTP ${response.status}`);
    } catch (error) {
      last = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
  throw last || new Error("Request failed");
}

const robotsResponse = await getWithRetry(base + "/robots.txt");
const robots = await text(robotsResponse);
check(robotsResponse.status === 200, `robots.txt returned HTTP ${robotsResponse.status}`);
check(robots.includes(`Sitemap: ${base}/sitemap.xml`), "robots.txt does not advertise the canonical sitemap");
check(!/^Disallow:\s*\/\s*$/m.test(robots), "robots.txt blocks the entire site");

const sitemapResponse = await getWithRetry(base + "/sitemap.xml");
const xml = await text(sitemapResponse);
check(sitemapResponse.status === 200, `sitemap.xml returned HTTP ${sitemapResponse.status}`);
check(/xml/i.test(sitemapResponse.headers.get("content-type") || ""), "sitemap.xml has a non-XML content type");
check(!/attachment/i.test(sitemapResponse.headers.get("content-disposition") || ""), "sitemap.xml is served as a download");
check(/<urlset[\s>]/i.test(xml), "sitemap.xml has no urlset root");
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1].trim());
check(urls.length >= 50, `sitemap contains only ${urls.length} URLs`);
check(urls.every((url) => url.startsWith(base + "/")), "sitemap contains URLs outside the canonical host");
check(!/vercel|supabase|lovable|blogspot|localhost/i.test(xml), "sitemap contains a legacy or development hostname");
check(new Set(urls).size === urls.length, "sitemap contains duplicate URLs");

const adsResponse = await getWithRetry(base + "/ads.txt");
const adsTxt = await text(adsResponse);
check(adsResponse.status === 200, `ads.txt returned HTTP ${adsResponse.status}`);
check(adsTxt.includes("pub-3898992716389443"), "ads.txt is missing the site's Google publisher record");

const internalLinks = new Set();
async function inspectPage(url) {
  let response;
  try {
    response = await get(url);
  } catch (error) {
    check(false, `${url} request failed: ${error.message}`);
    return;
  }
  const html = await text(response);
  check(response.status === 200, `${url} returned HTTP ${response.status}`);

  const canonicalTag = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i)?.[0] || "";
  const canonical = canonicalTag.match(/href=["']([^"']+)["']/i)?.[1];
  check(canonical === url, `${url} canonical mismatch (found ${canonical || "none"})`);
  check(!/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html), `${url} unexpectedly contains noindex`);
  check(/<title>[^<]{10,}<\/title>/i.test(html), `${url} is missing a useful title`);
  check(/<meta\b[^>]*name=["']description["'][^>]*content=["'][^"']{50,}/i.test(html), `${url} is missing a useful meta description`);
  check((html.match(/<h1(?:\s|>)/gi) || []).length === 1, `${url} does not contain exactly one H1`);

  if (url.includes("/blog/") && !url.endsWith("/blog/")) {
    const visibleText = html
      .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ");
    check(visibleText.split(/\s+/).filter(Boolean).length > 500, `${url} appears unexpectedly thin`);
    check(/adsbygoogle\.js\?client=ca-pub-3898992716389443/i.test(html), `${url} is missing the configured AdSense loader`);
  }

  for (const match of html.matchAll(/\bhref=["']([^"'#]+)["']/gi)) {
    const href = match[1].trim();
    if (!href || /^(?:mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    try {
      const target = new URL(href, url);
      if (target.origin === new URL(base).origin && target.pathname !== "/") {
        internalLinks.add(target.href);
      }
    } catch {
      check(false, `${url} contains an invalid href: ${href}`);
    }
  }
}

for (let i = 0; i < urls.length; i += 6) {
  await Promise.all(urls.slice(i, i + 6).map(inspectPage));
}

// Check distinct internal destinations as well, catching broken links to pages
// intentionally excluded from the sitemap (for example, tag and utility pages).
for (const target of internalLinks) {
  if (urls.includes(target)) continue;
  try {
    const response = await get(target);
    check(response.status === 200, `internal link ${target} returned HTTP ${response.status}`);
  } catch (error) {
    check(false, `internal link ${target} request failed: ${error.message}`);
  }
}

const missingResponse = await get(base + "/__prophetic_smoke_test_missing_page__/");
check(missingResponse.status === 404, `unknown URL returned HTTP ${missingResponse.status}, expected 404`);

if (failures.length) {
  console.error(`\nSmoke test failed: ${failures.length} issue(s)`);
  process.exit(1);
}
console.log(`OK: ${urls.length} sitemap URLs and ${internalLinks.size} internal destinations verified.`);
