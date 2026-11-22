import { motion } from "framer-motion"
import { ArrowRight, Bot, Eye, FileCheck2, PenLine } from "lucide-react"

const RULES = [
  { icon: <Bot />, title: "Tools can assist; they are not evidence", body: "Automated tools may assist with research, calculations, outlines or draft language. A generated statement is not treated as verified merely because a tool produced it." },
  { icon: <Eye />, title: "The public archive is curated", body: "Public blog listings and the sitemap are built from the site's editorial article files. Imported provider-delivered drafts are excluded from the public archive and kept out of search until an editor has reviewed and deliberately imported them." },
  { icon: <FileCheck2 />, title: "Facts need traceable sources", body: "Date-sensitive astronomical claims should identify a primary reference and time zone. Prices and service terms need a current provider source. If a claim cannot be checked, it should be qualified or withheld." },
  { icon: <PenLine />, title: "No invented experience", body: "We do not invent client stories, testimonials, personal experiences, credentials, sources or quotations to make an article sound more convincing." },
]

export default function AiPolicy() {
  return <div className="container-main page-shell">
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="about-hero">
      <span className="eyebrow accent-label">AI CONTENT POLICY</span>
      <h1>Assisted tools,<br /><em>editorial responsibility.</em></h1>
      <p>Last updated: November 22, 2026. This page explains where automated tools may be used and what readers should expect from published material.</p>
    </motion.section>
    <section className="about-grid">
      <div><span className="eyebrow">THE SHORT VERSION</span><h2>Automation is not a source.</h2><p>Tools may help with research, arithmetic, organization and first drafts. They can also make mistakes, omit context or produce plausible-sounding details that are wrong. Important factual claims must be checked against the sources relevant to that claim.</p><p>Human editorial responsibility rests with the named editor. We do not claim that every sentence has been independently verified; readers should use the sources and limitations stated in each guide.</p></div>
      <div className="about-card">{RULES.map((item) => <div key={item.title}><span className="promise-number">{item.icon}</span><strong>{item.title}</strong><span className="about-card-note">{item.body}</span></div>)}</div>
    </section>
    <section className="about-grid"><div><span className="eyebrow">WHAT WE AVOID</span><h2>No mass-produced pages for search.</h2><p>We do not treat a keyword list as a reason to publish near-identical pages. Articles should answer a distinct reader question, add useful context and avoid repeating material simply to increase page count.</p></div><div><span className="eyebrow">CORRECTIONS</span><h2>Tell us when something is wrong.</h2><p>If a date, source, calculation or statement appears incorrect, send the article URL and the evidence to the editor through the contact page. Verified corrections should be made on the affected page and dated.</p></div></section>
    <section className="about-cta"><div><span className="eyebrow">KEEP READING</span><h2>Read the editorial policy</h2></div><a className="button button-ghost" href="/editorial/">Editorial standards <ArrowRight /></a></section>
  </div>
}
