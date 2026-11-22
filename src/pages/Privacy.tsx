import { motion } from "framer-motion";

const sections = [
  ["What we collect", "Prophetic does not offer visitor accounts, comments or a newsletter sign-up. Our hosting and security providers may process technical request data such as IP address, browser information, requested URL and request time to deliver and protect the site."],
  ["Analytics", "Google Analytics may process information about pages viewed, device type, referrer and approximate location so the publisher can understand how the site is used. These services operate under Google's own terms and privacy information."],
  ["Advertising and cookies", "Prophetic is supported by Google advertising services and an authorised advertising partner. Advertising vendors may use cookies, web beacons, IP addresses or similar identifiers to deliver, measure and, where permitted, personalise advertisements. See Google's partner-sites information and the relevant vendor disclosures for details."],
  ["Your choices and regional consent", "You can manage cookies through your browser and personalised-ad preferences through Google Ads Settings. Ad serving and consent controls vary by location and applicable law. This policy does not claim that a consent prompt is active in every region; the publisher must ensure that an appropriate certified consent-management configuration is in place wherever required before personalised advertising is enabled."],
  ["Calculator inputs", "Inputs entered into the annual profection calculator are processed in your browser for the calculation. The calculator does not send those values to Prophetic's content database."],
  ["Children", "Prophetic is a general-audience publication and is not directed to children under 13. We do not knowingly collect personal information from children."],
  ["Requests and contact", "If you have a privacy question or request, email anistouati74@gmail.com. We will review what information we can access and explain if a request needs to be directed to a hosting, analytics or advertising provider."],
];

export default function Privacy() {
  return <div className="container-main py-12"><motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
    <header className="mb-12 text-center"><h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1><p className="text-muted-foreground">Last updated: November 22, 2026</p></header>
    <div className="prose prose-lg max-w-none dark:prose-invert">{sections.map(([title, body]) => <section key={title} className="mb-8"><h2>{title}</h2><p>{body}</p></section>)}</div>
    <p className="text-muted-foreground mt-8">External information: <a href="https://policies.google.com/technologies/partner-sites" rel="noopener noreferrer">How Google uses information from sites or apps that use its services</a> · <a href="https://adssettings.google.com/" rel="noopener noreferrer">Google Ads Settings</a>.</p>
  </motion.article></div>
}
