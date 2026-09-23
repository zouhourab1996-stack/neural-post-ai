import { Link, NavLink, Outlet } from "react-router-dom"
import { ArrowUpRight, Menu, Moon, Search, Sun, X } from "lucide-react"
import { useState } from "react"
import { useTheme } from "@/components/ThemeProvider"

export default function PlatformShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"
  return <div className="min-h-screen bg-background text-foreground">
    <div className="announcement"><span className="pulse-dot" /> Independent research for better business decisions <Link to="/about">Our editorial standards <ArrowUpRight /></Link></div>
    <header className="site-header">
      <div className="container-main nav-inner">
        <Link to="/" className="brand"><span className="brand-mark">P</span><span>prophetic<span className="brand-dot">.</span>pw</span></Link>
        <nav className={menuOpen ? "main-nav mobile-open" : "main-nav"} aria-label="Primary navigation">
          <NavLink to="/" end>Home</NavLink><NavLink to="/category/B2B%20SaaS">B2B SaaS</NavLink><NavLink to="/category/Finance">Finance</NavLink><NavLink to="/category/Marketing">Marketing</NavLink><NavLink to="/compare">Compare</NavLink>
        </nav>
        <div className="nav-actions"><Link to="/contact" className="nav-link desktop-only">Get in touch</Link><button className="icon-button" aria-label="Toggle theme" onClick={() => setTheme(isDark ? "light" : "dark")}>{isDark ? <Sun /> : <Moon />}</button><button className="icon-button mobile-trigger" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div>
      </div>
    </header>
    <main><Outlet /></main>
    <footer className="site-footer"><div className="container-main footer-grid"><div><Link to="/" className="brand"><span className="brand-mark">P</span><span>prophetic<span className="brand-dot">.</span>pw</span></Link><p>Independent reviews for the tools shaping modern business.</p></div><div><strong>Explore</strong><Link to="/">Latest reviews</Link><Link to="/compare">Comparisons</Link><Link to="/about">About Prophetic</Link></div><div><strong>Company</strong><Link to="/contact">Contact us</Link><Link to="/disclaimer">Affiliate disclosure</Link><Link to="/privacy">Privacy policy</Link></div></div><div className="container-main footer-bottom"><span>© 2026 Prophetic. Built for better decisions.</span><span>We research. You decide.</span></div></footer>
  </div>
}
