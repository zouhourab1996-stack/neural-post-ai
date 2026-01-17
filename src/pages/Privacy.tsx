import { motion } from "framer-motion";

export default function Privacy() {
  return (
    <div className="container-main py-12">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <header className="mb-12 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </header>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground mb-4">
              Welcome to NeuralPost ("we," "our," or "us"). We are committed to protecting your privacy 
              and ensuring the security of your personal information. This Privacy Policy explains how 
              we collect, use, disclose, and safeguard your information when you visit our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-4">2. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">We may collect information about you in various ways:</p>
            <h3 className="font-semibold text-lg mb-2">Personal Data</h3>
            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
              <li>Name and email address when you subscribe to our newsletter</li>
              <li>Contact information when you reach out through our contact form</li>
              <li>Any other information you voluntarily provide</li>
            </ul>
            <h3 className="font-semibold text-lg mb-2">Automatically Collected Data</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
              <li>IP address (anonymized)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Provide, operate, and maintain our website</li>
              <li>Improve and personalize your experience</li>
              <li>Send newsletters and updates (with your consent)</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Analyze website usage to improve our content and services</li>
              <li>Detect and prevent fraudulent activities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-4">4. Cookies and Tracking Technologies</h2>
            <p className="text-muted-foreground mb-4">
              We use cookies and similar tracking technologies to enhance your browsing experience. 
              Cookies are small files stored on your device that help us remember your preferences 
              and understand how you interact with our website.
            </p>
            <p className="text-muted-foreground">
              You can control cookies through your browser settings. However, disabling cookies may 
              affect some features of our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-4">5. Third-Party Services</h2>
            <p className="text-muted-foreground mb-4">
              We may use third-party services for analytics, advertising, and other purposes. 
              These services may collect information about your online activities across different 
              websites. Third-party services we may use include:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Google Analytics for website analytics</li>
              <li>Google AdSense for displaying advertisements</li>
              <li>Social media platforms for sharing functionality</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-4">6. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. However, 
              no method of transmission over the Internet is 100% secure, and we cannot guarantee 
              absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground mb-4">Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to processing of your personal information</li>
              <li>Request data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-4">8. Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our website is not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13. If you are a parent or guardian 
              and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-4">9. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date. 
              We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">10. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us at:{" "}
              <a href="mailto:touatihadi0@gmail.com" className="text-primary hover:underline">
                touatihadi0@gmail.com
              </a>
            </p>
          </section>
        </div>
      </motion.article>
    </div>
  );
}
