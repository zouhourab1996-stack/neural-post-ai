import { motion } from "framer-motion"
import { ArrowRight, CalendarClock, CircleDollarSign, Mail, ScrollText, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"

const FACTS = [
  { icon: <CalendarClock />, title: "Dates and source notes", body: "Dated guides should identify the astronomical reference and time zone used. Readers should compare source notes when published dates differ." },
  { icon: <CircleDollarSign />, title: "Pricing information and its limits", body: "Prices and terms can change; confirm current information directly with the provider. A verification date is shown only when a check was actually performed." },
  { icon: <ScrollText />, title: "Corrections are made in public", body: "Errors are fixed in the article they affect, with the change noted on the page and the date it was made — not quietly replaced." },
  { icon: <ShieldCheck />, title: "Clear commercial disclosures", body: "Any sponsored or affiliate relationship should be disclosed where it applies and should not determine editorial conclusions." },
]

export default function Author() {
  return <div className="container-main page-shell">
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="about-hero">
      <span className="eyebrow accent-label">EDITOR</span>
      <h1>Hedi Touati<br /><em>Founder &amp; editor.</em></h1>
      <p>Founder and editor of Prophetic, responsible for the publication's editorial direction and corrections. Individual guides should identify their sources and verification limits.</p>
    </motion.section>

    <section className="about-grid">
      <div>
        <span className="eyebrow">BACKGROUND</span>
        <h2>Why this site exists.</h2>
        <p>Prophetic publishes accessible explainers about astrology, birth-chart concepts and observable sky events, with an emphasis on distinguishing astronomical facts from symbolic interpretations.</p>
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
