import { Link } from "react-router-dom"
import { ArrowRight, CalendarClock, Compass, Gauge, Sparkles, Telescope } from "lucide-react"
import { useEffect, useState } from "react"

type BlogPost = { slug: string; url: string; title: string; description: string; date: string; tags: string[]; category: string; readingTime: number }

const TOOLS = [
  { href: "/blog/mercury-retrograde-2026/", title: "Mercury retrograde chart checker", blurb: "Find out whether you were born with Mercury retrograde and whether the 2026 stations touch your chart." },
  { href: "/blog/venus-retrograde-2026/", title: "Venus retrograde calculator", blurb: "Check any birth chart against the 2026 Venus stations and their shadow periods." },
  { href: "/blog/jupiter-retrograde-2026/", title: "Jupiter retrograde guide", blurb: "The quiet background review running underneath the 2026 retrograde season." },
  { href: "/blog/saturn-return-in-aries-2026/", title: "Saturn return calculator", blurb: "Work out whether you are inside your Saturn return, and which houses it is moving through." },
]

const STANDARDS = [
  { n: "01", title: "Dates you can check", body: "Every retrograde station, moon phase and eclipse on Prophetic is computed from ephemeris data and published to the minute, with the shadow periods marked." },
  { n: "02", title: "Prices we actually verified", body: "Our reading and service cost guides quote what a seller charged on the day we checked, and we print that date. Where we cannot verify a number, we say so." },
  { n: "03", title: "Clear incentives", body: "Some guides carry affiliate links, labelled at the point of the link. They never change a date, a price we quote, or a conclusion." },
]

function LatestGuides() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  useEffect(() => {
    let alive = true
    fetch("/blog/manifest.json", { headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (alive && data && Array.isArray(data.posts)) setPosts(data.posts.slice(0, 6)) })
      .catch(() => undefined)
    return () => { alive = false }
  }, [])
  if (!posts.length) return null
  return <section className="container-main section-pad"><div className="section-heading"><div><span className="eyebrow">LATEST GUIDES</span><h2>Retrogrades, moon phases and chart explainers.</h2></div><a className="text-link" href="/blog/">Visit the blog <ArrowRight /></a></div><div className="review-grid">{posts.map((post) => <article key={post.slug} className="review-card"><div className="card-top"><span className="eyebrow">{post.category}</span><span className="score">{post.readingTime} min</span></div><h3><a href={`/blog/${post.slug}/`}>{post.title}</a></h3><p>{post.description}</p><div className="card-meta"><span>{new Date(post.date + "T12:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })}</span><a href={`/blog/${post.slug}/`} aria-label={`Read ${post.title}`}>Read guide <ArrowRight /></a></div></article>)}</div></section>
}

export default function Index() {
  return <>
    <section className="hero"><div className="hero-glow" /><div className="container-main hero-inner"><div className="eyebrow accent-label"><Sparkles /> THE ASTROLOGY DESK</div><h1>Astrology, dated<br /><em>to the minute.</em></h1><p className="hero-copy">Retrogrades and their shadow periods, eclipses, moon phases, meteor showers and portals — computed from ephemeris data, published with the exact time, and updated when the sky changes. Plus plain-language chart explainers and honest cost guides for readings.</p><div className="hero-actions"><a className="button" href="/blog/">Read the guides <ArrowRight /></a><Link className="button button-ghost" to="/about">How we compute dates</Link></div></div></section>

    <LatestGuides />

    <section className="container-main section-pad"><div className="section-heading"><div><span className="eyebrow">FREE TOOLS</span><h2>Check your chart against the sky</h2></div></div><div className="review-grid">{TOOLS.map((tool) => <article key={tool.href} className="review-card"><div className="card-top"><span className="eyebrow"><Gauge /> Calculator</span></div><h3><a href={tool.href}>{tool.title}</a></h3><p>{tool.blurb}</p><div className="card-meta"><a href={tool.href} aria-label={`Open ${tool.title}`}>Open tool <ArrowRight /></a></div></article>)}</div></section>

    <section className="container-main section-pad"><div className="section-heading"><div><span className="eyebrow">WHAT WE COVER</span><h2>Three kinds of guide</h2></div></div><div className="promise-grid"><div><span className="promise-number"><CalendarClock /></span><h3>Dated events</h3><p>Retrogrades, eclipses, full and new moons, meteor showers — when they happen, what the shadow period is, and what it means for your chart.</p></div><div><span className="promise-number"><Compass /></span><h3>Chart explainers</h3><p>What a planet, house or aspect actually means when you read it in your own birth chart, without the jargon.</p></div><div><span className="promise-number"><Telescope /></span><h3>Service cost guides</h3><p>What a reading, a sketch or a numerology report really costs at each price tier, and where the marketplace sits in between.</p></div></div></section>

    <section className="compare-banner"><div className="container-main compare-inner"><div><span className="eyebrow">OUR STANDARDS</span><h2>Useful over mysterious.<br /><em>Every date sourced.</em></h2><p>No filler, no copy-paste forecasts. Each guide is dated, sourced and corrected in place when the astronomy changes.</p></div><Link to="/editorial" className="button button-light">Read the editorial policy <ArrowRight /></Link></div></section>

    <section className="container-main section-pad"><div className="section-heading"><div><span className="eyebrow">OUR PROMISE</span><h2>Useful over noisy.</h2></div></div><div className="promise-grid">{STANDARDS.map((item) => <div key={item.n}><span className="promise-number">{item.n}</span><h3>{item.title}</h3><p>{item.body}</p></div>)}</div></section>
  </>
}
