import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface TrendingKeyword {
  id: string;
  keyword: string;
  category: string;
  search_volume: string | null;
  discovered_at: string;
}

export default function TrendingTicker() {
  const { data: keywords } = useQuery({
    queryKey: ["trending-keywords"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trending_keywords")
        .select("id,keyword,category,search_volume,discovered_at")
        .order("discovered_at", { ascending: false })
        .limit(15);
      
      if (error) throw error;
      return data as TrendingKeyword[];
    },
    staleTime: 120000,
  });

  if (!keywords || keywords.length === 0) return null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'AI': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'Tech': return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      case 'Business': return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'Science': return 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30';
      default: return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  return (
    <div className="relative bg-card border-y border-border overflow-hidden" role="marquee" aria-label="Trending topics">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />
      
      <div className="flex items-center">
        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold text-sm z-20">
          <TrendingUp className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Trending</span>
        </div>

        <div className="flex-1 overflow-hidden py-2.5">
          <div className="flex gap-3 animate-ticker">
            {[...keywords, ...keywords].map((keyword, index) => (
              <Link
                key={`${keyword.id}-${index}`}
                to={`/category/${keyword.category}/`}
                className={`flex-shrink-0 px-3 py-1 rounded-full border text-xs font-medium hover:opacity-80 transition-opacity ${getCategoryColor(keyword.category)}`}
              >
                {keyword.keyword}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
