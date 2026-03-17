import { Link } from "react-router-dom";
import { Zap, Mail, ExternalLink } from "lucide-react";

const footerLinks = {
  company: [
    { name: "About Us", path: "/about/" },
    { name: "Contact", path: "/contact/" },
  ],
  legal: [
    { name: "Privacy Policy", path: "/privacy/" },
    { name: "Terms of Service", path: "/terms/" },
    { name: "Disclaimer", path: "/disclaimer/" },
  ],
  categories: [
    { name: "AI", path: "/category/AI/" },
    { name: "Technology", path: "/category/Tech/" },
    { name: "Business", path: "/category/Business/" },
    { name: "Science", path: "/category/Science/" },
  ],
};

const newsSources = [
  { name: "Reuters", url: "https://www.reuters.com" },
  { name: "TechCrunch", url: "https://techcrunch.com" },
  { name: "The Verge", url: "https://www.theverge.com" },
  { name: "Wired", url: "https://www.wired.com" },
  { name: "Ars Technica", url: "https://arstechnica.com" },
  { name: "MIT Tech Review", url: "https://www.technologyreview.com" },
];

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-16" role="contentinfo">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4" aria-label="NeuralPost Home">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight">
                Neural<span className="text-primary">Post</span>
              </span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Your trusted source for AI-powered news covering technology, science, business, and artificial intelligence.
            </p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" aria-hidden="true" />
              <a href="mailto:touatihadi0@gmail.com" className="hover:text-primary transition-colors">
                touatihadi0@gmail.com
              </a>
            </div>
          </div>

          {/* Company Links */}
          <nav aria-label="Company links">
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Categories */}
          <nav aria-label="Categories">
            <h4 className="font-semibold text-foreground mb-4">Categories</h4>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* News Sources */}
          <nav aria-label="News sources">
            <h4 className="font-semibold text-foreground mb-4">Sources</h4>
            <ul className="space-y-2">
              {newsSources.map((source) => (
                <li key={source.name}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group"
                  >
                    {source.name}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} NeuralPost. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
