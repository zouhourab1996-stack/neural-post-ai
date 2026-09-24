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
}

export const categories = ["All reviews", "B2B SaaS", "Finance", "Marketing", "Developer tools"]

export const reviews: Review[] = [
  { slug: "notion", name: "Notion", category: "B2B SaaS", tagline: "The connected workspace for modern teams.", description: "A flexible workspace that brings docs, projects, wikis, and AI together without the usual tool sprawl.", score: 9.4, price: "Free plan · Plus from $8/seat", accent: "violet", bestFor: "Cross-functional teams", pros: ["Exceptional flexibility", "Excellent collaboration", "Powerful templates"], cons: ["Can feel overwhelming", "Advanced permissions cost more"], features: ["Docs & wikis", "Projects", "AI assistant", "Real-time collaboration"], affiliateUrl: "https://www.notion.so/product", updated: "September 2026" },
  { slug: "linear", name: "Linear", category: "Developer tools", tagline: "The purpose-built tool for high-performing product teams.", description: "Fast, opinionated issue tracking that keeps engineering, product, and design aligned around outcomes.", score: 9.2, price: "Free plan · Business from $16/user", accent: "blue", bestFor: "Product & engineering teams", pros: ["Exceptional speed", "Beautiful workflows", "Great keyboard support"], cons: ["Opinionated for a reason", "Smaller teams may not need every feature"], features: ["Issue tracking", "Cycles", "Roadmaps", "Git integrations"], affiliateUrl: "https://linear.app", updated: "September 2026" },
  { slug: "hubspot", name: "HubSpot", category: "Marketing", tagline: "A complete customer platform that grows with you.", description: "CRM, marketing automation, sales, and service tools in one approachable platform for scaling businesses.", score: 8.9, price: "Free CRM · Starter from $20/month", accent: "orange", bestFor: "Growing revenue teams", pros: ["Generous free CRM", "Strong automation", "Huge ecosystem"], cons: ["Costs scale quickly", "Some features are spread across hubs"], features: ["CRM", "Email campaigns", "Automation", "Reporting"], affiliateUrl: "https://www.hubspot.com", updated: "August 2026" },
  { slug: "wise-business", name: "Wise Business", category: "Finance", tagline: "International payments without the hidden markups.", description: "A transparent business account for paying suppliers, receiving money, and managing multiple currencies.", score: 8.7, price: "Pay as you go · transparent fees", accent: "emerald", bestFor: "Global small businesses", pros: ["Transparent exchange rates", "Multi-currency account", "Fast transfers"], cons: ["Not a full-service bank", "Availability varies by country"], features: ["Multi-currency balances", "Batch payments", "Expense cards", "API access"], affiliateUrl: "https://wise.com/business", updated: "August 2026" },
  { slug: "joiin", name: "Joiin", category: "Finance", tagline: "Financial reporting and consolidation without spreadsheet sprawl.", description: "Joiin brings multi-entity reporting, consolidation, dashboards, and connected financial data into one platform for finance teams and accountants.", score: 9.0, price: "14-day free trial · pricing varies by plan", accent: "blue", bestFor: "Finance teams, CFOs, and accountants managing multiple entities", pros: ["Strong multi-entity consolidation", "Connects Xero, QuickBooks, Sage, and spreadsheets", "Board-ready report packs", "Real-time dashboards and AI insights"], cons: ["Best value comes with more complex reporting needs", "Pricing and availability should be confirmed for your region"], features: ["Multi-entity consolidation", "Budget vs actual reporting", "Multi-currency", "Intercompany management", "Report packs", "Joiin Connect API"], affiliateUrl: "https://joiin.co/?red=hhgg&utm_source=hhgg&utm_medium=revshare&utm_affiliate_network=reditus", updated: "September 2026" },
  { slug: "volza", name: "Volza", category: "B2B SaaS", tagline: "Global trade intelligence for sharper import and export decisions.", description: "Volza helps importers, exporters, sourcing teams, and market researchers explore shipment, customs, buyer, supplier, pricing, and product-growth data across more than 203 countries.", score: 9.1, price: "Free data credits · demo and paid plans available", accent: "blue", bestFor: "Importers, exporters, sourcing teams, and trade intelligence professionals", pros: ["Coverage across 203+ countries", "Buyer and supplier discovery", "Shipment and pricing intelligence", "Product and market growth signals"], cons: ["Best suited to teams with active trade research needs", "Data access and pricing vary by market and usage"], features: ["Import-export shipment data", "Buyer and supplier intelligence", "HS code and product research", "Price and volume trends", "Trade dashboards", "Duty and market analysis"], affiliateUrl: "https://www.volza.com/export-import-trade-data/?red=hhgg&utm_source=partner&utm_medium=reditus", updated: "September 2026" },
  { slug: "parallel-ai", name: "Parallel AI", category: "B2B SaaS", tagline: "An AI workforce for sales, marketing, support, and operations.", description: "Parallel AI combines AI employees, lead generation, content automation, multi-channel outreach, support agents, and workflow integrations in one business growth platform.", score: 9.2, price: "Free credits · paid plans from $99/month", accent: "violet", bestFor: "Startups, agencies, and lean revenue teams scaling output", pros: ["Broad AI workforce capabilities", "1,000+ integrations and MCP/API access", "Strong lead and content automation", "White-label option for agencies"], cons: ["Broad platforms require setup and governance", "Usage-based credits need monitoring at scale"], features: ["AI employees", "Lead enrichment", "Multi-channel sequences", "Content engine", "AI receptionist", "White-label platform"], affiliateUrl: "https://parallellabs.app/?red=hhgg", updated: "September 2026" },
  { slug: "ahaslides", name: "AhaSlides", category: "Marketing", tagline: "Interactive presentations that turn audiences into participants.", description: "AhaSlides helps presenters run live polls, quizzes, Q&A, word clouds, and interactive sessions from the browser with real-time audience participation.", score: 8.8, price: "Free plan · premium plans available", accent: "orange", bestFor: "Teachers, trainers, webinar hosts, and meeting facilitators", pros: ["Easy live interaction", "Useful polls, quizzes, and Q&A", "Works with PowerPoint and video meetings", "Free plan for getting started"], cons: ["Participant limits vary by plan", "Advanced needs may require a paid tier"], features: ["Live polls", "Quizzes", "Word clouds", "Q&A", "PowerPoint integration", "Engagement reports"], affiliateUrl: "https://ahaslides.com/?red=hhgg&utm_source=hhgg&utm_medium=revshare&utm_affiliate_network=reditus", updated: "September 2026" },
  { slug: "salestarget-ai", name: "SalesTarget.ai", category: "Marketing", tagline: "Find, engage, and close ideal B2B clients from one outbound workspace.", description: "SalesTarget.ai combines lead intelligence, enrichment, AI-assisted sequences, LinkedIn and email outreach, CRM workflows, calling, and performance analytics.", score: 9.0, price: "Plans vary by workspace and usage", accent: "blue", bestFor: "B2B sales teams that need prospecting and outreach in one system", pros: ["Large lead and intent data layer", "Unified email, LinkedIn, CRM, and calling workflows", "AI-assisted personalization", "Real-time campaign analytics"], cons: ["Outbound automation needs careful compliance and deliverability controls", "Pricing should be confirmed for your team size and usage"], features: ["Lead Explorer", "840M+ profiles", "Email sequences", "LinkedIn automation", "AI Copilot", "CRM and dialer"], affiliateUrl: "https://salestarget.ai/?red=hhgg", updated: "September 2026" },
  { slug: "babylovegrowth", name: "BabyLoveGrowth.ai", category: "Marketing", tagline: "Automated SEO content and backlinks for sustained organic growth.", description: "BabyLoveGrowth.ai combines business analysis, keyword planning, real-time research, SEO article generation, internal linking, schema, publishing integrations, and niche-relevant backlink exchange in one workflow.", score: 9.1, price: "$99/month promotional plan · free start available", accent: "lime", bestFor: "Founders, agencies, and lean marketing teams building organic traffic", pros: ["End-to-end SEO content workflow", "Real-time research and citations", "Automated publishing and internal linking", "Backlink exchange community", "Custom tone and voice"], cons: ["Backlink exchange requires careful quality review", "Automated content still needs human fact-checking and brand oversight"], features: ["Keyword discovery", "30-day content plans", "Daily articles", "SEO and GEO optimization", "JSON-LD schema", "WordPress, Webflow, Shopify, Wix and API publishing"], affiliateUrl: "https://www.babylovegrowth.ai/?red=hhgg", updated: "September 2026" },
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
  reviewBody: review.description,
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
