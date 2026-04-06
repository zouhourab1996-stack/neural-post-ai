import { Link } from "react-router-dom";
import { TrendingUp, Trophy, CalendarClock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ArticleCard from "@/components/ArticleCard";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Article {
  id: string;
  title: string;
  slug: string;
  meta_description: string;
  category: string;
  image_url?: string;
  is_trending?: boolean;
  views?: number | null;
  created_at: string;
}

interface SidebarProps {
  trendingArticles: Article[];
  lastUpdated?: string;
}

const categoryConfig = [
  { name: "AI", color: "bg-violet-500", badge: "badge-ai" },
  { name: "Tech", color: "bg-cyan-500", badge: "badge-tech" },
  { name: "Business", color: "bg-amber-500", badge: "badge-business" },
  { name: "Science", color: "bg-emerald-500", badge: "badge-science" },
];

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

export default function Sidebar({ trendingArticles, lastUpdated }: SidebarProps) {
  const lastUpdatedDate = lastUpdated || trendingArticles?.[0]?.created_at;
  const { data: categoryCounts } = useQuery({
    queryKey: ["category-counts"],
    queryFn: async () => {
      const counts: Record<string, number> = {};
      for (const cat of categoryConfig) {
        const { count, error } = await supabase
          .from("articles")
          .select("*", { count: "exact", head: true })
          .eq("category", cat.name);
        counts[cat.name] = (!error && count !== null) ? count : 0;
      }
      return counts;
    },
    staleTime: 120000,
  });

  const { data: topArticles } = useQuery({
    queryKey: ["top-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id,title,slug,meta_description,category,image_url,views,created_at")
        .order("views", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as Article[];
    },
    staleTime: 120000,
  });

  return (
    <aside className="space-y-6" aria-label="Sidebar">
      {/* Publishing Schedule */}
      <section className="bg-card rounded-lg border border-border/60 p-4" aria-labelledby="schedule-heading">
        <div className="flex items-center gap-2 mb-2">
          <CalendarClock className="w-4 h-4 text-primary" aria-hidden="true" />
          <h3 id="schedule-heading" className="font-display text-sm font-semibold">Publishing Schedule</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          New AI predictions and market forecasts published daily (morning &amp; evening).
        </p>
        <p className="text-[11px] text-muted-foreground/70 mt-1.5">
          Last update:{" "}
          {lastUpdatedDate ? format(new Date(lastUpdatedDate), "MMM dd, yyyy") : "Updating..."}
        </p>
      </section>

      {/* Ad Slot */}
      <AdSlot />

      {/* Trending Articles */}
      <section className="bg-card rounded-lg border border-border/60 p-4" aria-labelledby="trending-sidebar-heading">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-amber-400" aria-hidden="true" />
          <h3 id="trending-sidebar-heading" className="font-display text-sm font-semibold">Trending Now</h3>
        </div>
        <div className="space-y-0.5">
          {trendingArticles.length > 0 ? (
            trendingArticles.slice(0, 5).map((article, index) => (
              <ArticleCard key={article.id} article={article} variant="compact" index={index} />
            ))
          ) : (
            <p className="text-xs text-muted-foreground py-3 text-center">
              Trending predictions will appear here
            </p>
          )}
        </div>
      </section>

      {/* Top Articles */}
      <section className="bg-card rounded-lg border border-border/60 p-4" aria-labelledby="top-sidebar-heading">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-primary" aria-hidden="true" />
          <h3 id="top-sidebar-heading" className="font-display text-sm font-semibold">Most Read</h3>
        </div>
        <div className="space-y-0.5">
          {topArticles && topArticles.length > 0 ? (
            topArticles.map((article, index) => (
              <ArticleCard key={article.id} article={article} variant="compact" index={index} />
            ))
          ) : (
            <p className="text-xs text-muted-foreground py-3 text-center">
              Top predictions will appear here
            </p>
          )}
        </div>
      </section>

      {/* Categories */}
      <nav className="bg-card rounded-lg border border-border/60 p-4" aria-labelledby="categories-heading">
        <h3 id="categories-heading" className="font-display text-sm font-semibold mb-3">Categories</h3>
        <div className="space-y-1">
          {categoryConfig.map((category) => (
            <Link
              key={category.name}
              to={`/category/${category.name}/`}
              className="flex items-center justify-between p-2.5 rounded-md hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full ${category.color}`} aria-hidden="true" />
                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                  {category.name}
                </span>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums" aria-label={`${categoryCounts?.[category.name] || 0} articles`}>
                {categoryCounts?.[category.name] || 0}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
