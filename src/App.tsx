import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import Layout from "@/components/Layout";
import { ThemeProvider } from "@/components/ThemeProvider";

const Index = lazy(() => import("@/pages/Index"));
const Article = lazy(() => import("@/pages/Article"));
const Category = lazy(() => import("@/pages/Category"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const Disclaimer = lazy(() => import("@/pages/Disclaimer"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const Loading = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// GitHub Pages SPA redirect handler
function RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle sessionStorage redirect from 404.html
    const redirect = sessionStorage.getItem("redirect");
    if (redirect && redirect !== location.pathname) {
      sessionStorage.removeItem("redirect");
      navigate(redirect, { replace: true });
    }
  }, []);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="prophetic-theme">
        <BrowserRouter>
          <RedirectHandler />
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/article/:slug" element={<Article />} />
                <Route path="/article/:slug/" element={<Article />} />
                <Route path="/category/:category" element={<Category />} />
                <Route path="/category/:category/" element={<Category />} />
                <Route path="/about" element={<About />} />
                <Route path="/about/" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/contact/" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/privacy/" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/terms/" element={<Terms />} />
                <Route path="/disclaimer" element={<Disclaimer />} />
                <Route path="/disclaimer/" element={<Disclaimer />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
