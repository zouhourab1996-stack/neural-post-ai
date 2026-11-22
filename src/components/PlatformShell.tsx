import { Link, NavLink, Outlet } from "react-router-dom"
import { ArrowUpRight, Menu, Moon, Search, Sun, X } from "lucide-react"
import { useEffect, useState, type MouseEvent } from "react"
import { useTheme } from "@/components/ThemeProvider"

function openPrivacySettings(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()
  const host = window as Window & {
    googlefc?: {
      callbackQueue?: Array<Record<string, () => void>>
      showRevocationMessage?: () => void
    }
  }
  host.googlefc = host.googlefc || {}
  host.googlefc.callbackQueue = host.googlefc.callbackQueue || []
  host.googlefc.callbackQueue.push({
    CONSENT_API_READY: () => host.googlefc?.showRevocationMessage?.(),
  })
}

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
  const Brand = () => <Link to="/" className="brand" aria-label="Prophetic home"><svg className="brand-mark-image" viewBox="0 0 96 96" width="42" height="42" fill="none" aria-hidden="true"><defs><linearGradient id="prophetic-brand-gradient" x1="8" y1="8" x2="88" y2="88" gradientUnits="userSpaceOnUse"><stop stopColor="#F4D99A"/><stop offset="1" stopColor="#B78A42"/></linearGradient></defs><rect x="2" y="2" width="92" height="92" rx="26" fill="#101827" stroke="#B78A42" strokeOpacity=".55" strokeWidth="2"/><circle cx="48" cy="48" r="30" stroke="url(#prophetic-brand-gradient)" strokeWidth="2.5"/><path d="M56 20a29 29 0 1 0 18 49A31 31 0 0 1 56 20Z" fill="url(#prophetic-brand-gradient)"/><path d="m48 27 5.2 15.8L69 48l-15.8 5.2L48 69l-5.2-15.8L27 48l15.8-5.2L48 27Z" fill="#F8E8C2"/><circle cx="48" cy="48" r="3.5" fill="#101827"/><path d="M48 8v7M88 48h-7M48 88v-7M8 48h7" stroke="#D6B36A" strokeWidth="2" strokeLinecap="round"/></svg><span>Prophetic<span className="brand-dot">.</span>pw <small className="brand-tag">/ astrology & sky</small></span></Link>
  return <div className="min-h-screen bg-background text-foreground">
    <div className="announcement"><span className="pulse-dot" /> Astrology, birth charts & sky-event guides <Link to="/about">Our editorial standards <ArrowUpRight /></Link></div>
    <header className="site-header">
      <div className="container-main nav-inner">
        <Brand />
        <nav id="primary-navigation" className={menuOpen ? "main-nav mobile-open" : "main-nav"} aria-label="Primary navigation" onClick={() => setMenuOpen(false)}>
          <NavLink to="/" end>Home</NavLink><a href="/profection-year-calculator/">Profection Calculator</a><a href="/blog/">Astrology Guides</a><NavLink to="/compare">Compare</NavLink><NavLink to="/about">About</NavLink>
        </nav>
        <div className="nav-actions"><Link to="/contact" className="nav-link desktop-only">Get in touch</Link><button className="icon-button" aria-label="Toggle theme" onClick={() => setTheme(isDark ? "light" : "dark")}>{isDark ? <Sun /> : <Moon />}</button><button className="icon-button mobile-trigger" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div>
      </div>
    </header>
    <main><Outlet /></main>
    <footer className="site-footer"><div className="container-main footer-grid"><div><Brand /><p>Independent guides to astrology, birth-chart concepts and observable sky events.</p></div><div><strong>Explore</strong><Link to="/">Home</Link><a href="/blog/">Topics &amp; guides</a><Link to="/about">About Prophetic</Link><a href="/blog/">Blog &amp; guides</a></div><div><strong>Company</strong><Link to="/contact">Contact us</Link><Link to="/disclaimer">Disclaimer</Link><Link to="/privacy">Privacy policy</Link><a href="#privacy-settings" onClick={openPrivacySettings}>Privacy and cookie settings</a></div><div><strong>Guides</strong><a href="/profection-year-calculator/">Profection calculator</a><a href="/blog/">All articles</a><a href="/blog/">Browse guides</a><Link to="/about">Editorial standards</Link></div></div><div className="container-main footer-bottom"><span>© 2026 Prophetic. Built for better decisions.</span><span>We research. You decide.</span></div></footer>
  </div>
}
