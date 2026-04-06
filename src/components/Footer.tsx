import { Link } from "react-router-dom";

const footerLinks = {
  company: [
    { name: "About", path: "/about/" },
    { name: "Contact", path: "/contact/" },
    { name: "Editorial Policy", path: "/editorial/" },
    { name: "AI Policy", path: "/ai-policy/" },
  ],
  legal: [
    { name: "Privacy Policy", path: "/privacy/" },
    { name: "Terms of Service", path: "/terms/" },
    { name: "Disclaimer", path: "/disclaimer/" },
  ],
  categories: [
    { name: "AI", path: "/category/AI/" },
    { name: "Tech", path: "/category/Tech/" },
    { name: "Business", path: "/category/Business/" },
    { name: "Science", path: "/category/Science/" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border/60 mt-16 bg-card/50" role="contentinfo">
      {/* Ad strip */}
      <div className="container-main py-4">
        <div className="ad-container">
          <ins className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-3898992716389443"
            data-ad-slot="auto"
            data-ad-format="auto"
            data-full-width-responsive="true" />
        </div>
      </div>

      <div className="container-main py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-3" aria-label="Prophetic Home">
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
                Prophetic
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Daily AI and technology predictions. Expert analysis of emerging trends in AI, tech, business, and science.
            </p>
          </div>

          {/* Categories */}
          <nav aria-label="Categories">
            <h4 className="text-sm font-semibold text-foreground mb-3">Categories</h4>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company Links */}
          <nav aria-label="Company links">
            <h4 className="text-sm font-semibold text-foreground mb-3">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal links">
            <h4 className="text-sm font-semibold text-foreground mb-3">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <a href="/rss.xml" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  RSS Feed
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Prophetic. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            AI-assisted predictions with editorial oversight.
          </p>
        </div>
      </div>
    </footer>
  );
}
