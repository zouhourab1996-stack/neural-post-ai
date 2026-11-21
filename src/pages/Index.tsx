import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

type BlogPost = { slug: string; title: string; description: string; date: string; category: string; readingTime: number }

export default function Index() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  useEffect(() => {
    let alive = true
    fetch("/blog/manifest.json", { headers: { Accept: "application/json" } })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (alive && Array.isArray(data?.posts)) setPosts(data.posts.filter((post: BlogPost) => post).slice(0, 6)) })
      .catch(() => undefined)
    return () => { alive = false }
  }, [])

  return <div className="container-main page-shell">
    <section className="about-hero">
      <span className="eyebrow accent-label">ASTROLOGY · ASTRONOMY · CHART GUIDES</span>
      <h1>Understand the sky.<br /><em>Explore the symbolism.</em></h1>
      <p>Independent guides to planetary cycles, moon phases, eclipses, birth-chart concepts and reflective practices. We distinguish observable astronomy from symbolic astrological interpretation.</p>
      <div className="about-cta">
        <Link className="button" to="/blog/">Explore all guides</Link>
        <Link className="button button-ghost" to="/about/">About Prophetic</Link>
      </div>
    </section>
    <section className="section-pad">
      <div className="section-heading"><div><span className="eyebrow">LATEST GUIDES</span><h2>Recent articles</h2></div><Link className="text-link" to="/blog/">All articles</Link></div>
      <div className="review-grid">
        {posts.map((post) => <article key={post.slug} className="review-card">
          <div className="card-top"><span className="eyebrow">{post.category}</span><span>{post.readingTime} min read</span></div>
          <h3><a href={`/blog/${post.slug}/`}>{post.title}</a></h3>
          <p>{post.description}</p>
          <div className="card-meta"><span>{post.date}</span><a href={`/blog/${post.slug}/`}>Read guide →</a></div>
        </article>)}
      </div>
    </section>
    <section className="about-grid">
      <div><h2>Our approach</h2><p>Astronomical observations are measurable and should be checked against reliable references. Astrology is presented as a cultural and symbolic tradition, not as a scientifically established prediction method.</p></div>
      <div><h2>Editorial standards</h2><p>We identify sources where available, explain uncertainty and time zones, and welcome corrections. We do not claim independent verification unless it is documented.</p><Link to="/editorial/">Read our editorial policy →</Link></div>
    </section>
  </div>
}
