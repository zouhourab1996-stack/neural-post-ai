import { motion } from "framer-motion";

export default function Terms() {
  return (
    <div className="container-main py-12">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <header className="mb-12 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </header>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using NeuralPost ("the Website"), you agree to be bound by these Terms of 
              Service and all applicable laws and regulations. If you do not agree with any of these terms, 
              you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-4">2. Use License</h2>
            <p className="text-muted-foreground mb-4">
              Permission is granted to temporarily view the materials on NeuralPost for personal, 
              non-commercial transitory viewing only. This is the grant of a license, not a transfer 
              of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the Website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-4">3. Content and Intellectual Property</h2>
            <p className="text-muted-foreground mb-4">
              All content on NeuralPost, including but not limited to text, graphics, logos, images, 
              and software, is the property of NeuralPost or its content suppliers and is protected 
              by international copyright laws.
            </p>
            <p className="text-muted-foreground">
              The compilation of all content on this site is the exclusive property of NeuralPost 
              and is protected by international copyright laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-4">4. AI-Generated Content Disclaimer</h2>
            <p className="text-muted-foreground mb-4">
              NeuralPost utilizes artificial intelligence technology to generate and curate news content. 
              While we strive for accuracy and quality, you acknowledge and agree that:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>AI-generated content may contain errors or inaccuracies</li>
              <li>Content should not be relied upon as the sole source of information for critical decisions</li>
              <li>We are not responsible for any actions taken based on the content provided</li>
              <li>You should verify important information with primary sources</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-4">5. User Conduct</h2>
            <p className="text-muted-foreground mb-4">When using our Website, you agree not to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Use the Website in any way that violates applicable laws or regulations</li>
              <li>Engage in any conduct that restricts or inhibits anyone's use of the Website</li>
              <li>Attempt to gain unauthorized access to any part of the Website</li>
              <li>Use any automated system to access the Website</li>
              <li>Introduce viruses, trojans, worms, or other malicious code</li>
              <li>Collect or harvest any personally identifiable information from the Website</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-4">6. Third-Party Links</h2>
            <p className="text-muted-foreground">
              The Website may contain links to third-party websites or services that are not owned 
              or controlled by NeuralPost. We have no control over and assume no responsibility for 
              the content, privacy policies, or practices of any third-party websites or services. 
              You acknowledge and agree that NeuralPost shall not be responsible or liable for any 
              damage or loss caused by the use of any such content or services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-4">7. Advertising</h2>
            <p className="text-muted-foreground">
              The Website may display advertisements from third-party advertising networks. 
              These advertisements may be targeted based on your browsing behavior. We are not 
              responsible for the content of any advertisements or any products or services 
              offered through them.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-4">8. Disclaimer</h2>
            <p className="text-muted-foreground">
              THE MATERIALS ON NEURALPOST ARE PROVIDED ON AN "AS IS" BASIS. NEURALPOST MAKES NO 
              WARRANTIES, EXPRESSED OR IMPLIED, AND HEREBY DISCLAIMS AND NEGATES ALL OTHER WARRANTIES 
              INCLUDING, WITHOUT LIMITATION, IMPLIED WARRANTIES OR CONDITIONS OF MERCHANTABILITY, 
              FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT OF INTELLECTUAL PROPERTY OR 
              OTHER VIOLATION OF RIGHTS.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-4">9. Limitations</h2>
            <p className="text-muted-foreground">
              In no event shall NeuralPost or its suppliers be liable for any damages (including, 
              without limitation, damages for loss of data or profit, or due to business interruption) 
              arising out of the use or inability to use the materials on NeuralPost, even if NeuralPost 
              or a NeuralPost authorized representative has been notified orally or in writing of the 
              possibility of such damage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-4">10. Revisions</h2>
            <p className="text-muted-foreground">
              NeuralPost may revise these Terms of Service at any time without notice. By using this 
              Website, you are agreeing to be bound by the then current version of these Terms of Service. 
              We encourage you to periodically review this page for the latest information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-4">11. Governing Law</h2>
            <p className="text-muted-foreground">
              These terms and conditions are governed by and construed in accordance with applicable laws, 
              and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">12. Contact Information</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us at:{" "}
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
