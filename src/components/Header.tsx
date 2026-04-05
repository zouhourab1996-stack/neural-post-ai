import { useState, lazy, Suspense } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TrendingTicker = lazy(() => import("@/components/TrendingTicker"));

const categories = [
  { name: "AI", path: "/category/AI/" },
  { name: "Tech", path: "/category/Tech/" },
  { name: "Business", path: "/category/Business/" },
  { name: "Science", path: "/category/Science/" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/category/AI/?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-border bg-background/80">
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" aria-label="Prophetic Home">
            <div className="w-10 h-10 rounded-xl btn-glow flex items-center justify-center group-hover:scale-105 transition-transform">
              <Eye className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
              Prophetic
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === cat.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                aria-current={location.pathname === cat.path ? "page" : undefined}
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {isSearchOpen && (
              <form onSubmit={handleSearch} className="w-[250px]">
                <Input
                  placeholder="Search predictions..."
                  className="h-9 bg-muted border-border"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search articles"
                />
              </form>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="rounded-lg text-muted-foreground hover:text-foreground"
              aria-label={isSearchOpen ? "Close search" : "Open search"}
            >
              <Search className="w-5 h-5" aria-hidden="true" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-lg text-muted-foreground"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden border-t border-border" aria-label="Mobile navigation">
            <div className="py-4 space-y-2">
              <form onSubmit={handleSearch}>
                <Input
                  placeholder="Search predictions..."
                  className="mb-4 bg-muted border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search articles"
                />
              </form>
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === cat.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  aria-current={location.pathname === cat.path ? "page" : undefined}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>

      {/* Trending Keywords Ticker - lazy loaded */}
      <Suspense fallback={null}>
        <TrendingTicker />
      </Suspense>
    </header>
  );
}
