import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2, Calendar } from "lucide-react";
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

const AdSlot = ({ className = '' }: { className?: string }) => (
  <div className={`ad-container ${className}`}>
    <ins className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-3898992716389443"
      data-ad-slot="auto"
      data-ad-format="auto"
      data-full-width-responsive="true" />
  </div>
);

const getCurrentDate = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const categories = [
  { name: "All", path: "/" },
  { name: "AI", path: "/category/AI/" },
  { name: "Tech", path: "/category/Tech/" },
  { name: "Business", path: "/category/Business/" },
  { name: "Science", path: "/category/Science/" },
];

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
  const homepageDescription = `AI and technology predictions for ${today}. Daily coverage of AI breakthroughs, tech forecasts, market predictions, and science innovations from Prophetic.`;

  const heroArticle = featuredArticles[0] || latestArticles[0];
  const secondaryHeroArticles = featuredArticles.length > 1
    ? featuredArticles.slice(1, 3)
    : latestArticles.slice(1, 3);

  // Build article list with ads inserted every 3rd
  const renderArticlesWithAds = (articleList: Article[]) => {
    const items: React.ReactNode[] = [];
    articleList.forEach((article, index) => {
      items.push(
        <ArticleCard key={article.id} article={article} index={index} />
      );
      if ((index + 1) % 3 === 0 && index < articleList.length - 1) {
        items.push(
          <div key={`ad-${index}`} className="md:col-span-2">
            <AdSlot />
          </div>
        );
      }
    });
    return items;
  };

  return (
    <>
      <SEOHead
        title="AI & Tech Predictions — Daily Forecasts & Analysis"
        description={homepageDescription}
        canonical="https://prophetic.pw/"
      />

      <main className="container-main py-6" role="main">
        {/* Hero Section */}
        {heroArticle && (
          <section className="mb-10" aria-labelledby="hero-heading">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                <time dateTime={new Date().toISOString()}>{today}</time>
              </div>
              <span className="text-border">|</span>
              <span className="text-xs text-muted-foreground">
                Updated <time dateTime={lastUpdated}>{new Date(lastUpdated).toLocaleDateString("en-US")}</time>
              </span>
            </div>

            <div className="grid lg:grid-cols-5 gap-5">
              {/* Main hero article */}
              <div className="lg:col-span-3">
                <article className="group relative overflow-hidden rounded-lg bg-card border border-border/60 h-full">
                  <Link to={`/article/${heroArticle.slug}/`} className="block h-full">
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={heroArticle.image_url || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80'}
                        alt={heroArticle.title}
                        width={1200}
                        height={750}
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border mb-2.5 ${
                        heroArticle.category === 'AI' ? 'badge-ai' :
                        heroArticle.category === 'Tech' ? 'badge-tech' :
                        heroArticle.category === 'Business' ? 'badge-business' :
                        'badge-science'
                      }`}>
                        {heroArticle.category}
                      </span>
                      <h1 id="hero-heading" className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-2 line-clamp-3 text-foreground group-hover:text-primary transition-colors">
                        {heroArticle.title}
                      </h1>
                      <p className="text-sm text-slate-400 line-clamp-2 max-w-2xl">
                        {heroArticle.meta_description}
                      </p>
                    </div>
                  </Link>
                </article>
              </div>

              {/* Secondary hero articles */}
              <div className="lg:col-span-2 grid gap-5">
                {secondaryHeroArticles.map((article, index) => (
                  <ArticleCard key={article.id} article={article} variant="featured" index={index + 1} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Category Tabs */}
        <nav className="flex items-center gap-1 mb-6 overflow-x-auto pb-2" aria-label="Category filter">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={cat.path}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                cat.name === "All"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Top Articles */}
        {topArticles.length > 0 && (
          <section className="mb-10" aria-labelledby="top-heading">
            <div className="flex items-center justify-between mb-5">
              <h2 id="top-heading" className="font-display text-xl font-bold">Editor&apos;s Picks</h2>
              <Link to="/sitemap/" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
                Browse all <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {topArticles.slice(0, 4).map((article, index) => (
                <ArticleCard key={article.id} article={article} variant="featured" index={index} />
              ))}
            </div>
          </section>
        )}

        <AdSlot className="mb-8" />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2" aria-labelledby="latest-heading">
            <div className="flex items-center justify-between mb-5">
              <h2 id="latest-heading" className="font-display text-xl font-bold">Latest Predictions</h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20" role="status" aria-label="Loading articles">
                <Loader2 className="w-6 h-6 animate-spin text-primary" aria-hidden="true" />
                <span className="sr-only">Loading predictions...</span>
              </div>
            ) : error ? (
              <div className="text-center py-20" role="alert">
                <p className="text-muted-foreground mb-2">No predictions found yet.</p>
                <p className="text-sm text-muted-foreground">Predictions will appear here once generated.</p>
              </div>
            ) : latestArticles.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-5 mb-8">
                {renderArticlesWithAds(latestArticles)}
              </div>
            ) : (
              <div className="text-center py-20 bg-card rounded-lg border border-border/60">
                <h3 className="font-display text-lg font-semibold mb-2">No Predictions Yet</h3>
                <p className="text-muted-foreground text-sm">Predictions will be generated automatically.</p>
              </div>
            )}
          </section>

          <Sidebar trendingArticles={trendingArticles} lastUpdated={lastUpdated} />
        </div>
      </main>
    </>
  );
}
