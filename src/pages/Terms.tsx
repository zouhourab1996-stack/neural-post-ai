import { motion } from "framer-motion";

const sections = [
  ["Using the site", "By accessing Prophetic, you agree to use the site lawfully and not to interfere with its operation, security or availability."],
  ["Content and copyright", "Articles, original text, design and other materials belong to Prophetic or their respective rights holders. You may link to our pages and quote short excerpts with attribution and a link to the original. Do not republish articles in full or present our work as your own."],
  ["Accuracy and updates", "Astronomical dates and event details can vary by source, calculation method and time zone. Consult the references linked in each guide and independently verify time-critical information. If you find an error, contact the editor."],
  ["Astrology and advice", "Astrological interpretations are symbolic and reflective, not scientifically established predictions or professional advice. Nothing on the site is medical, legal, financial or safety advice."],
  ["Advertising and external links", "Prophetic is supported by display advertising. Ads are not editorial endorsements. External links are provided for reference; we do not control third-party content or privacy practices."],
  ["Availability and liability", "The site is provided on an as-available basis. To the extent permitted by law, Prophetic makes no warranty that every page will always be available or that every third-party source will remain unchanged. Use the information with appropriate judgment."],
];

export default function Terms() {
  return <div className="container-main py-12"><motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
    <header className="mb-12 text-center"><h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1><p className="text-muted-foreground">Last updated: November 22, 2026</p></header>
    <div className="prose prose-lg max-w-none dark:prose-invert">{sections.map(([title, body]) => <section key={title} className="mb-8"><h2>{title}</h2><p>{body}</p></section>)}</div>
    <p className="text-muted-foreground mt-8">Questions about these terms: <a href="mailto:anistouati74@gmail.com">anistouati74@gmail.com</a>.</p>
  </motion.article></div>
}
