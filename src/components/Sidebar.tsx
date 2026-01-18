import { Link } from "react-router-dom";
import { TrendingUp, Flame, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ArticleCard from "@/components/ArticleCard";
import { supabase } from "@/integrations/supabase/client";

interface Article {
  id: string;
  title: string;
  slug: string;
  meta_description: string;
  category: string;
  image_url?: string;
  is_trending?: boolean;
  created_at: string;
}

interface SidebarProps {
  trendingArticles: Article[];
}

// Category colors using design tokens
const categoryConfig = [
  { name: "AI", color: "bg-blue-500" },
  { name: "Tech", color: "bg-green-500" },
  { name: "Business", color: "bg-purple-500" },
  { name: "Science", color: "bg-orange-500" },
];

export default function Sidebar({ trendingArticles }: SidebarProps) {
  // Fetch real category counts
  const { data: categoryCounts } = useQuery({
    queryKey: ["category-counts"],
    queryFn: async () => {
      const counts: Record<string, number> = {};
      
      for (const cat of categoryConfig) {
        const { count, error } = await supabase
          .from("articles")
          .select("*", { count: "exact", head: true })
          .eq("category", cat.name);
        
        if (!error && count !== null) {
          counts[cat.name] = count;
        } else {
          counts[cat.name] = 0;
        }
      }
      
      return counts;
    },
    staleTime: 60000, // Cache for 1 minute
  });

  return (
    <aside className="space-y-8" aria-label="Sidebar">
      {/* Ad Slot - Sidebar */}
      <div className="ad-slot h-64 w-full rounded-xl" aria-label="Advertisement">
        Advertisement Space - 300x250
      </div>

      {/* Trending Articles */}
      <section className="bg-card rounded-xl border border-border p-5" aria-labelledby="trending-sidebar-heading">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-accent" aria-hidden="true" />
          <h3 id="trending-sidebar-heading" className="font-serif text-lg font-semibold">Trending Now</h3>
        </div>
        <div className="space-y-1">
          {trendingArticles.length > 0 ? (
            trendingArticles.slice(0, 5).map((article, index) => (
              <ArticleCard key={article.id} article={article} variant="compact" index={index} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Trending articles will appear here
            </p>
          )}
        </div>
      </section>

      {/* Categories */}
      <nav className="bg-card rounded-xl border border-border p-5" aria-labelledby="categories-heading">
        <h3 id="categories-heading" className="font-serif text-lg font-semibold mb-4">Categories</h3>
        <div className="space-y-2">
          {categoryConfig.map((category) => (
            <Link
              key={category.name}
              to={`/category/${category.name}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${category.color}`} aria-hidden="true" />
                <span className="font-medium group-hover:text-primary transition-colors">
                  {category.name}
                </span>
              </div>
              <span className="text-sm text-muted-foreground" aria-label={`${categoryCounts?.[category.name] || 0} articles`}>
                {categoryCounts?.[category.name] || 0}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Newsletter */}
      <section className="bg-gradient-to-br from-primary to-accent rounded-xl p-6 text-primary-foreground" aria-labelledby="newsletter-heading">
        <h3 id="newsletter-heading" className="font-serif text-xl font-semibold mb-2">Stay Updated</h3>
        <p className="text-sm text-primary-foreground/80 mb-4">
          Get the latest AI and tech news delivered to your inbox.
        </p>
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="your@email.com"
            className="w-full px-4 py-2 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
          />
          <button 
            type="submit"
            className="w-full px-4 py-2 rounded-lg bg-primary-foreground text-primary font-medium hover:bg-primary-foreground/90 transition-colors flex items-center justify-center gap-2"
          >
            Subscribe <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>
      </section>

      {/* Another Ad Slot */}
      <div className="ad-slot h-64 w-full rounded-xl sticky top-24" aria-label="Advertisement">
        Advertisement Space - 300x250
      </div>
    </aside>
  );
}
