export type Review = {
  slug: string
  name: string
  category: string
  tagline: string
  description: string
  score: number
  price: string
  accent: string
  bestFor: string
  pros: string[]
  cons: string[]
  features: string[]
  affiliateUrl: string
  updated: string
  image?: string
  summaryBody?: string[]
  scoreBreakdown?: { label: string; score: number }[]
  verdictText?: string
  faq?: { q: string; a: string }[]
}

export const categories = ["All reviews", "B2B SaaS", "Finance", "Marketing", "Developer tools"]

export const reviews: Review[] = [
  { slug: "notion", name: "Notion", category: "B2B SaaS", tagline: "The connected workspace for modern teams.", description: "A flexible workspace that brings docs, projects, wikis, and AI together without the usual tool sprawl.", score: 9.4, price: "Free plan · Plus from $8/seat", accent: "violet", bestFor: "Cross-functional teams", pros: ["Exceptional flexibility", "Excellent collaboration", "Powerful templates"], cons: ["Can feel overwhelming", "Advanced permissions cost more"], features: ["Docs & wikis", "Projects", "AI assistant", "Real-time collaboration"], affiliateUrl: "https://www.notion.so/product", updated: "September 2026" },
  { slug: "linear", name: "Linear", category: "Developer tools", tagline: "The purpose-built tool for high-performing product teams.", description: "Fast, opinionated issue tracking that keeps engineering, product, and design aligned around outcomes.", score: 9.2, price: "Free plan · Business from $16/user", accent: "blue", bestFor: "Product & engineering teams", pros: ["Exceptional speed", "Beautiful workflows", "Great keyboard support"], cons: ["Opinionated for a reason", "Smaller teams may not need every feature"], features: ["Issue tracking", "Cycles", "Roadmaps", "Git integrations"], affiliateUrl: "https://linear.app", updated: "September 2026" },
  { slug: "hubspot", name: "HubSpot", category: "Marketing", tagline: "A complete customer platform that grows with you.", description: "CRM, marketing automation, sales, and service tools in one approachable platform for scaling businesses.", score: 8.9, price: "Free CRM · Starter from $20/month", accent: "orange", bestFor: "Growing revenue teams", pros: ["Generous free CRM", "Strong automation", "Huge ecosystem"], cons: ["Costs scale quickly", "Some features are spread across hubs"], features: ["CRM", "Email campaigns", "Automation", "Reporting"], affiliateUrl: "https://www.hubspot.com", updated: "August 2026" },
  { slug: "wise-business", name: "Wise Business", category: "Finance", tagline: "International payments without the hidden markups.", description: "A transparent business account for paying suppliers, receiving money, and managing multiple currencies.", score: 8.7, price: "Pay as you go · transparent fees", accent: "emerald", bestFor: "Global small businesses", pros: ["Transparent exchange rates", "Multi-currency account", "Fast transfers"], cons: ["Not a full-service bank", "Availability varies by country"], features: ["Multi-currency balances", "Batch payments", "Expense cards", "API access"], affiliateUrl: "https://wise.com/business", updated: "August 2026" },
  { slug: "joiin", name: "Joiin", category: "Finance", tagline: "Financial reporting and consolidation without spreadsheet sprawl.", description: "Joiin brings multi-entity reporting, consolidation, dashboards, and connected financial data into one platform for finance teams and accountants.", score: 9.0, price: "14-day free trial · pricing varies by plan", accent: "blue", bestFor: "Finance teams, CFOs, and accountants managing multiple entities", pros: ["Strong multi-entity consolidation", "Connects Xero, QuickBooks, Sage, and spreadsheets", "Board-ready report packs", "Real-time dashboards and AI insights"], cons: ["Best value comes with more complex reporting needs", "Pricing and availability should be confirmed for your region"], features: ["Multi-entity consolidation", "Budget vs actual reporting", "Multi-currency", "Intercompany management", "Report packs", "Joiin Connect API"], affiliateUrl: "https://joiin.co/?red=hhgg&utm_source=hhgg&utm_medium=revshare&utm_affiliate_network=reditus", updated: "September 2026" },
  { slug: "volza", name: "Volza", category: "B2B SaaS", tagline: "Global trade intelligence for sharper import and export decisions.", description: "Volza helps importers, exporters, sourcing teams, and market researchers explore shipment, customs, buyer, supplier, pricing, and product-growth data across more than 203 countries.", score: 9.1, price: "Free data credits · demo and paid plans available", accent: "blue", bestFor: "Importers, exporters, sourcing teams, and trade intelligence professionals", pros: ["Coverage across 203+ countries", "Buyer and supplier discovery", "Shipment and pricing intelligence", "Product and market growth signals"], cons: ["Best suited to teams with active trade research needs", "Data access and pricing vary by market and usage"], features: ["Import-export shipment data", "Buyer and supplier intelligence", "HS code and product research", "Price and volume trends", "Trade dashboards", "Duty and market analysis"], affiliateUrl: "https://www.volza.com/export-import-trade-data/?red=hhgg&utm_source=partner&utm_medium=reditus", updated: "September 2026" },  {
    slug: "mera-work",
    name: "Mera Work",
    category: "B2B SaaS",
    tagline: "budget employee monitoring that skips the feature paywalls.",
    description: "Mera Work (formerly Mera Monitor) puts live screen streaming, stealth and private modes, attendance and AI productivity reports on every plan, from $3 per user per month. An independent review with pricing versus Hubstaff, Time Doctor and Teramind.",
    score: 8.6,
    price: "Free trial · $4/user monthly · $3 annual",
    accent: "blue",
    bestFor: "Small and mid-sized remote teams",
    image: "/images/mera-work-review.png",
    pros: [
      "Every feature on every plan — no tier paywalls",
      "Live screen streaming and interactive mode at entry price",
      "Both a stealth mode and a genuine private mode",
      "iOS and Android apps alongside desktop agents",
      "ISO-certified, CMMI Level 3 parent company (AAPNA Infotech)",
    ],
    cons: [
      "Weak project-management integrations (Jira, Asana, ClickUp)",
      "Stealth mode needs legal review before EU/US rollouts",
      "Data retention tops out at three months",
      "Thin independent track record outside India",
    ],
    features: [
      "Live screen streaming",
      "Automatic time tracking",
      "App & website classification",
      "Attendance & time claims",
      "AI productivity reports",
      "Stealth & private modes",
    ],
    summaryBody: [
      "Employee monitoring is a category where the same five names get recycled through every listicle, and where the price floor has quietly settled around $7 per user per month. Mera Work — formerly Mera Monitor, built by AAPNA Infotech, an ISO-certified, CMMI Level 3 software house — comes in from below: $4 per user monthly, $3 on annual billing, with the entire feature set unlocked on every tier. No screenshots-only-on-the-Pro-plan arithmetic, no add-on fees. That alone earns it a look. The interesting parts are elsewhere, though.",
      "Two decisions define the product. First, it takes visibility seriously as a management tool: live screen streaming (watch a screen the way you would walk past a desk), an interactive mode, real-time idle and suspicious-activity alerts, and AI daily and weekly summaries that sort time into productive, neutral and unproductive. Second — unusually at this end of the market — it takes privacy seriously too: a private mode that lets employees pause tracking for confidential or personal work, role-based access so managers see only their own people, and a time-claims workflow so offline meetings still count. That pairing is rare at $15 a seat, let alone $3.",
      "The honest caveats: integrations are the weak flank — if your world runs through Jira, Asana or ClickUp, timesheets stay siloed and you will be exporting. The stealth mode is powerful and, in several jurisdictions, legally radioactive without notification and policy work; do that review before you switch it on. Data retention tops out at three months. And almost everything published about the product is either the vendor's own material or listing-site write-ups — which is exactly why an independent review was worth writing.",
    ],
    scoreBreakdown: [
      { label: "Value for money", score: 9.5 },
      { label: "Feature depth", score: 9.0 },
      { label: "Ease of use", score: 8.5 },
      { label: "Reporting & analytics", score: 8.5 },
      { label: "Integrations", score: 6.5 },
      { label: "Privacy & compliance", score: 8.0 },
    ],
    verdictText: "If you run a remote or hybrid team of roughly 10 to 200 people and the mainstream tools cost more than the problem you are solving, Mera Work is the rare budget pick that does not strip the serious features to hit a price. Live streaming, stealth mode, attendance, AI reporting, mobile apps — all of it is on every plan, from $3 per user per month annual. A 50-seat team pays about $1,800 a year that way, versus $4,200 or more at Hubstaff or Time Doctor list pricing. The trade is real: integrations are thin, data retention stops at three months, and the brand's independent track record outside India is still being written. So pilot it — one team, transparent settings, private mode on — and let its reports make the renewal case. For insider-threat and data-loss prevention, Teramind stays the specialist. For SMB monitoring on a budget, this is the strongest value we have scored this year.",
    faq: [
      { q: "What does Mera Work cost?", a: "Mera Work costs $4 per user per month billed monthly, or $3 per user per month billed annually (roughly ₹325/₹250 in India), with custom enterprise pricing for 1000+ users. Every plan includes the full feature set with no add-ons, and the free trial requires no card." },
      { q: "Is Mera Work the same product as Mera Monitor?", a: "Yes. Mera Monitor rebranded to Mera Work in 2026. The product, pricing and parent company (AAPNA Infotech) are unchanged, which is why reviews and listings still appear under both names." },
      { q: "Is Mera Work legal to use for employee monitoring?", a: "That depends on your jurisdiction and how you configure it. Mera Work offers a stealth mode, but in the EU, UK and several US states you must notify employees — and in some cases obtain consent — before continuous tracking or screen capture. Put an acceptable-use policy and a legal review in place first; the private mode and role-based access make it easier to run a transparent program." },
      { q: "How does Mera Work compare with Hubstaff and Time Doctor?", a: "Mera Work's $3 annual price is less than half the roughly $7 entry price of Hubstaff or Time Doctor, and it includes live screen streaming and stealth mode that those tools reserve for higher tiers or do not offer at all. The trade-off is integrations: Hubstaff and Time Doctor connect to 30-60+ project-management and payroll tools, while Mera Work's PM integrations are limited and timesheets mostly stay inside its own system." },
      { q: "Does Mera Work work on mobile?", a: "Yes. Mera Work ships iOS and Android apps alongside its Windows and Mac desktop agents, so field and hybrid staff can clock in and out without a laptop. Some users still ask for deeper on-the-go management and alerts, which the company lists as roadmap items." },
    ],
    affiliateUrl: "https://mera.work/?red=hhgg",
    updated: "September 2026",
  },

]

