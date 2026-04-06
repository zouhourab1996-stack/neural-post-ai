import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ArticleCard from "@/components/ArticleCard";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
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

const categoryDescriptions: Record<string, string> = {
  AI: "Explore AI predictions, future trends in machine learning, and neural network breakthroughs.",
  Tech: "Stay updated with cutting-edge tech forecasts, gadgets, and digital innovation predictions.",
  Business: "Market outlook, startup predictions, and business trend forecasts powered by AI analysis.",
  Science: "Discover scientific breakthroughs and innovation predictions shaping our future.",
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
  const categorySeoDescription = isValidCategory
    ? `${categoryDescriptions[category] || `Latest ${category} predictions and analysis.`} Read trend forecasts and long-form analysis from Prophetic.`
    : "Latest predictions and analysis from Prophetic.";

  if (!isValidCategory) {
    return (
      <div className="container-main py-20 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Category Not Found</h1>
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
    <>
      <SEOHead
        title={`${category} Predictions & Analysis`}
        description={categorySeoDescription}
        canonical={`https://prophetic.pw/category/${category}/`}
      />

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
        
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
          {category} <span className="text-primary">Predictions</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          {categoryDescriptions[category] || "Latest predictions and analysis."}
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
            <div className="text-center py-20 bg-card rounded-xl border border-border/60">
              <h3 className="font-display text-xl font-semibold mb-2">No Predictions Found</h3>
              <p className="text-muted-foreground">
                No predictions in this category yet. Check back soon!
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {articles.map((article, index) => (
                  <ArticleCard key={article.id} article={article} index={index} />
                ))}
              </div>

              {/* AdSense - In-Feed */}
              <div className="w-full mb-8 rounded-xl overflow-hidden">
                <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client="ca-pub-3898992716389443" data-ad-slot="auto" data-ad-format="fluid" data-ad-layout-key="-6t+ed+2i-1n-4w" data-full-width-responsive="true"></ins>
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
    </>
  );
}
