import { lazy, Suspense } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/ThemeProvider"
import PlatformShell from "@/components/PlatformShell"

const Home = lazy(() => import("@/pages/Index"))
const Review = lazy(() => import("@/pages/Review"))
const Article = lazy(() => import("@/pages/Article"))
const Comparison = lazy(() => import("@/pages/Comparison"))
const About = lazy(() => import("@/pages/About"))
const Contact = lazy(() => import("@/pages/Contact"))
const Privacy = lazy(() => import("@/pages/Privacy"))
const Terms = lazy(() => import("@/pages/Terms"))
const Disclaimer = lazy(() => import("@/pages/Disclaimer"))
const Loading = () => <div className="page-loading"><span /></div>
const queryClient = new QueryClient()

export default function App() {
  return <QueryClientProvider client={queryClient}><ThemeProvider defaultTheme="dark" storageKey="prophetic-theme"><BrowserRouter><Suspense fallback={<Loading />}><Routes><Route element={<PlatformShell />}><Route path="/" element={<Home />} /><Route path="/review/:slug" element={<Review />} /><Route path="/article/:slug" element={<Article />} /><Route path="/compare" element={<Comparison />} /><Route path="/about" element={<About />} /><Route path="/contact" element={<Contact />} /><Route path="/privacy" element={<Privacy />} /><Route path="/terms" element={<Terms />} /><Route path="/disclaimer" element={<Disclaimer />} /><Route path="*" element={<NotFoundFallback />} /></Route></Routes></Suspense><Toaster /></BrowserRouter></ThemeProvider></QueryClientProvider>
}

function NotFoundFallback() {
  return <main className="container-main section-pad"><h1>Page Not Found</h1><p>The page you requested does not exist.</p></main>
}
