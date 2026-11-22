import { motion } from "framer-motion";
import { AlertTriangle, Link2, Scale, FileText } from "lucide-react";

const sections = [
  { icon: FileText, title: "General information", content: "Prophetic publishes educational material about astrology, birth-chart concepts and observable sky events. The site is provided for general information and reflection. We aim to identify sources for factual claims, but dates and details can vary by source, method and time zone. Check the references linked in the relevant guide." },
  { icon: AlertTriangle, title: "Astrology is not a scientific prediction method", content: "Astrological meanings are symbolic interpretations within a historical tradition. They are not scientifically established causal explanations and should not be treated as guaranteed predictions about a person's life, relationships, work or future." },
  { icon: Scale, title: "Not professional advice", content: "Nothing on Prophetic is medical, psychological, legal, financial or safety advice. Do not delay treatment, change medication, make investments, ignore legal obligations or take safety risks because of an astrological interpretation. Speak with a qualified professional when you need advice." },
  { icon: Link2, title: "Advertising and external links", content: "The site is supported by display advertising, including Google advertising services and an authorised advertising partner. Ads are not endorsements. Prophetic currently does not publish affiliate links. External references are provided for context; their content and privacy practices are controlled by their respective publishers." },
];

export default function Disclaimer() {
  return <main className="container-main py-12" role="main">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <header className="text-center mb-12"><h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Disclaimer</h1><p className="text-lg text-muted-foreground">Important boundaries for using Prophetic's astrology and sky-event guides.</p><p className="text-sm text-muted-foreground mt-4">Last updated: November 22, 2026</p></header>
      <div className="space-y-8">{sections.map((section) => <section key={section.title} className="bg-card rounded-xl border border-border p-6 md:p-8"><div className="flex items-start gap-4 mb-4"><div className="p-2 rounded-lg bg-primary/10"><section.icon className="w-6 h-6 text-primary" /></div><h2 className="font-display text-2xl font-bold">{section.title}</h2></div><p className="text-muted-foreground">{section.content}</p></section>)}</div>
      <div className="mt-12 text-center bg-muted rounded-xl p-8"><h2 className="font-display text-xl font-semibold mb-2">Questions?</h2><p className="text-muted-foreground mb-4">Contact the editor about a source, correction or disclosure.</p><a href="mailto:anistouati74@gmail.com" className="inline-flex items-center">anistouati74@gmail.com</a></div>
    </motion.div>
  </main>
}
