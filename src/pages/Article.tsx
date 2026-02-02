import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Clock, 
  ArrowLeft, 
  Share2, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Link2, 
  Loader2,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ArticleCard from "@/components/ArticleCard";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useEffect } from "react";
import { generateArticleSchema, generateBreadcrumbSchema } from "@/components/SEOHead";

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

// Component to insert ads within article content
function ArticleContentWithAds({ content }: { content: string }) {
  // Split content by double newlines (paragraphs in markdown)
  const sections = content.split(/\n\n+/);
  
  // Insert ad after the 2nd section (or at the end if content is short)
  const adInsertIndex = Math.min(2, sections.length - 1);
  
  const beforeAd = sections.slice(0, adInsertIndex + 1).join('\n\n');
  const afterAd = sections.slice(adInsertIndex + 1).join('\n\n');
  
  return (
    <>
      <ReactMarkdown>{beforeAd}</ReactMarkdown>
      
      {sections.length > 2 && (
        <aside className="ad-slot h-28 w-full my-8 rounded-xl" aria-label="Advertisement">
          Advertisement Space - In-Article Rectangle
        </aside>
      )}
      
      {afterAd && <ReactMarkdown>{afterAd}</ReactMarkdown>}
    </>
  );
}

export default function Article() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      
      if (error) throw error;
      return data as Article | null;
    },
  });

  const { data: relatedArticles } = useQuery({
    queryKey: ["related-articles", article?.category],
    queryFn: async () => {
      if (!article) return [];
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("category", article.category)
        .neq("id", article.id)
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data as Article[];
    },
    enabled: !!article,
  });

  // Update meta tags and inject JSON-LD schema for SEO
  useEffect(() => {
    if (article) {
      document.title = `${article.title} | NeuralPost`;

      const canonicalUrl = `${window.location.origin}/#/article/${article.slug}`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", article.meta_description);
      }

      // Update canonical
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        canonicalLink.setAttribute("href", canonicalUrl);
      }

      // Update OpenGraph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", article.title);
      
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) ogDescription.setAttribute("content", article.meta_description);

      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute("content", canonicalUrl);
      
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && article.image_url) ogImage.setAttribute("content", article.image_url);

      // Inject NewsArticle JSON-LD schema
      const articleSchema = generateArticleSchema({
        title: article.title,
        description: article.meta_description,
        image: article.image_url || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1600&q=80",
        slug: article.slug,
        publishedTime: article.created_at,
        modifiedTime: article.updated_at,
        category: article.category,
        author: "NeuralPost AI"
      });

      // Inject Breadcrumb JSON-LD schema
      const breadcrumbSchema = generateBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: article.category, url: `/category/${article.category}` },
        { name: article.title, url: `/article/${article.slug}` }
      ]);

      // Remove existing article schemas
      document.querySelectorAll('script[data-schema="article"]').forEach(el => el.remove());
      document.querySelectorAll('script[data-schema="breadcrumb"]').forEach(el => el.remove());

      // Add article schema
      const articleScriptEl = document.createElement("script");
      articleScriptEl.type = "application/ld+json";
      articleScriptEl.setAttribute("data-schema", "article");
      articleScriptEl.textContent = JSON.stringify(articleSchema);
      document.head.appendChild(articleScriptEl);

      // Add breadcrumb schema
      const breadcrumbScriptEl = document.createElement("script");
      breadcrumbScriptEl.type = "application/ld+json";
      breadcrumbScriptEl.setAttribute("data-schema", "breadcrumb");
      breadcrumbScriptEl.textContent = JSON.stringify(breadcrumbSchema);
      document.head.appendChild(breadcrumbScriptEl);

      // Cleanup on unmount
      return () => {
        document.querySelectorAll('script[data-schema="article"]').forEach(el => el.remove());
        document.querySelectorAll('script[data-schema="breadcrumb"]').forEach(el => el.remove());
      };
    }
  }, [article]);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = article?.title || "";
    
    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container-main py-20 text-center">
        <h1 className="font-serif text-3xl font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The article you're looking for doesn't exist or has been removed.
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

  const timeAgo = formatDistanceToNow(new Date(article.created_at), { addSuffix: true });
  const publishDate = format(new Date(article.created_at), "MMMM d, yyyy");

  return (
    <article>
      {/* Hero Section */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="aspect-[21/9] md:aspect-[3/1] overflow-hidden">
          <img
            src={article.image_url || `https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1600&q=80`}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
        
        <div className="container-main relative -mt-32 md:-mt-40 pb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all articles
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-primary text-primary-foreground">{article.category}</Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {timeAgo}
            </span>
            {article.views && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {article.views.toLocaleString()} views
              </span>
            )}
          </div>
          
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4 max-w-4xl">
            {article.title}
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-3xl">
            {article.meta_description}
          </p>
        </div>
      </motion.header>

      {/* Content */}
      <div className="container-main">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sharing Sidebar - Desktop */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Share</p>
              <button
                onClick={() => handleShare("twitter")}
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare("facebook")}
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare("linkedin")}
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare("copy")}
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Link2 className="w-5 h-5" />
              </button>
            </div>
          </aside>

          {/* Article Content */}
          <div className="lg:col-span-7">
            {/* Ad Slot - Before Content */}
            <div className="ad-slot h-24 w-full mb-8 rounded-xl">
              Advertisement Space - Article Top
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="article-content"
            >
              <ArticleContentWithAds content={article.content} />
            </motion.div>

            {/* Mobile Share Buttons */}
            <div className="lg:hidden flex items-center gap-2 mt-8 pt-8 border-t border-border">
              <span className="text-sm text-muted-foreground mr-2">Share:</span>
              <button
                onClick={() => handleShare("twitter")}
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare("facebook")}
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare("linkedin")}
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare("copy")}
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Link2 className="w-5 h-5" />
              </button>
            </div>

            {/* Ad Slot - After Content */}
            <div className="ad-slot h-32 w-full my-8 rounded-xl">
              Advertisement Space - Article Bottom
            </div>

            {/* Article Footer */}
            <div className="py-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Published on {publishDate}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Ad Slot */}
            <div className="ad-slot h-64 w-full rounded-xl">
              Advertisement Space - 300x250
            </div>

            {/* Related Articles */}
            {relatedArticles && relatedArticles.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-serif text-lg font-semibold mb-4">Related Articles</h3>
                <div className="space-y-1">
                  {relatedArticles.map((related, index) => (
                    <ArticleCard
                      key={related.id}
                      article={related}
                      variant="compact"
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sticky Ad */}
            <div className="ad-slot h-64 w-full rounded-xl sticky top-24">
              Advertisement Space - 300x250
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
