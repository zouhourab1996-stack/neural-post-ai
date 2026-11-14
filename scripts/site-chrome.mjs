// Shared header/footer/theme for every statically generated page (blog posts, blog
// archives and the static site pages built by generate-seo.mjs). All internal links
// use the trailing-slash canonical form, because vercel.json 308-redirects the
// slash-less form.
import fs from "node:fs";
import path from "node:path";

export const SITE = "https://prophetic.pw";
export const SITE_NAME = "Prophetic";

export const themeCss = fs.readFileSync(path.join(process.cwd(), "scripts", "blog", "blog.css"), "utf8");

export const THEME_SCRIPT = `<script>(function(){var t;try{t=localStorage.getItem("prophetic-theme")}catch(e){}var d=document.documentElement;d.classList.remove("dark","light");d.classList.add(t==="light"?"light":"dark");})();</script>`;
export const TOGGLE_SCRIPT = `<script>(function(){var b=document.getElementById("pb-theme");if(!b)return;b.addEventListener("click",function(){var d=document.documentElement,n=d.classList.contains("dark")?"light":"dark";d.classList.remove("dark","light");d.classList.add(n);try{localStorage.setItem("prophetic-theme",n)}catch(e){}});})();</script>`;
const SUN = '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
const MOON = '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';

const BRAND = `<a href="/" class="pb-brand"><span class="pb-mark">P</span><span>Prophetic</span></a>`;

export const FONT_LINKS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap">`;

export function chrome(active) {
  const link = (href, label, key) => `<a href="${href}"${active === key ? ' class="active"' : ""}>${label}</a>`;
  return {
    header: `<div class="pb-announce"><span class="pb-dot"></span> Astrology dates computed to the minute <a href="/editorial/">Our editorial standards ↗</a></div>
<header class="pb-header"><div class="pb-container pb-nav">
 ${BRAND}
 <nav class="pb-links" aria-label="Primary navigation">${link("/", "Home", "home")}${link("/blog/", "Blog", "blog")}${link("/about/", "About", "about")}${link("/contact/", "Contact", "contact")}</nav>
 <div class="pb-actions"><a href="/blog/feed.xml" class="pb-iconbtn" aria-label="RSS feed" title="RSS feed"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg></a><button id="pb-theme" class="pb-iconbtn" aria-label="Toggle theme" type="button">${SUN}${MOON}</button></div>
</div></header>`,
    footer: `<footer class="pb-footer"><div class="pb-container pb-footgrid">
 <div>${BRAND}<p>Astrology guides with dates computed to the minute.</p></div>
 <div class="col"><strong>Explore</strong><a href="/blog/">All guides</a><a href="/sitemap/">Site index</a><a href="/editorial/">Editorial policy</a><a href="/ai-policy/">AI policy</a><a href="/blog/feed.xml">RSS feed</a></div>
 <div class="col"><strong>Company</strong><a href="/about/">About Prophetic</a><a href="/author/hedi-touati/">Hedi Touati, editor</a><a href="/contact/">Contact us</a><a href="/disclaimer/">Disclaimer</a><a href="/privacy/">Privacy policy</a><a href="/terms/">Terms</a></div>
</div><div class="pb-container pb-footbottom"><span>© ${new Date().getUTCFullYear()} ${SITE_NAME}. Astrology dates you can check.</span><span>We compute. You decide.</span></div></footer>${TOGGLE_SCRIPT}`,
  };
}
