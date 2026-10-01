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
    slug: "pocket-option",
    name: "Pocket Option",
    category: "Finance",
    tagline: "binary options trading with a $5 entry — and everything that implies.",
    description: "Pocket Option is a fast, feature-rich binary options broker with 100+ assets, payouts up to ~92%, a free demo and 50+ payment methods — licensed only offshore and blacklisted by several regulators. An honest review with the risk math.",
    score: 6.4,
    price: "Free demo · deposits from $5–10",
    accent: "orange",
    bestFor: "Experienced traders in jurisdictions where it is legal",
    image: "/images/pocket-option-review.png",
    pros: [
      "Genuinely fast, polished platform a beginner can learn in an afternoon",
      "Low entry: deposits from $5–10 and trades from $1",
      "Free unlimited demo account with virtual funds",
      "100+ assets including forex, crypto, commodities and indices, plus 24/7 OTC pairs",
      "50+ deposit and withdrawal methods, including crypto; most withdrawals process within 24 hours",
      "Social/copy trading, tournaments and MT4/MT5 for its forex side",
    ],
    cons: [
      "Offshore licence only (Mwali/Comoros) — no FCA, CySEC, ASIC or CFTC oversight",
      "On the US CFTC RED List and the UK FCA unauthorised list; blacklisted by Belgium's FSMA",
      "Binary options are banned for retail traders in the EU, UK, Canada and Australia",
      "Negative expected value by design: a 90% payout means you need a 52.6% win rate just to break even",
      "Broker-set OTC prices cannot be verified against an independent market feed",
      "Deposit bonuses come with turnover rules that can lock withdrawals",
    ],
    features: [
      "Quick high–low binary trades",
      "100+ assets incl. 24/7 OTC",
      "Free demo account",
      "Social & copy trading",
      "MT4/MT5 forex side",
      "50+ payment methods",
    ],
    summaryBody: [
      "This is the hardest kind of product to review honestly, so let's put the whole frame on the table first. Pocket Option is a binary options broker — you stake that a price will be higher or lower within seconds to hours, win a fixed payout of roughly 80–92% if right, lose the entire stake if wrong. The platform itself is real, fast and genuinely well built: 100+ assets including 24/7 OTC pairs, a free unlimited demo, social and copy trading, tournaments, 50+ payment methods including crypto, and a forex/MT5 side with leverage up to 1:1000. Minimum entry is low: deposits from $5–10, trades from $1. As a piece of software, it is among the best in its class — which is exactly why it deserves an unusually careful review.",
      "Now the part that matters more. Regulation: the operator (Infinite Trade LLC, previously Gembell Limited) holds only an offshore Mwali/Comoros licence — no FCA, CySEC, ASIC or CFTC oversight — and the platform appears on the US CFTC RED List for soliciting US customers without registration, the UK FCA's unauthorised-firms list, and Belgium's FSMA blacklist. Binary options are banned for retail traders across the EU (ESMA, 2018, made permanent), the UK, Canada and Australia, and Pocket Option itself says it does not serve residents of the EEA, USA, UK, Israel or Japan. If you live in any of those places, this review ends here: using the platform is not legal for you, and no feature set changes that.",
      "And the math: the product is structurally negative expected value. At a 90% payout you must win 52.6% of your trades just to break even — before the short expiries, the gamified tournaments and the broker-set OTC prices (which cannot be verified against an independent feed) tilt things further. Regulators' reviews of this product class found the large majority of retail accounts lose money; treat any trading budget as entertainment money you can afford to lose entirely. The bonuses deserve their own warning: accepting one attaches turnover requirements that can lock your withdrawals until you trade a multiple of the deposit. If you are in a jurisdiction where this is legal, you accept gambling-level risk, and you want to experiment small — the demo first, then $20–50 you can lose without noticing — the platform delivers what it promises. That is a narrow, honest endorsement, and it is the only one this product earns.",
    ],
    scoreBreakdown: [
      { label: "Platform & usability", score: 8.6 },
      { label: "Assets & features", score: 8.4 },
      { label: "Deposits & withdrawals", score: 7.4 },
      { label: "Trust & regulation", score: 3.5 },
      { label: "Profitability outlook", score: 4.0 },
      { label: "Beginner safety", score: 4.5 },
    ],
    verdictText: "Scored as software, Pocket Option is an 8.5. Scored as a financial decision for the average reader, it is a 4 — so our overall 6.4 is a warning wrapped in a compliment. The platform is fast, feature-rich and honest about its mechanics; the business around it is not something we can recommend broadly, because it is licensed only offshore, flagged by the US CFTC (RED List), the UK FCA and Belgium's FSMA, and banned for retail traders across the EU, UK, Canada and Australia. If binary options are legal where you live, you understand that the payout structure requires a >52.6% win rate just to break even, and you are risking money you can lose entirely — then a small, disciplined experiment on the free demo before any real deposit is a defensible choice, and this is one of the smoother platforms to do it on. If any of those conditions does not apply to you: skip it. This is not financial advice, and with this product category, that sentence is doing real work.",
    faq: [
      { q: "Is Pocket Option legit?", a: "It is a real, operating platform — deposits and withdrawals generally process, and it has a large user base. But 'legit' and 'recommended' are different questions: it holds only an offshore Mwali (Comoros) licence, appears on the US CFTC RED List and the UK FCA's unauthorised list, and is blacklisted by Belgium's FSMA. There is no top-tier regulatory oversight, which means no investor-compensation scheme and little recourse if something goes wrong." },
      { q: "Is Pocket Option available in the US, UK or EU?", a: "No. The platform itself states it does not serve residents of the USA, EEA, UK, Israel or Japan, and binary options are banned for retail traders across the EU, UK, Canada and Australia. In the US, off-exchange binary options are prohibited and Pocket Option sits on the CFTC RED List. Availability elsewhere depends on local law — check your jurisdiction before opening an account." },
      { q: "How much money do I need to start?", a: "The advertised minimum deposit is $5–10 depending on payment method (some crypto methods require more), with trades from $1. The practical advice is stricter than the platform's minimum: start on the free demo account, and if you go live, begin with an amount you could lose entirely without it affecting anything — for most people that means tens of dollars, not hundreds." },
      { q: "Can you actually make money with binary options?", a: "The structure makes it genuinely hard: a 90% payout means you need to win about 52.6% of your trades just to break even, and 55.6% at an 80% payout. Short expiries add noise, and the broker's own OTC pricing cannot be checked against an independent market feed. Regulatory reviews of this product class found most retail accounts lose money. A minority of disciplined traders do profit over periods; treat the base rate, not the success stories, as your planning assumption." },
      { q: "How do deposits and withdrawals work?", a: "Over 50 methods — cards, e-wallets (Skrill, Neteller, Perfect Money, WebMoney), bank transfer and multiple cryptocurrencies. Most withdrawals process within 24 hours according to user reports. Two cautions: never accept a deposit bonus unless you fully understand the turnover requirements, which can lock withdrawals until you trade a multiple of the amount, and verify your identity fully before depositing to avoid withdrawal friction." },
      { q: "Is Pocket Option the same as gambling?", a: "The mechanics are close: a stake, a short time window, a fixed payout and a house edge built into the payout ratio. That similarity is precisely why the EU, UK, Canada and Australia banned retail binary options — regulators classified the product as structurally weighted against the customer. Framing it as 'trading' does not change the arithmetic." },
    ],
    affiliateUrl: "https://u3.shortink.io/smart/XsYtnXoTxmVmbj",
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
