import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Layout from "@/components/Layout";
import Index from "./pages/Index";

// Lazy load non-critical routes
const Article = lazy(() => import("./pages/Article"));
const Category = lazy(() => import("./pages/Category"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      gcTime: 300000,
    },
  },
});

const PageFallback = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" role="status">
      <span className="sr-only">Loading...</span>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="neuralpost-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/article/:slug/*" element={<Article />} />
                <Route path="/category/:category/*" element={<Category />} />
                <Route path="/about/*" element={<About />} />
                <Route path="/contact/*" element={<Contact />} />
                <Route path="/privacy/*" element={<Privacy />} />
                <Route path="/terms/*" element={<Terms />} />
                <Route path="/disclaimer/*" element={<Disclaimer />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
