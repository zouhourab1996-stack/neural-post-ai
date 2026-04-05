import { useQuery } from "@tanstack/react-query";
import { Sparkles, ArrowRight, Loader2, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

interface Article {
  id: string;
  title: string;
  slug: string;
  meta_description: string;
  content: string;
  category: string;
  image_url: string | null;
  is_featured: boolean | null;
  is_trending: boolean | null;
  views: number | null;
  created_at: string;
  updated_at: string;
}

const getCurrentDate = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function Index() {
  const today = getCurrentDate();

  const { data: articles, isLoading, error } = useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(60);
      
      if (error) throw error;
      return data as Article[];
    },
  });

  const featuredArticles = articles?.filter((a) => a.is_featured) || [];
  const trendingArticles = articles?.filter((a) => a.is_trending) || [];
  const latestArticles = articles?.slice(0, 12) || [];
  const topArticles = (articles || [])
    .filter((a) => (a.views || 0) > 0)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 6);
  const lastUpdated = articles?.[0]?.created_at || new Date().toISOString();
  const homepageDescription = `AI-powered predictions and future intelligence for ${today}. Daily forecasts on technology, markets, and science from Prophetic.`;

  return (
    <>
      <SEOHead
        title="AI Predictions & Future Intelligence"
        description={homepageDescription}
        canonical="https://prophetic.pw/"
      />

      <main className="container-main py-8" role="main">
      {/* Hero Section */}
      <section className="text-center mb-16 relative" aria-labelledby="hero-heading">
        {/* Floating orbs background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-10 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-float" />
          <div className="absolute top-20 right-1/4 w-48 h-48 rounded-full bg-accent/5 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-0 left-1/2 w-72 h-72 rounded-full bg-primary/3 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 glow-border">
            <Eye className="w-4 h-4" aria-hidden="true" />
            AI-Powered Predictions
          </div>
          <h2 id="hero-heading" className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            The Future,{" "}
            <span className="gradient-text">Decoded by AI</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Stay ahead with cutting-edge AI predictions covering technology, markets,
            geopolitics, and scientific breakthroughs.
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <time dateTime={new Date().toISOString()}>{today}</time>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Publishing schedule: 2 predictions daily • Last update{" "}
            <time dateTime={lastUpdated}>{new Date(lastUpdated).toLocaleDateString("en-US")}</time>
          </p>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="mb-12" aria-labelledby="featured-heading">
          <div className="flex items-center justify-between mb-6">
            <h2 id="featured-heading" className="font-serif text-2xl font-bold">Featured Predictions</h2>
            <Link to="/category/AI/">
              <Button variant="ghost" className="text-primary">
                View all <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredArticles.slice(0, 2).map((article, index) => (
              <ArticleCard key={article.id} article={article} variant="featured" index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Top Articles */}
      {topArticles.length > 0 && (
        <section className="mb-12" aria-labelledby="top-heading">
          <div className="flex items-center justify-between mb-6">
            <h2 id="top-heading" className="font-serif text-2xl font-bold">Top Predictions</h2>
            <Link to="/sitemap/">
              <Button variant="ghost" className="text-primary">
                Browse all <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {topArticles.map((article, index) => (
              <ArticleCard key={article.id} article={article} variant="featured" index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Top Topics */}
      <section className="mb-12" aria-labelledby="topics-heading">
        <div className="flex items-center justify-between mb-6">
          <h2 id="topics-heading" className="font-serif text-2xl font-bold">Top Topics</h2>
          <Link to="/topics/">
            <Button variant="ghost" className="text-primary">
              Explore topics <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl glow-border p-6">
            <h3 className="font-serif text-lg font-semibold mb-3">AI & Future Tech</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/category/AI/" className="hover:text-primary">AI Predictions & Analysis</Link></li>
              <li><Link to="/ai-policy/" className="hover:text-primary">AI Policy & Transparency</Link></li>
            </ul>
          </div>
          <div className="bg-card rounded-xl glow-border p-6">
            <h3 className="font-serif text-lg font-semibold mb-3">Markets, Business, Science</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/category/Tech/" className="hover:text-primary">Tech Forecasts</Link></li>
              <li><Link to="/category/Business/" className="hover:text-primary">Market Outlook</Link></li>
              <li><Link to="/category/Science/" className="hover:text-primary">Science & Innovation</Link></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2" aria-labelledby="latest-heading">
          <div className="flex items-center justify-between mb-6">
            <h2 id="latest-heading" className="font-serif text-2xl font-bold">Latest Predictions</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20" role="status" aria-label="Loading articles">
              <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden="true" />
              <span className="sr-only">Loading predictions...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20" role="alert">
              <p className="text-muted-foreground mb-4">No predictions found yet.</p>
              <p className="text-sm text-muted-foreground">Predictions will appear here once generated.</p>
            </div>
          ) : latestArticles.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {latestArticles.map((article, index) => (
                <ArticleCard key={article.id} article={article} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-xl glow-border">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" aria-hidden="true" />
              <h3 className="font-serif text-xl font-semibold mb-2">No Predictions Yet</h3>
              <p className="text-muted-foreground mb-4">Predictions will be generated automatically using AI.</p>
            </div>
          )}
        </section>

        <Sidebar trendingArticles={trendingArticles} lastUpdated={lastUpdated} />
      </div>
      </main>
    </>
  );
}
