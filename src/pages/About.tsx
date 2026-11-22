import { motion } from "framer-motion"
import { ArrowRight, BookOpen, Compass, ShieldCheck } from "lucide-react"

export default function About() {
  return <div className="container-main page-shell">
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="about-hero">
      <span className="eyebrow accent-label">ABOUT PROPHETIC</span>
      <h1>Astrology, charts<br /><em>and the observable sky.</em></h1>
      <p>Prophetic is an independent publication about astrology, birth-chart concepts and observable sky events.</p>
    </motion.section>
    <section className="about-grid">
      <div>
        <span className="eyebrow">OUR SUBJECT</span>
        <h2>Useful context, without pretending interpretation is fact.</h2>
        <p>We publish explainers about planetary cycles, lunar phases, eclipses, meteor showers, annual profections and natal-chart concepts. Astronomy and astrology are related in subject matter, but they are not the same kind of claim: event times and positions can be checked against astronomical references; astrological meanings are symbolic interpretations within a tradition.</p>
        <p>We do not present astrology as a scientific prediction method or as a substitute for medical, legal, financial or safety advice.</p>
      </div>
      <div className="about-card">
        <BookOpen /><strong>Practical explainers</strong><span>Plain-language guides to chart concepts, timing techniques and reflective practices.</span>
        <Compass /><strong>Checkable sky events</strong><span>Dates and event details should be compared with the primary references linked in each relevant guide.</span>
        <ShieldCheck /><strong>Clear boundaries</strong><span>Where a detail cannot be verified, it should be identified as uncertain rather than invented.</span>
      </div>
    </section>
    <section className="about-grid">
      <div><span className="eyebrow">EDITORIAL RESPONSIBILITY</span><h2>One publication, clear accountability.</h2><p>Prophetic is founded and edited by Hedi Touati. Sources, methods and limitations should be stated on the pages where they matter. Readers can report factual errors or request corrections through the contact page.</p></div>
      <div><span className="eyebrow">HOW THE SITE IS FUNDED</span><h2>Free to read.</h2><p>The site is supported by display advertising. Advertising is separate from editorial content and is not an endorsement of any product or service. Prophetic currently does not publish affiliate links; any future commercial relationship will be disclosed where it appears.</p></div>
    </section>
    <section className="about-cta"><div><span className="eyebrow">KEEP READING</span><h2>Explore the guides</h2></div><a className="button button-ghost" href="/blog/">All astrology guides <ArrowRight /></a></section>
  </div>
}
