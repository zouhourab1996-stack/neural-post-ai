import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

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

export default function Index() {
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as Article[];
    },
  });

  const featuredArticles = articles?.filter((a) => a.is_featured) || [];
  const trendingArticles = articles?.filter((a) => a.is_trending) || [];
  const latestArticles = articles?.slice(0, 12) || [];

  return (
    <div className="container-main py-8">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          AI-Powered News Coverage
        </div>
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          The Future of News,{" "}
          <span className="gradient-text">Powered by AI</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Stay ahead with cutting-edge coverage of artificial intelligence, technology, 
          business innovations, and scientific breakthroughs.
        </p>
      </motion.section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold">Featured Stories</h2>
            <Link to="/category/AI">
              <Button variant="ghost" className="text-primary">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredArticles.slice(0, 2).map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="featured"
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Latest News */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold">Latest News</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">No articles found yet.</p>
              <p className="text-sm text-muted-foreground">
                Articles will appear here once generated.
              </p>
            </div>
          ) : latestArticles.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {latestArticles.map((article, index) => (
                  <ArticleCard key={article.id} article={article} index={index} />
                ))}
              </div>

              {/* In-feed Ad Slot */}
              <div className="ad-slot h-32 w-full mb-8 rounded-xl">
                Advertisement Space - In-Feed Ad
              </div>

              <div className="flex justify-center">
                <Button variant="outline" size="lg" className="rounded-full">
                  Load More Articles <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-card rounded-xl border border-border">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-serif text-xl font-semibold mb-2">No Articles Yet</h3>
              <p className="text-muted-foreground mb-4">
                Articles will be generated automatically using AI.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <Sidebar trendingArticles={trendingArticles} />
      </div>
    </div>
  );
}
