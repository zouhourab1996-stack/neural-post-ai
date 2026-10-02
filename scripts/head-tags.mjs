// Third-party tags shared by every statically generated page (scripts/generate-seo.mjs
// and scripts/generate-blog.mjs). The Vite SPA template (index.html) carries the same
// tags for client-rendered routes. Keep the IDs in sync with index.html and public/ads.txt.
//
// AdSense serves Auto ads on any page that loads adsbygoogle.js with this client id,
// so the loader must be present in <head> of *every* generated HTML file — the SSG
// rewrite of 2026-09-23 dropped it, which is why ads disappeared site-wide.
export const ADSENSE_CLIENT = "ca-pub-3898992716389443";
export const GA_ID = "G-1W7PC1JDKH";

export const TRACKING_HEAD = [
  `<!-- Awin -->`,
  `<meta name="awin-site-verification" content="Awin">`,
  `<meta name="google-adsense-account" content="${ADSENSE_CLIENT}">`,
  `<link rel="preconnect" href="https://pagead2.googlesyndication.com" crossorigin>`,
  `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>`,
  `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>`,
  `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');</script>`,
].join("\n");
