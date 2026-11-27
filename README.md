# Prophetic — astrology, birth-chart and sky-event guides

**Live site:** https://prophetic.pw/

Prophetic publishes practical explainers about astrology, natal-chart concepts, annual profections, lunar phases, planetary cycles and observable sky events. Astronomical calculations are distinguished from astrological interpretation; astrology is presented as a symbolic practice, not as scientifically established prediction or professional advice.

## Technology
Static HTML + Vite build tooling · GitHub Pages · Cloudflare DNS

## Publishing standards
- Articles are maintained as editorial source files in `content/blog/`.
- New material must be reviewed for factual accuracy, original usefulness, source quality, clear uncertainty and natural language before publication.
- Automated generation must never publish directly to the public site.
- Date-sensitive astronomy content must identify its event definition, reference data and time zone.
- Pricing and product comparisons require dated checks against the provider's own published terms.

## Build and SEO
- Build: `npm run build`
- Hosting: GitHub Pages, deployed automatically from `main` via GitHub Actions
- DNS and domain security: Cloudflare
- The production site is static; it does not require a database or server runtime
- Sitemap: https://prophetic.pw/sitemap.xml
- Robots: https://prophetic.pw/robots.txt
- Blog feed: https://prophetic.pw/blog/feed.xml
- Editorial policy: https://prophetic.pw/editorial/
- AI-use policy: https://prophetic.pw/ai-policy/
