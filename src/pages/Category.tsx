import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

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

const categoryDescriptions: Record<string, string> = {
  AI: "Explore the latest developments in artificial intelligence, machine learning, and neural networks.",
  Tech: "Stay updated with cutting-edge technology news, gadgets, and digital innovations.",
  Business: "Insights into the business world, startups, markets, and entrepreneurship.",
  Science: "Discover breakthrough research, scientific discoveries, and innovations shaping our future.",
};

export default function Category() {
  const { category } = useParams<{ category: string }>();
  const [page, setPage] = useState(1);
  const perPage = 9;

  const { data: articles, isLoading, error } = useQuery({
    queryKey: ["articles", category, page],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("category", category)
        .order("created_at", { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1);
      
      if (error) throw error;
      return data as Article[];
    },
  });

  const { data: trendingArticles } = useQuery({
    queryKey: ["trending-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("is_trending", true)
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data as Article[];
    },
  });

  const validCategories = ["AI", "Tech", "Business", "Science"];
  const isValidCategory = category && validCategories.includes(category);

  if (!isValidCategory) {
    return (
      <div className="container-main py-20 text-center">
        <h1 className="font-serif text-3xl font-bold mb-4">Category Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The category you're looking for doesn't exist.
        </p>
        <Link to="/">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-main py-8">
      {/* Category Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
          {category} <span className="text-primary">News</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          {categoryDescriptions[category] || "Latest news and updates."}
        </p>
      </motion.header>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Articles Grid */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error || !articles || articles.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-border">
              <h3 className="font-serif text-xl font-semibold mb-2">No Articles Found</h3>
              <p className="text-muted-foreground">
                No articles in this category yet. Check back soon!
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {articles.map((article, index) => (
                  <ArticleCard key={article.id} article={article} index={index} />
                ))}
              </div>

              {/* Ad Slot - In-feed */}
              <div className="ad-slot h-32 w-full mb-8 rounded-xl">
                Advertisement Space - In-Feed Ad
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">Page {page}</span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={articles.length < perPage}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <Sidebar trendingArticles={trendingArticles || []} />
      </div>
    </div>
  );
}
