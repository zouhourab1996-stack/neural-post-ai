import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = [
  { name: "AI", path: "/category/AI/" },
  { name: "Tech", path: "/category/Tech/" },
  { name: "Business", path: "/category/Business/" },
  { name: "Science", path: "/category/Science/" },
];

const PropheticLogo = ({ size = 28 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
  >
    {/* Eye shape */}
    <path
      d="M16 9C11.5 9 7.5 12 5.5 16C7.5 20 11.5 23 16 23C20.5 23 24.5 20 26.5 16C24.5 12 20.5 9 16 9Z"
      stroke="#3b82f6"
      strokeWidth="1.5"
      fill="none"
    />
    {/* Iris */}
    <circle cx="16" cy="16" r="4.5" stroke="#3b82f6" strokeWidth="1.2" fill="none" />
    {/* Pupil */}
    <circle cx="16" cy="16" r="2" fill="#3b82f6" />
    {/* Light reflection */}
    <circle cx="17.5" cy="14.5" r="0.8" fill="#60a5fa" />
    {/* Top rays — foresight */}
    <line x1="16" y1="5" x2="16" y2="7.5" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />
    <line x1="20" y1="5.5" x2="19" y2="8" stroke="#f59e0b" strokeWidth="0.8" strokeLinecap="round" />
    <line x1="12" y1="5.5" x2="13" y2="8" stroke="#f59e0b" strokeWidth="0.8" strokeLinecap="round" />
  </svg>
);

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
    <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-border/60 bg-background/90">
      <div className="container-main">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" aria-label="Prophetic Home">
            <PropheticLogo />
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              Prophetic
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === cat.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
              <form onSubmit={handleSearch} className="w-[220px]">
                <Input
                  placeholder="Search predictions..."
                  className="h-8 bg-muted/50 border-border text-sm"
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
              className="rounded-md text-muted-foreground hover:text-foreground h-8 w-8"
              aria-label={isSearchOpen ? "Close search" : "Open search"}
            >
              <Search className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-md text-muted-foreground h-8 w-8"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden border-t border-border/60 pb-4" aria-label="Mobile navigation">
            <div className="py-3 space-y-1">
              <form onSubmit={handleSearch}>
                <Input
                  placeholder="Search predictions..."
                  className="mb-3 bg-muted/50 border-border"
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
                  className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === cat.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
    </header>
  );
}
