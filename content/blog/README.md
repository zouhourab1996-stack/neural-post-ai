# Prophetic Blog — how to publish

Every file in this folder becomes a page at `https://prophetic.pw/blog/<slug>/`.
The blog is built by `scripts/generate-blog.mjs` during `npm run build` — no database,
no CMS, no extra dependencies. Push to `main` and Vercel/GitHub Pages rebuild automatically.

## 1. Create a post

Copy `_template.md` to a new file. The **file name is the URL slug**:

```
content/blog/best-free-birth-chart-calculators-2026.md
→ https://prophetic.pw/blog/best-free-birth-chart-calculators-2026/
```

Rules: lowercase, hyphens, no spaces. Files that start with `_` are ignored (templates, drafts).

## 2. Fill in the front matter

```yaml
---
title: Best Free Birth Chart Calculators (2026): 9 Tools Tested   # required
description: One or two sentences, max ~160 chars. Used for meta description, cards, RSS.   # required
date: 2026-10-05          # required, YYYY-MM-DD (controls ordering)
updated: 2026-10-05       # optional, shown as "Updated" when different from date
author: Prophetic Editorial Team   # optional
category: Astrology       # optional, one label shown on cards (defaults to first tag)
tags: [Astrology, Calculators, Birth Chart]   # optional, each tag gets /blog/tag/<tag>/
image: /images/blog/birth-chart-calculators.jpg   # optional, OG image (path in /public or full URL)
showImage: true           # optional, set false to keep the image for social cards only
toc: true                 # optional, auto "On this page" box from H2 headings
draft: true               # optional, excluded from the build while true
---
```

## 3. Write the body in Markdown

Standard Markdown works (headings, lists, links, images, tables, code, blockquotes).
Headings get automatic `id`s, so `## Exact dates` can be linked as `#exact-dates`.
Raw HTML is allowed anywhere (calculators, `<details>`, custom tables…).

Extra blocks that match the site design:

```
:::tldr Quick answer
- First bullet
- Second bullet
:::

:::note Good to know
Short aside.
:::

:::callout Important
Highlighted recommendation.
:::

:::warning Watch out
Red warning box.
:::

- [ ] A checklist item      ← renders as the ☐ checklist style
- [x] A done item

<!-- toc -->                 ← optional: place the TOC exactly here (needs toc: true)
```

Reusable CSS classes available inside raw HTML: `tldr`, `callout` (+`warn`), `note`, `toc`,
`kicker`, `badge now|soon|past`, `tablewrap`, `checklist`, `timeline`, `faq` (wrap `<details>`),
`calc` / `res-card` / `#result` (interactive calculators), `small`, `button`.

## 4. HTML posts (for interactive pieces)

Save as `<slug>.html` with the front matter in a leading HTML comment:

```html
<!--
title: …
description: …
date: 2026-10-05
tags: [Astrology, Calculators]
-->
<div class="tldr">…</div>
<h2 id="calculator">…</h2>
<script type="application/ld+json">{ FAQPage … }</script>   ← hoisted into <head>
<script>/* calculator code */</script>                       ← stays in the body
```

Do **not** include `<html>`, `<head>`, `<h1>`, header/footer — the generator adds them
(title, meta tags, canonical, Open Graph, BlogPosting + BreadcrumbList schema, theme toggle,
share links, author box, related posts, prev/next, RSS, sitemap).

## 5. Preview locally

```
npm install
npm run build && npx vite preview   # then open /blog/
```

## 6. Publish

```
git add content/blog/<slug>.md
git commit -m "blog: <title>"
git push origin main
```

Vercel deploys in ~1–2 minutes. The sitemap (`/sitemap.xml`), RSS (`/blog/feed.xml`) and
`/blog/manifest.json` update automatically; the GitHub Pages workflow pings IndexNow.

## Outputs (generated, never edit by hand)

| Path | What |
|---|---|
| `dist/blog/index.html` (+ `/blog/page/N/`) | Blog home, 12 posts per page |
| `dist/blog/<slug>/index.html` | Post pages |
| `dist/blog/tag/<tag>/index.html` | Tag archives |
| `dist/blog/feed.xml` | RSS 2.0 (20 latest posts) |
| `dist/blog/manifest.json` | JSON list of posts (used by the homepage "From the blog" section and the sitemap) |