export const testimonials = [
  { quote: "The clearest software reviews I have found. We replaced three tools after one comparison.", name: "Maya Chen", role: "COO, Northstar Labs" },
  { quote: "Prophetic makes complex buying decisions feel calm, practical, and genuinely independent.", name: "James Okafor", role: "Founder, Relay Studio" },
  { quote: "The scoring framework is refreshingly specific. Every recommendation has a reason behind it.", name: "Elena Rossi", role: "VP Growth, Forma" },
]

export const getReview = (slug: string) => reviews.find((review) => review.slug === slug)

export const reviewSchema = (review: Review) => ({
  "@context": "https://schema.org",
  "@type": "Review",
  itemReviewed: { "@type": "SoftwareApplication", name: review.name, applicationCategory: review.category },
  reviewRating: { "@type": "Rating", ratingValue: review.score, bestRating: 10 },
  author: { "@type": "Organization", name: "Prophetic" },
  reviewBody: review.verdictText || review.description,
  dateModified: review.updated,
})

export const productSchema = (review: Review) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: review.name,
  description: review.description,
  aggregateRating: { "@type": "AggregateRating", ratingValue: review.score, bestRating: 10, ratingCount: 1 },
})

export const affiliateProps = { rel: "sponsored nofollow", target: "_blank" }

export default reviews
