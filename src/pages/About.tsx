import { motion } from "framer-motion"
import { ArrowRight, CalendarClock, CircleDollarSign, Compass, Mail, ScrollText, ShieldCheck, Telescope } from "lucide-react"
import { Link } from "react-router-dom"

const PILLARS = [
  { icon: <CalendarClock />, title: "Dates you can check", body: "Retrograde stations, eclipses and moon phases are computed from ephemeris data and published to the minute, with shadow and storm windows marked." },
  { icon: <CircleDollarSign />, title: "Prices we verified", body: "Cost guides quote what a seller charged on the day we checked, and print that date beside it. Unverifiable numbers are labelled unverified." },
  { icon: <Telescope />, title: "Limits published too", body: "Every service guide carries the cons, the refund terms and the cases where we would tell you not to buy." },
  { icon: <ShieldCheck />, title: "Independent funding", body: "Affiliate links are disclosed at the point of the link. No seller pays for coverage, a ranking or a review." },
]

export default function About() {
  return <div className="container-main page-shell">
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="about-hero">
      <span className="eyebrow accent-label">ABOUT PROPHETIC</span>
      <h1>Astrology guides with<br /><em>the dates shown.</em></h1>
      <p>Prophetic is an independent astrology publication. Every guide is built from primary ephemeris data, dated to the minute, and updated when the sky moves rather than replaced by a new article.</p>
    </motion.section>

    <section className="about-grid">
      <div>
        <span className="eyebrow">WHAT WE PUBLISH</span>
        <h2>Three kinds of guide, one standard.</h2>
        <p><strong>Dated events.</strong> Retrogrades and their shadow periods, eclipses, full and new moons, meteor shower peaks and the portal dates that circulate every year — when they happen, to the minute, and what the surrounding window is.</p>
        <p><strong>Chart explainers.</strong> What a planet, a house or an aspect actually means when you read it in your own chart, written for someone meeting the idea for the first time and without the jargon that usually comes with it.</p>
        <p><strong>Cost guides.</strong> What a reading, a report or a sketch really costs at each tier — free, automated, marketplace, subscription and professional — what you are actually paying for (usually human hours), and where the value sits at each price.</p>
      </div>
      <div className="about-card">
        {PILLARS.map((item) => <div key={item.title}><span className="promise-number">{item.icon}</span><strong>{item.title}</strong><span className="about-card-note">{item.body}</span></div>)}
      </div>
    </section>

    <section className="about-grid">
      <div>
        <span className="eyebrow">HOW WE WORK</span>
        <h2>Ephemeris first, opinion second.</h2>
        <p>Dates come from astronomical ephemerides — the same tables professional astrologers and planetarium software use — and are stated in UTC, with local-time conversion where it changes the answer. We do not copy dates from other astrology websites, which is why our station times sometimes differ from theirs by a few hours.</p>
        <p>Claims about services come from their published pricing, terms and refund policies on the day we check them, and we say which day that was. Where a seller will not publish a price, we say so instead of inventing one.</p>
      </div>
      <div>
        <span className="eyebrow">INDEPENDENCE &amp; CORRECTIONS</span>
        <h2>Fixed in place, in public.</h2>
        <p>Some guides carry affiliate links, always labelled at the point of the link and marked with <code>rel="sponsored"</code>. They fund the site. They never change a date, a price we quote, or a conclusion, and no seller has ever paid for coverage.</p>
        <p>Errors are corrected in the article they affect, with the correction noted on the page and the date of the change — not quietly replaced. Read the full <Link to="/editorial">editorial policy</Link> and the <Link to="/ai-policy">AI content policy</Link>.</p>
        <p>Every guide is edited and signed off by <Link to="/author/hedi-touati">Hedi Touati</Link>, the founder and editor, who computes the dates and owns the corrections.</p>
      </div>
    </section>

    <section className="about-grid">
      <div>
        <span className="eyebrow">WHAT ASTROLOGY IS — AND IS NOT</span>
        <h2>A symbolic practice, not a prediction engine.</h2>
        <p>We treat astrology as a symbolic and reflective practice with a long history: useful as a language for timing and temperament, unreliable as a forecast of specific events. It is not medicine, not law and not financial advice, and no page on this site should be read as any of the three.</p>
        <p>That boundary matters most in the cost guides: if you are paying for a reading, you deserve to know what you are buying before you buy it. That is the entire reason those guides exist.</p>
      </div>
      <div>
        <span className="eyebrow">START HERE</span>
        <h2>New to all of this?</h2>
        <p>If you want the ground rules first, read what a birth chart is and what a reading actually covers, then work out which price tier you are shopping in. Those two articles frame everything else on the site.</p>
        <p><a className="text-link" href="/blog/what-to-expect-birth-chart-reading-2026/">What a birth chart reading covers <ArrowRight /></a></p>
        <p><a className="text-link" href="/blog/birth-chart-reading-cost-2026/">What a birth chart reading costs in 2026 <ArrowRight /></a></p>
      </div>
    </section>

    <section className="about-cta">
      <div><span className="eyebrow">SAY HELLO</span><h2>Corrections, questions, pitches?</h2><span className="about-cta-note">Email the editor — everything is read, and verified corrections are published with the next update of the article.</span></div>
      <a className="button" href="mailto:anistouati74@gmail.com">Contact the editor <Mail data-icon="inline-start" /></a>
    </section>

    <section className="about-cta">
      <div><span className="eyebrow">BROWSE</span><h2>All astrology guides</h2><span className="about-cta-note"><Compass /> Dated events, chart explainers and cost guides.</span></div>
      <a className="button button-ghost" href="/blog/">Open the blog <ScrollText data-icon="inline-start" /></a>
    </section>
  </div>
}
