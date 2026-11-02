import { motion } from "framer-motion"
import { ArrowRight, Bot, Eye, FileCheck2, PenLine } from "lucide-react"

const RULES = [
  { icon: <Bot />, title: "AI computes, it does not judge", body: "We use automated tooling the way an accountant uses a calculator: for ephemeris arithmetic, date tables and first drafts of descriptive sections. What a transit means, whether a service is worth its price, and every recommendation are human judgments." },
  { icon: <Eye />, title: "Every sentence is reviewed", body: "Nothing is published on a schedule that outruns editing. A named editor reads each guide before it goes live and is accountable for it, including the parts a tool drafted." },
  { icon: <FileCheck2 />, title: "Sources are checked against primary data", body: "Dates are verified against astronomical ephemerides and prices against the seller's own published terms. Where a tool produces a figure we cannot confirm, it does not ship." },
  { icon: <PenLine />, title: "No synthetic experience", body: "We do not invent personal stories, client anecdotes, reader testimonials or credentials to make a guide feel lived-in. Experience claims on this site describe work that was actually done." },
]

export default function AiPolicy() {
  return <div className="container-main page-shell">
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="about-hero">
      <span className="eyebrow accent-label">AI CONTENT POLICY</span>
      <h1>How we use<br /><em>assisted tooling.</em></h1>
      <p>Prophetic is written and edited by people. This page explains exactly where automation is used, where it is not, and what we refuse to do with it. Last updated 21 October 2026.</p>
    </motion.section>

    <section className="about-grid">
      <div>
        <span className="eyebrow">THE SHORT VERSION</span>
        <h2>Assistance in the production, not in the judgment.</h2>
        <p>Search engines and readers both deserve to know how a page was made. On Prophetic, automated tools are allowed to compute and to draft. They are not allowed to decide what is true. Every published guide is read, corrected and signed off by an editor who is accountable for it.</p>
      </div>
      <div className="about-card">
        {RULES.map((item) => <div key={item.title}><span className="promise-number">{item.icon}</span><strong>{item.title}</strong><span className="about-card-note">{item.body}</span></div>)}
      </div>
    </section>

    <section className="about-grid">
      <div>
        <span className="eyebrow">WHAT WE DO NOT DO</span>
        <h2>The lines we do not cross.</h2>
        <p>We do not publish unreviewed generated text, we do not generate articles in bulk to chase a keyword, and we do not use automation to imitate first-hand experience we do not have. We do not fabricate sources, quotes, prices or author biographies.</p>
      </div>
      <div>
        <span className="eyebrow">WHY TELL YOU THIS</span>
        <h2>Because dates and prices can be checked.</h2>
        <p>Our guides invite verification: a retrograde station, an eclipse time or a service price can all be checked against a primary source. That invitation is only honest if the person publishing it stands behind it — which is why each guide carries its check date, and why corrections are logged on the page rather than buried.</p>
      </div>
    </section>

    <section className="about-cta">
      <div><span className="eyebrow">KEEP READING</span><h2>Read the editorial policy</h2></div>
      <a className="button button-ghost" href="/editorial/">Editorial standards <ArrowRight /></a>
    </section>
  </div>
}
