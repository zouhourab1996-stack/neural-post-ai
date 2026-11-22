import { Link, NavLink, Outlet } from "react-router-dom"
import { ArrowUpRight, Menu, Moon, Search, Sun, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useTheme } from "@/components/ThemeProvider"

export default function PlatformShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"
  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false) }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [menuOpen])
  return <div className="min-h-screen bg-background text-foreground">
    <div className="announcement"><span className="pulse-dot" /> Astrology, birth charts & sky-event guides <Link to="/about">Our editorial standards <ArrowUpRight /></Link></div>
    <header className="site-header">
      <div className="container-main nav-inner">
        <Link to="/" className="brand"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.8"/><path d="M20 6v4M34 20h-4M20 34v-4M6 20h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="m20 11 2.6 6.4 6.4 2.6-6.4 2.6L20 29l-2.6-6.4L11 20l6.4-2.6L20 11Z" fill="currentColor"/></svg></span><span>prophetic<span className="brand-dot">.</span>pw <small className="brand-tag">/ signal</small></span></Link>
        <nav id="primary-navigation" className={menuOpen ? "main-nav mobile-open" : "main-nav"} aria-label="Primary navigation" onClick={() => setMenuOpen(false)}>
          <NavLink to="/" end>Home</NavLink><a href="/profection-year-calculator/">Profection Calculator</a><a href="/blog/">Astrology Guides</a><NavLink to="/compare">Compare</NavLink><NavLink to="/about">About</NavLink>
        </nav>
        <div className="nav-actions"><Link to="/contact" className="nav-link desktop-only">Get in touch</Link><button className="icon-button" aria-label="Toggle theme" onClick={() => setTheme(isDark ? "light" : "dark")}>{isDark ? <Sun /> : <Moon />}</button><button className="icon-button mobile-trigger" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div>
      </div>
    </header>
    <main><Outlet /></main>
    <footer className="site-footer"><div className="container-main footer-grid"><div><Link to="/" className="brand"><span className="brand-mark">P</span><span>prophetic<span className="brand-dot">.</span>pw <small className="brand-tag">/ signal</small></span></Link><p>Independent guides to astrology, birth-chart concepts and observable sky events.</p></div><div><strong>Explore</strong><Link to="/">Home</Link><a href="/blog/">Topics &amp; guides</a><Link to="/about">About Prophetic</Link><a href="/blog/">Blog &amp; guides</a></div><div><strong>Company</strong><Link to="/contact">Contact us</Link><Link to="/disclaimer">Disclaimer</Link><Link to="/privacy">Privacy policy</Link></div><div><strong>Guides</strong><a href="/profection-year-calculator/">Profection calculator</a><a href="/blog/">All articles</a><a href="/blog/">Browse guides</a><Link to="/about">Editorial standards</Link></div></div><div className="container-main footer-bottom"><span>© 2026 Prophetic. Built for better decisions.</span><span>We research. You decide.</span></div></footer>
  </div>
}
