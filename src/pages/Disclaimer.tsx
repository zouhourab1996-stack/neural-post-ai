import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Bot, Link2, Scale, FileText } from "lucide-react";

export default function Disclaimer() {
  useEffect(() => {
    document.title = "Disclaimer | NeuralPost";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Read NeuralPost's disclaimer regarding AI-generated content, affiliate links, and general information purposes."
      );
    }
  }, []);

  const sections = [
    {
      icon: FileText,
      title: "General Information",
      content: `The information provided on NeuralPost ("the Website") is for general informational and educational purposes only. All content on this site is published in good faith and is intended to provide readers with timely news, analysis, and insights on technology, artificial intelligence, business, and science topics.

While we strive to keep the information accurate and up-to-date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics contained on the Website.

Any reliance you place on such information is strictly at your own risk. We strongly advise readers to conduct their own research and consult with qualified professionals before making any decisions based on the content published here.`
    },
    {
      icon: Bot,
      title: "AI-Generated Content Disclosure",
      content: `NeuralPost utilizes artificial intelligence (AI) technology to assist in content creation, research, and analysis. This includes:

• **Automated Article Generation**: Some articles on this website are generated with the assistance of AI language models (including DeepSeek and similar technologies) that analyze news sources, trends, and data to produce informative content.

• **AI-Assisted Research**: Our content pipeline uses AI to identify trending topics, extract keywords, and synthesize information from multiple reputable news sources.

• **Image Curation**: Featured images are sourced from licensed stock photography providers (such as Pexels) and selected algorithmically based on article content.

**Important**: While AI assists in content generation, human oversight is applied to ensure quality and accuracy. However, AI-generated content may occasionally contain errors, outdated information, or interpretations that differ from human editorial standards. Readers should verify critical information independently.`
    },
    {
      icon: Link2,
      title: "Affiliate Links & Advertising",
      content: `NeuralPost may contain affiliate links to products, services, or other websites. If you click on an affiliate link and make a purchase, we may receive a commission at no additional cost to you. This helps support the operation and maintenance of this website.

**Advertising Disclosure**: This website displays advertisements through Google AdSense and potentially other advertising networks. These ads are served by third parties and may use cookies to personalize content based on your browsing history.

We are committed to transparency and will clearly disclose when content is sponsored or when affiliate relationships exist. Our editorial content is not influenced by advertising relationships, and we maintain strict separation between sponsored content and organic editorial.`
    },
    {
      icon: Scale,
      title: "Not Professional Advice",
      content: `The content on NeuralPost does not constitute:

• **Financial Advice**: Information about markets, cryptocurrencies, stocks, or investments is for informational purposes only and should not be considered financial advice. Consult a licensed financial advisor before making investment decisions.

• **Legal Advice**: Any discussion of regulations, laws, or legal matters is general information only. Consult a qualified attorney for legal guidance specific to your situation.

• **Medical Advice**: Health or science-related content is informational and does not replace professional medical advice. Consult healthcare professionals for medical concerns.

• **Technical Advice**: While we cover technology topics, our content should not be solely relied upon for technical implementation decisions. Verify with qualified professionals.`
    },
    {
      icon: AlertTriangle,
      title: "External Links Disclaimer",
      content: `NeuralPost may contain links to external websites that are not operated or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party sites or services.

These links are provided for convenience and reference only. The inclusion of any link does not imply endorsement, approval, or control of the linked site by NeuralPost. We strongly advise you to read the terms and conditions and privacy policy of any third-party website that you visit.`
    }
  ];

  return (
    <main className="container-main py-12" role="main">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <AlertTriangle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Disclaimer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Important disclosures about our content, AI usage, and your responsibilities as a reader.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Summary Box */}
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 mb-12">
          <h2 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-accent" />
            Quick Summary
          </h2>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>• This website uses AI to assist in content creation and research</li>
            <li>• Content is for informational purposes only, not professional advice</li>
            <li>• We may earn commissions from affiliate links at no cost to you</li>
            <li>• External links are provided for reference; we don't control third-party sites</li>
            <li>• Always verify important information independently</li>
          </ul>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section, index) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-card rounded-xl border border-border p-6 md:p-8"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <section.icon className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-serif text-2xl font-bold">{section.title}</h2>
              </div>
              <div className="prose prose-muted max-w-none">
                {section.content.split('\n\n').map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-muted-foreground mb-4 whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center bg-muted rounded-xl p-8">
          <h2 className="font-serif text-xl font-semibold mb-2">Questions About This Disclaimer?</h2>
          <p className="text-muted-foreground mb-4">
            If you have any questions or concerns about this disclaimer, please contact us.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Contact Us
          </a>
        </div>

        {/* Acceptance Notice */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            By using NeuralPost, you acknowledge that you have read, understood, and agree to be bound by this disclaimer.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
