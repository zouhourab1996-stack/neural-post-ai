import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface TrendingKeyword {
  id: string;
  keyword: string;
  category: string;
  search_volume: string | null;
  competition: string | null;
  discovered_at: string;
}

export default function TrendingTicker() {
  const { data: keywords } = useQuery({
    queryKey: ["trending-keywords"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trending_keywords")
        .select("*")
        .order("discovered_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as TrendingKeyword[];
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (!keywords || keywords.length === 0) {
    return null;
  }

  // Duplicate keywords for seamless infinite scroll
  const duplicatedKeywords = [...keywords, ...keywords];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'AI': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Tech': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Business': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Science': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  const getVolumeIndicator = (volume: string | null) => {
    switch (volume) {
      case 'high': return '🔥';
      case 'medium': return '📈';
      case 'low': return '📊';
      default: return '';
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-card via-card/95 to-card border-y border-border overflow-hidden">
      {/* Gradient overlays for seamless edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />
      
      <div className="flex items-center">
        {/* Label */}
        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-semibold text-sm z-20">
          <TrendingUp className="w-4 h-4" />
          <span className="hidden sm:inline">Trending Now</span>
          <span className="sm:hidden">Hot</span>
        </div>

        {/* Ticker */}
        <div className="flex-1 overflow-hidden py-3">
          <motion.div
            className="flex gap-4"
            animate={{
              x: [0, -50 * keywords.length],
            }}
            transition={{
              duration: keywords.length * 4,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {duplicatedKeywords.map((keyword, index) => (
              <Link
                key={`${keyword.id}-${index}`}
                to={`/category/${keyword.category}`}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all hover:scale-105 hover:shadow-md ${getCategoryColor(keyword.category)}`}
              >
                <span>{getVolumeIndicator(keyword.search_volume)}</span>
                <span className="whitespace-nowrap">{keyword.keyword}</span>
                <span className="text-xs opacity-60 hidden md:inline">#{keyword.category}</span>
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Sparkle indicator */}
        <div className="flex-shrink-0 px-4 py-3 z-20">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-4 h-4 text-accent" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}