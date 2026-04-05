import { motion } from "framer-motion";
import { Users, Target, Award, Mail, Eye } from "lucide-react";

export default function About() {
  return (
    <div className="container-main py-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
          About <span className="gradient-text">Prophetic</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          We're pioneering the future of intelligence by leveraging cutting-edge AI technology
          to deliver accurate, forward-looking predictions across technology, markets,
          geopolitics, and science.
        </p>
      </motion.section>

      {/* Mission Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid md:grid-cols-2 gap-12 mb-16"
      >
        <div>
          <h2 className="font-serif text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground mb-4">
            At Prophetic, we believe that everyone deserves access to data-driven foresight.
            Our mission is to democratize future intelligence by using advanced AI systems
            to analyze trends, synthesize data, and present compelling predictions
            in an accessible and engaging format.
          </p>
          <p className="text-muted-foreground">
            We're committed to accuracy, transparency, and continuous improvement.
            Our AI-powered editorial system is constantly learning and evolving to
            provide you with the most relevant and trustworthy forecasts possible.
          </p>
        </div>
        <div className="relative">
          <div className="aspect-square rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80"
              alt="AI Future Technology"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 w-24 h-24 btn-glow rounded-2xl flex items-center justify-center shadow-glow">
            <Eye className="w-12 h-12 text-primary-foreground" />
          </div>
        </div>
      </motion.section>

      {/* Values Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-16"
      >
        <h2 className="font-serif text-3xl font-bold text-center mb-12">Our Core Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card rounded-xl glow-border p-8 text-center card-hover">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-serif text-xl font-semibold mb-3">Accuracy</h3>
            <p className="text-muted-foreground">
              We prioritize factual accuracy and thorough verification in every prediction we publish.
            </p>
          </div>
          <div className="bg-card rounded-xl glow-border p-8 text-center card-hover">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-serif text-xl font-semibold mb-3">Accessibility</h3>
            <p className="text-muted-foreground">
              Making complex future trends understandable and accessible to readers of all backgrounds.
            </p>
          </div>
          <div className="bg-card rounded-xl glow-border p-8 text-center card-hover">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-serif text-xl font-semibold mb-3">Excellence</h3>
            <p className="text-muted-foreground">
              Striving for excellence in AI forecasting through continuous improvement and innovation.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Contact CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="btn-glow rounded-2xl p-12 text-center text-primary-foreground"
      >
        <h2 className="font-serif text-3xl font-bold mb-4">Get in Touch</h2>
        <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
          Have questions, feedback, or partnership inquiries? We'd love to hear from you.
        </p>
        <a
          href="mailto:touatihadi0@gmail.com"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-foreground text-primary rounded-lg font-medium hover:bg-primary-foreground/90 transition-colors"
        >
          <Mail className="w-5 h-5" />
          touatihadi0@gmail.com
        </a>
      </motion.section>
    </div>
  );
}
