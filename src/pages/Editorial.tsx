import { motion } from "framer-motion"
import { ArrowRight, CalendarClock, Mail, ScrollText, ShieldCheck, TriangleAlert } from "lucide-react"
import { Link } from "react-router-dom"

const STANDARDS = [
  { icon: <CalendarClock />, title: "Dates come from ephemeris data", body: "Retrograde stations, eclipses, moon phases and meteor shower peaks are computed from astronomical ephemerides, not copied from other astrology sites. We publish the time to the minute in UTC and mark the shadow and storm windows around each station." },
  { icon: <ScrollText />, title: "Prices are checked, then dated", body: "When a guide quotes what a reading, report or sketch costs, that figure comes from the seller's own published pricing on the day we checked it — and we print the date of the check next to it. Prices move; we say when we looked." },
  { icon: <ShieldCheck />, title: "Cons are published with pros", body: "A service guide that lists only advantages is advertising. Every scored guide on Prophetic carries the limits, the refund terms and the cases where we would tell you not to buy." },
  { icon: <TriangleAlert />, title: "We say when we cannot verify", body: "Where a seller does not publish a price, or a claim cannot be sourced, we write that plainly instead of filling the gap with a plausible number. No invented sellers, no invented testimonials, no invented credentials." },
]

export default function Editorial() {
  return <div className="container-main page-shell">
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="about-hero">
      <span className="eyebrow accent-label">EDITORIAL POLICY</span>
      <h1>How Prophetic<br /><em>researches and corrects.</em></h1>
      <p>The standards behind every dated guide and every cost comparison published on prophetic.pw. Last updated 21 October 2026.</p>
    </motion.section>

    <section className="about-grid">
      <div>
        <span className="eyebrow">OUR REMIT</span>
        <h2>What this site is for.</h2>
        <p>Prophetic publishes astrology guides with dates you can check against any ephemeris, plain-language explainers for reading your own birth chart, and honest cost guides for readings and spiritual services. That is the whole remit. We do not publish forecasts about your health, your money or your legal position, because astrology cannot support that weight.</p>
        <p>Astrology is a symbolic and reflective practice with a long history. We treat it as a language for thinking about timing and temperament — not as a prediction engine, and never as a substitute for a doctor, a lawyer or a financial adviser. Where a page touches any of those, the boundary is stated on the page.</p>
      </div>
      <div className="about-card">
        {STANDARDS.map((item) => <div key={item.title}><span className="promise-number">{item.icon}</span><strong>{item.title}</strong><span className="about-card-note">{item.body}</span></div>)}
      </div>
    </section>

    <section className="about-grid">
      <div>
        <span className="eyebrow">WHO IS ACCOUNTABLE</span>
        <h2>Edited by Hedi Touati.</h2>
        <p>Every guide on Prophetic is edited and signed off by <Link to="/author/hedi-touati">Hedi Touati</Link>, the site's founder and editor. He computes the dates from ephemeris data, checks the prices quoted in the service guides against each seller's own terms, and owns the corrections. No article is published unreviewed, and no byline on this site is a pseudonym or a generated persona.</p>
        <p>That accountability is the reason each guide carries the date it was last checked. If a figure is wrong, the person who published it is named on the page.</p>
      </div>
      <div>
        <span className="eyebrow">CORRECTIONS</span>
        <h2>Errors are fixed in place.</h2>
        <p>When a date, a price or a claim is wrong, we correct the article rather than quietly publishing a replacement. The correction is noted at the foot of the article it affects, with the date of the change, so the public record stays intact.</p>
        <p>To report an error, email the editor with the article URL and what is wrong. Verified corrections are published with the next update of that article — usually within a week.</p>
      </div>
      <div>
        <span className="eyebrow">INDEPENDENCE</span>
        <h2>What is — and is not — for sale.</h2>
        <p>Some guides contain affiliate links, always disclosed at the point of the link and marked with <code>rel="sponsored"</code>. They help fund the site. They do not buy a ranking, a date, a quoted price or a conclusion, and no seller has ever been charged for coverage or offered a review.</p>
        <p>We do not publish guest posts, paid placements or sponsored articles. See the <Link to="/disclaimer">affiliate disclosure</Link> for the full detail and the <Link to="/ai-policy">AI content policy</Link> for how assisted tooling is used.</p>
      </div>
    </section>

    <section className="about-cta">
      <div><span className="eyebrow">SAY HELLO</span><h2>Spotted something wrong?</h2></div>
      <a className="button" href="mailto:anistouati74@gmail.com">Email the editor <Mail data-icon="inline-start" /></a>
    </section>

    <section className="about-cta">
      <div><span className="eyebrow">KEEP READING</span><h2>Browse the guides</h2></div>
      <a className="button button-ghost" href="/blog/">All astrology guides <ArrowRight /></a>
    </section>
  </div>
}
