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
  {
    slug: "involve-me",
    name: "involve.me",
    category: "B2B SaaS",
    tagline: "quiz funnels that capture, score and nurture leads in one tool.",
    description: "involve.me builds interactive quiz funnels, calculators and lead-scoring forms with a built-in AI funnel builder, email automation and payments — priced by live funnels, not responses. An independent review with current 2026 pricing versus Typeform, Paperform and Jotform.",
    score: 8.9,
    price: "Free plan · from $29/mo annual",
    accent: "violet",
    bestFor: "Marketers and agencies running quiz funnels",
    image: "/images/involve-me-review.png",
    pros: [
      "Priced by live funnels — unlimited responses on paid plans",
      "Real calculators, answer scoring and outcome pages built in",
      "AI funnel builder plus email automation and a built-in CRM",
      "350+ templates; embeds, pop-ups and landing pages from one build",
      "SOC 2 Type 2 audited and GDPR compliant",
    ],
    cons: [
      "Branding removal starts on the Grow plan ($69/mo annual)",
      "Start plan's 3 live funnels is tight for active marketers",
      "A/B testing, custom CSS and Salesforce locked behind Scale ($139/mo)",
      "Free plan capped at 50 submissions or 500 visits a month",
      "Monthly billing is much pricier ($49/$99/$199)",
    ],
    features: [
      "Quiz funnels & outcome pages",
      "Calculators & lead scoring",
      "AI funnel builder",
      "Email automation",
      "Payments & e-signatures",
      "30+ integrations",
    ],
    summaryBody: [
      "Everyone in this category gets compared to Typeform, so start there: Typeform makes a beautiful question-at-a-time survey and charges you by the response — 100 a month on the $25 entry plan. involve.me flips the model. You pay for a handful of live funnels and get unlimited responses, and the product is built not for surveys but for funnels: quiz flows that score answers, calculate prices, segment the lead, take a payment and trigger the follow-up sequence without leaving the tool.",
      "What you are really buying is the qualification stack in one place. The calculator and scoring engine is native (no workarounds), outcome pages show personalized results, an AI builder drafts the whole funnel from a prompt, and a built-in email automation and CRM layer nurtures the leads you capture — with 30+ integrations (HubSpot, Klaviyo, Pipedrive, Zapier-class webhooks on Scale) for everything else. Current official pricing: Start at $29/mo annual (3 funnels, 1 user), Grow at $69 (5 funnels, branding removed, custom domain), Scale at $139 (25 funnels, A/B testing, OTP verification, Salesforce), Enterprise from $499 with SSO. Security is unusually strong for this niche: SOC 2 Type 2 audited and GDPR compliant by design.",
      "The honest caveats: the tier walls are the real cost. involve.me branding stays on everything until Grow, Google Tag Manager arrives at Grow, and A/B testing, custom CSS, e-signatures and Salesforce wait for Scale. Start's 3 live funnels forces an upgrade the moment you run more than one campaign plus a landing page. The free plan (50 submissions or 500 visits a month) is a playground, not a production tier. And if all you want is a pretty contact form, Tally does unlimited free and Typeform is more polished — involve.me pays off when the form is a revenue channel.",
    ],
    scoreBreakdown: [
      { label: "Value for money", score: 8.8 },
      { label: "Feature depth", score: 9.2 },
      { label: "Ease of use", score: 8.8 },
      { label: "Integrations", score: 8.5 },
      { label: "Analytics & testing", score: 8.0 },
      { label: "Security & compliance", score: 9.5 },
    ],
    verdictText: "If a form is a lead-capture channel and not just a questionnaire, involve.me is the most complete tool we have scored under $100 a month. The funnel-based pricing means a viral quiz costs the same as a flop, the calculator and scoring engine is native rather than bolted on, and the built-in email automation plus CRM means you are not paying for a third tool to nurture what you capture. Size the plan honestly: solo with one funnel, Start ($29/mo annual) works; agencies and anyone serious about brand, Grow ($69) is the real entry point; A/B testing and Salesforce need Scale ($139). For plain surveys, Tally's free plan or Typeform's polish win; for 1,000+ integration depth, Outgrow. For quiz funnels that qualify and nurture leads end to end, this is the one to beat.",
    faq: [
      { q: "How much does involve.me cost?", a: "Current official pricing (October 2026): a free plan for testing, Start at $29/user-month billed annually ($49 monthly) with 3 live funnels, Grow at $69/mo annual ($99 monthly) with 5 funnels and branding removed, Scale at $139/mo annual ($199 monthly) with 25 funnels, A/B testing and Salesforce, and Enterprise from $499/mo with SSO. Extra seats are $10/user/month. Several older reviews still circulate 2024-era pricing, so always check the official page." },
      { q: "Is involve.me a good Typeform alternative?", a: "Yes, when the form is a funnel. involve.me has native calculators, answer scoring, outcome pages, AI funnel building and built-in email automation that Typeform lacks, and it charges per live funnel rather than per response. Typeform remains more polished for plain conversational surveys, and Tally is cheaper for simple unlimited forms." },
      { q: "What are the limits of the free plan?", a: "The free plan is capped at 50 submissions or 500 visits per month with 1 user — enough to learn the builder and test a funnel, not to run production campaigns. Paid plans add live funnels (3/5/25) with unlimited responses and unlimited response-data retention on Start and Grow." },
      { q: "Can I remove involve.me branding?", a: "Branding removal (and custom domains, white-labeled participant emails and hidden fields) starts on the Grow plan at $69/month billed annually. Everything below that carries the involve.me watermark." },
      { q: "Does involve.me have calculators and AI features?", a: "Yes. The calculator uses formula-based fields with individual values, scores and conditional logic — built for price quotes, ROI and cost estimators — and the AI funnel builder drafts complete funnels from a prompt, with monthly AI credits included on every paid plan (50 on Start, doubling on annual billing)." },
      { q: "Is involve.me secure and GDPR compliant?", a: "involve.me is SOC 2 Type 2 audited and GDPR compliant by design, with SSL encryption, response-data anonymization options for analytics, and an option to block EU users on Grow and above — a stronger compliance posture than most of this category." },
    ],
    affiliateUrl: "https://www.involve.me/?red=hhgg",
    updated: "October 2026",
  },
  {
    slug: "convert",
    name: "Convert.com",
    category: "Marketing",
    tagline: "transparent, privacy-first A/B testing for teams that outgrew free tools.",
    description: "Convert.com (Convert Experiences) is a mid-market A/B testing platform with both Bayesian and Frequentist statistics, 90+ integrations, full-stack testing and a rare compliance stack — priced transparently by monthly tested users from $299/month. An independent review with honest limits and VWO, Optimizely and PostHog comparisons.",
    score: 8.8,
    price: "15-day free trial · from $299/mo annual",
    accent: "emerald",
    bestFor: "CRO teams and agencies with real traffic",
    image: "/images/convert-review.png",
    pros: [
      "Transparent flat pricing by monthly tested users — no contact-sales wall",
      "Both Bayesian and Frequentist engines, SRM checks and sequential testing",
      "Full-stack testing and feature flags on Pro, not a separate product",
      "90+ integrations: GTM, HubSpot, Salesforce, Hotjar, Clarity, WordPress",
      "Privacy-first: first-party only, EU data residency, SOC 2 Type 2, ISO 27001, HIPAA",
      "Free VWO migration and a 15-day trial with no credit card",
    ],
    cons: [
      "Real entry price: $299/mo annual ($399 monthly) — no free tier",
      "Growth plan caps you at 5 projects with 5 live experiences each",
      "Phone support and guided onboarding only from Pro ($420/mo annual)",
      "No development support on any plan",
      "Overkill and overpriced for low-traffic sites (VWO is free to 50K users)",
    ],
    features: [
      "A/B & split URL testing",
      "Multivariate & multi-page (Pro)",
      "Full-stack & feature flags",
      "Convert Signals & heatmaps",
      "Dual stats engines + SRM check",
      "90+ integrations",
    ],
    summaryBody: [
      "A/B testing has a pricing problem: the serious tools (Optimizely, Adobe Target, Kameleoon) hide behind contact-sales walls and five-figure contracts, while the affordable end (VWO's free tier, PostHog) either caps features or stops where experimentation gets interesting. Convert.com — running since 2008, one of the two standard Google Optimize replacements alongside VWO — positions itself exactly in that gap: publish-your-prices mid-market experimentation. Growth is $299/month billed annually ($399 monthly) for 100,000 monthly tested users; Pro is $420/month annual ($599 monthly) at the same traffic, adding multivariate and multi-page testing, full-stack and feature flags, bandit allocation, SSO and phone support; Enterprise is custom. The unit is the tested user, so you pay for audience size, not per experiment — and the price ladder is on the website, which in this category is almost a feature in itself.",
      "What you get for it is a genuinely complete stack. Both statistical engines (Bayesian and Frequentist) with an SRM check to catch bad randomization; a visual editor plus code editor; Convert Signals anomaly flags and heatmaps; a QA wizard; 90+ integrations; and a compliance posture most competitors cannot match — SOC 2 Type 2, ISO 27001, HIPAA, GDPR and CCPA, first-party cookies only, EU data residency. Since Google Optimize sunset in 2023, Convert has also courted switchers deliberately: free VWO migration on every plan, a 15-day trial without a credit card, and newer bets like an MCP server, an AI layer (Convert Intelligence, in beta) and Shopify price testing.",
      "The honest limits: this is not a beginner tool at a beginner price. $299 a month is a real line item, and if your site runs under ~50K monthly tested users you will never out-test the free options — VWO's free Starter or PostHog's generous tier will carry you until real traffic arrives. The Growth plan quietly caps you at 5 projects and 5 live experiences per project, which is the practical reason most teams land on Pro. There is no development support on any plan, and phone support waits for Pro. But for a CRO team or agency with meaningful traffic, a testing roadmap and a privacy requirement, Convert is one of the few platforms where the price, the statistics and the compliance all behave like adults.",
    ],
    scoreBreakdown: [
      { label: "Value for money", score: 8.6 },
      { label: "Feature depth", score: 9.0 },
      { label: "Statistical rigor", score: 9.3 },
      { label: "Ease of use", score: 8.5 },
      { label: "Integrations", score: 9.2 },
      { label: "Privacy & compliance", score: 9.5 },
    ],
    verdictText: "If A/B testing is a program at your company rather than an experiment, Convert.com is one of the sanest ways to run it. Transparent per-tested-user pricing means the bill scales with audience, not with the number of tests you dare to run; the dual stats engines, SRM checks and full-stack support on Pro are tools for people who take experimentation seriously; and the SOC 2 / ISO 27001 / HIPAA stack plus EU data residency clears procurement conversations that kill Optimizely migrations. Size it honestly: under 50K monthly tested users, start on VWO's free tier or PostHog and upgrade when traffic forces the question; at 100K+ with a real testing roadmap, Growth ($299/mo annual) unless the 5-project cap bothers you, in which case Pro ($420) is the true entry point. For enterprises, it is a quote. The 15-day trial needs no credit card — run one real test through it before you decide, and the decision will make itself.",
    faq: [
      { q: "How much does Convert.com cost?", a: "Current official pricing: Growth at $299/month billed annually ($399 monthly) for 100,000 monthly tested users with up to 5 projects and 5 live experiences each; Pro at $420/month annual ($599 monthly) at the same traffic with 30 projects, unlimited experiences, multivariate testing, full-stack and feature flags, SSO and phone support; Enterprise is custom-priced. A 15-day free trial requires no credit card. Several reviews still list older or invented plan structures, so verify on the official pricing page." },
      { q: "Is Convert.com a good VWO alternative?", a: "Yes — it is one of the two standard migrations after Google Optimize sunset in 2023, and Convert offers free VWO migration on every plan. Convert's edges are transparent published pricing, both Bayesian and Frequentist statistics, deeper targeting at entry level and 90+ integrations; VWO's edge is a genuinely free Starter tier for up to 50,000 tested visitors a month, which matters below Convert's price floor." },
      { q: "What are monthly tested users (MTUs)?", a: "The pricing unit: unique users included in at least one experiment each month, not your total site traffic. Visitors you never test into do not count, which is why two sites with identical traffic can have very different Convert bills — and why the same 100K MTU allowance stretches further as your targeting gets sharper." },
      { q: "Is Convert.com good for small or low-traffic sites?", a: "Honestly, no. At $299/month minimum it is priced for sites where testing already has a budget. Below roughly 50,000 monthly tested users, VWO's free Starter tier, PostHog's free tier or GrowthBook ($20/user/month) will do everything a low-traffic program needs — and low traffic also means slow statistical significance regardless of tool." },
      { q: "How is Convert on privacy and compliance?", a: "It is the strongest we have scored in this category: SOC 2 Type 2, ISO 27001, HIPAA, GDPR and CCPA compliance, first-party cookies only (no third-party tracking), EU data residency, and an SRM check on every experiment. For healthcare, finance or EU-heavy businesses, this stack routinely shortens procurement." },
      { q: "What is missing or locked behind higher plans?", a: "Multivariate and multi-page testing, full-stack testing, feature flags, bandit allocation, sequential testing, SSO and phone support all require Pro ($420/month annual). No plan includes development support. The Growth plan's 5-project, 5-experience cap is the most common reason for upgrading." },
    ],
    affiliateUrl: "https://www.convert.com/free-trial/?red=hhgg",
    updated: "October 2026",
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
