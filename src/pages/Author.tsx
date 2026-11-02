import { motion } from "framer-motion"
import { ArrowRight, CalendarClock, CircleDollarSign, Mail, ScrollText, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"

const FACTS = [
  { icon: <CalendarClock />, title: "Dates are computed, not copied", body: "Retrograde stations, eclipses and moon phases come from ephemeris calculation, which is why Prophetic's times sometimes differ from other astrology sites by a few hours." },
  { icon: <CircleDollarSign />, title: "Prices are checked against the source", body: "Figures quoted in the service guides come from each seller's own published pricing and terms, checked on the date printed beside them." },
  { icon: <ScrollText />, title: "Corrections are made in public", body: "Errors are fixed in the article they affect, with the change noted on the page and the date it was made — not quietly replaced." },
  { icon: <ShieldCheck />, title: "No pay-to-rank, ever", body: "Affiliate links are disclosed at the point of the link. They never change a date, a quoted price or a conclusion." },
]

export default function Author() {
  return <div className="container-main page-shell">
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="about-hero">
      <span className="eyebrow accent-label">EDITOR</span>
      <h1>Hedi Touati<br /><em>Founder &amp; editor.</em></h1>
      <p>Founder and editor of Prophetic. He computes the site's astrology dates from ephemeris data rather than copying them, checks every quoted price against the seller's own terms, and edits each guide before it is published.</p>
    </motion.section>

    <section className="about-grid">
      <div>
        <span className="eyebrow">BACKGROUND</span>
        <h2>Why this site exists.</h2>
        <p>Prophetic began as a private set of notes on retrograde dates — the kind of table you build when you are tired of websites that disagree with each other by a day and none of them show their working. It is now a public reference for people who want to check the sky for themselves: what is happening, when exactly, and what it means for a chart.</p>
        <p>The same instinct drives the service guides. Most pages about readings are written by people selling readings, so the useful question — what does this actually cost at each tier, and what do you get — rarely gets a straight answer. Those guides exist to answer it plainly.</p>
      </div>
      <div className="about-card">
        {FACTS.map((item) => <div key={item.title}><span className="promise-number">{item.icon}</span><strong>{item.title}</strong><span className="about-card-note">{item.body}</span></div>)}
      </div>
    </section>

    <section className="about-grid">
      <div>
        <span className="eyebrow">WHAT HE COVERS</span>
        <h2>Dated events, chart explainers, honest costs.</h2>
        <p>Planet meanings and chart mechanics, retrograde and eclipse timing, moon phases and meteor showers, and the cost of readings and spiritual services at every price tier. Astrology here is treated as a symbolic and reflective practice — not as a prediction engine, and never as medical, legal or financial advice.</p>
      </div>
      <div>
        <span className="eyebrow">STANDARDS</span>
        <h2>Held to the published policy.</h2>
        <p>The full method — sourcing, dating, corrections and how affiliate links are handled — is set out in the <Link to="/editorial">editorial policy</Link>, with how assisted tooling is used in the <Link to="/ai-policy">AI content policy</Link>. Both are public so they can be argued with.</p>
      </div>
    </section>

    <section className="about-cta">
      <div><span className="eyebrow">GET IN TOUCH</span><h2>Corrections and questions</h2><span className="about-cta-note">Verified corrections are published with the next update of the article, and credited.</span></div>
      <a className="button" href="mailto:anistouati74@gmail.com">Email Hedi <Mail data-icon="inline-start" /></a>
    </section>

    <section className="about-cta">
      <div><span className="eyebrow">READ</span><h2>Latest guides</h2></div>
      <a className="button button-ghost" href="/blog/">All astrology guides <ArrowRight /></a>
    </section>
  </div>
}
