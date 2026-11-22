import { motion } from "framer-motion"
import { ArrowRight, CalendarClock, Mail, ScrollText, ShieldCheck, TriangleAlert } from "lucide-react"
import { Link } from "react-router-dom"

const STANDARDS = [
  { icon: <CalendarClock />, title: "Dates need references", body: "Dated guides should identify the astronomical reference, event definition and time zone used. Different sources can report different local calendar dates." },
  { icon: <ScrollText />, title: "Prices need current checks", body: "Prices and service terms change. Confirm current details with the provider; a verification date should appear only when a check was actually completed." },
  { icon: <ShieldCheck />, title: "Explain trade-offs", body: "A service guide should describe limitations, terms and uncertainty, not just advantages or unsupported recommendations." },
  { icon: <TriangleAlert />, title: "Say what cannot be verified", body: "If a claim, price or source cannot be checked, qualify it or leave it out. Do not fill gaps with plausible numbers, invented sellers, testimonials or credentials." },
]

export default function Editorial() {
  return <div className="container-main page-shell">
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="about-hero">
      <span className="eyebrow accent-label">EDITORIAL POLICY</span>
      <h1>How Prophetic<br /><em>researches and corrects.</em></h1>
      <p>Last updated: November 22, 2026. These standards apply to the site's astrology guides and sky-event explainers.</p>
    </motion.section>
    <section className="about-grid">
      <div><span className="eyebrow">OUR REMIT</span><h2>What this site is for.</h2><p>Prophetic publishes explainers about astrology, birth-chart concepts, annual profections, lunar phases, planetary cycles and observable sky events. Astronomy concerns measurable events and positions; astrology is a symbolic interpretive tradition, not a scientific prediction method.</p><p>We do not publish forecasts about a reader's health, finances or legal position. Astrology is not a substitute for qualified professional advice.</p></div>
      <div className="about-card">{STANDARDS.map((item) => <div key={item.title}><span className="promise-number">{item.icon}</span><strong>{item.title}</strong><span className="about-card-note">{item.body}</span></div>)}</div>
    </section>
    <section className="about-grid">
      <div><span className="eyebrow">WHO IS ACCOUNTABLE</span><h2>Edited by Hedi Touati.</h2><p>Hedi Touati is the site's founder and editor and is responsible for its editorial direction and corrections. Individual pages should identify their own sources and verification limits; the site does not claim blanket independent verification of every detail.</p></div>
      <div><span className="eyebrow">CORRECTIONS</span><h2>Errors should be corrected in place.</h2><p>When a date, price or factual claim is found to be wrong, the affected page should be corrected and the change dated. To report an error, email the editor with the page address and the source or calculation that supports the correction.</p></div>
    </section>
    <section className="about-grid">
      <div><span className="eyebrow">INDEPENDENCE</span><h2>Advertising is not editorial approval.</h2><p>Prophetic is supported by display advertising. Advertisers do not approve articles or determine editorial conclusions. The site currently does not publish affiliate links. If that changes, the commercial relationship will be disclosed on the relevant page.</p></div>
      <div><span className="eyebrow">SAY HELLO</span><h2>Spotted something wrong?</h2><p>Send the page address and supporting information to the editor. Corrections and source questions are welcome.</p><a className="button" href="mailto:anistouati74@gmail.com">Email the editor <Mail data-icon="inline-start" /></a></div>
    </section>
    <section className="about-cta"><div><span className="eyebrow">KEEP READING</span><h2>Browse the guides</h2></div><Link className="button button-ghost" to="/blog/">All astrology guides <ArrowRight /></Link></section>
  </div>
}
