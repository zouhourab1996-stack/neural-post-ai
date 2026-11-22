import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";

export default function Contact() {
  return <div className="container-main py-12">
    <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
      <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Contact the <span className="text-primary">editor</span></h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Corrections, source questions and feedback about Prophetic's astrology and sky-event guides are welcome.</p>
    </motion.header>
    <div className="max-w-3xl mx-auto bg-card rounded-xl border border-border p-8">
      <Mail className="w-8 h-8 text-primary mb-4" />
      <h2 className="font-display text-2xl font-semibold mb-3">Email Hedi Touati</h2>
      <p className="text-muted-foreground mb-5">For a correction, include the article address, the detail you believe is wrong and a source or calculation we can check. For privacy requests, include enough information for us to understand the request without sending sensitive documents unless necessary.</p>
      <a className="button" href="mailto:anistouati74@gmail.com">anistouati74@gmail.com <ArrowRight /></a>
    </div>
    <p className="text-center text-sm text-muted-foreground mt-8">Prophetic does not provide personal chart readings or medical, legal or financial advice.</p>
  </div>
}
