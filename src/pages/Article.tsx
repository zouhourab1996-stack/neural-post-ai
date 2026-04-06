import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Clock, 
  ArrowLeft, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Link2, 
  Loader2,
  BookOpen,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ArticleCard from "@/components/ArticleCard";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useEffect, useMemo } from "react";
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

const categoryBadgeClass: Record<string, string> = {
  AI: "badge-ai",
  Tech: "badge-tech",
  Business: "badge-business",
  Science: "badge-science",
};

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

const buildDocumentTitle = (title: string) => {
  const suffix = " | Prophetic";
  const clean = title.replace(/\s+/g, " ").trim();
  const allowed = Math.max(20, 60 - suffix.length);
  const trimmed = clean.length > allowed ? `${clean.slice(0, allowed - 1).trim()}…` : clean;
  return `${trimmed}${suffix}`;
};

function estimateReadingTime(content: string): number {
  const words = content.replace(/[#*_`\[\]()]/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 230));
}

function extractHeadings(content: string): { text: string; level: number; id: string }[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: { text: string; level: number; id: string }[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[2].replace(/[*_`]/g, '').trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    headings.push({ text, level: match[1].length, id });
  }
  return headings;
}

// Component to insert ads within article content
function ArticleContentWithAds({ content }: { content: string }) {
  const sections = content.split(/\n\n+/);
  const adInsertIndex = Math.min(3, sections.length - 1);
  
  const beforeAd = sections.slice(0, adInsertIndex + 1).join('\n\n');
  const afterAd = sections.slice(adInsertIndex + 1).join('\n\n');
  
  return (
    <>
      <ReactMarkdown>{beforeAd}</ReactMarkdown>
      
      {sections.length > 3 && (
        <AdSlot className="my-8" />
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

  const readingTime = useMemo(() => {
    if (!article) return 0;
    return estimateReadingTime(article.content);
  }, [article]);

  const headings = useMemo(() => {
    if (!article) return [];
    return extractHeadings(article.content);
  }, [article]);

  // Update meta tags and inject JSON-LD schema for SEO
  useEffect(() => {
    if (article) {
      document.title = buildDocumentTitle(article.title);

      const canonicalUrl = `${window.location.origin}/article/${article.slug}/`;
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", article.meta_description);
      }

      const canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        canonicalLink.setAttribute("href", canonicalUrl);
      }

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", article.title);
      
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) ogDescription.setAttribute("content", article.meta_description);

      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute("content", canonicalUrl);
      
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && article.image_url) ogImage.setAttribute("content", article.image_url);

      const articleSchema = generateArticleSchema({
        title: article.title,
        description: article.meta_description,
        image: article.image_url || "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1200",
        slug: article.slug,
        publishedTime: article.created_at,
        modifiedTime: article.updated_at,
        category: article.category,
        author: "Prophetic Editorial Team"
      });

      const breadcrumbSchema = generateBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: article.category, url: `/category/${article.category}/` },
        { name: article.title, url: `/article/${article.slug}/` }
      ]);

      document.querySelectorAll('script[data-schema="article"]').forEach(el => el.remove());
      document.querySelectorAll('script[data-schema="breadcrumb"]').forEach(el => el.remove());

      const articleScriptEl = document.createElement("script");
      articleScriptEl.type = "application/ld+json";
      articleScriptEl.setAttribute("data-schema", "article");
      articleScriptEl.textContent = JSON.stringify(articleSchema);
      document.head.appendChild(articleScriptEl);

      const breadcrumbScriptEl = document.createElement("script");
      breadcrumbScriptEl.type = "application/ld+json";
      breadcrumbScriptEl.setAttribute("data-schema", "breadcrumb");
      breadcrumbScriptEl.textContent = JSON.stringify(breadcrumbSchema);
      document.head.appendChild(breadcrumbScriptEl);

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
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container-main py-20 text-center">
        <h1 className="font-display text-2xl font-bold mb-3">Article Not Found</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          The article you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(article.created_at), { addSuffix: true });
  const publishDate = format(new Date(article.created_at), "MMMM d, yyyy");
  const badgeClass = categoryBadgeClass[article.category] || "bg-muted text-muted-foreground";

  return (
    <article>
      {/* Hero Section */}
      <header className="relative">
        <div className="aspect-[21/9] md:aspect-[3/1] overflow-hidden">
          <img
            src={article.image_url || `https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1600&q=80`}
            alt={article.title}
            width={1600}
            height={900}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        
        <div className="container-main relative -mt-28 md:-mt-36 pb-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/category/${article.category}/`} className="hover:text-primary transition-colors">{article.category}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-400 line-clamp-1">{article.title}</span>
          </nav>

          <div className="flex items-center flex-wrap gap-2.5 mb-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}>
              {article.category}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {timeAgo}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {readingTime} min read
            </span>
            {article.views != null && article.views > 0 && (
              <span className="text-xs text-muted-foreground">
                {article.views.toLocaleString()} views
              </span>
            )}
          </div>
          
          <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-3 max-w-4xl leading-tight">
            {article.title}
          </h1>
          
          <p className="text-base text-slate-400 max-w-3xl">
            {article.meta_description}
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="container-main">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sharing Sidebar - Desktop */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20 space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 font-medium">Share</p>
              {[
                { platform: "twitter", icon: Twitter, label: "Share on X" },
                { platform: "facebook", icon: Facebook, label: "Share on Facebook" },
                { platform: "linkedin", icon: Linkedin, label: "Share on LinkedIn" },
                { platform: "copy", icon: Link2, label: "Copy link" },
              ].map(({ platform, icon: Icon, label }) => (
                <button
                  key={platform}
                  onClick={() => handleShare(platform)}
                  className="w-9 h-9 rounded-md bg-card border border-border/60 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </aside>

          {/* Article Content */}
          <div className="lg:col-span-7">
            <AdSlot className="mb-8" />

            {/* Table of Contents */}
            {headings.length > 2 && (
              <div className="bg-card border border-border/60 rounded-lg p-4 mb-8">
                <h2 className="font-display text-sm font-semibold mb-2.5">In this article</h2>
                <nav aria-label="Table of contents">
                  <ul className="space-y-1.5">
                    {headings.map((heading) => (
                      <li key={heading.id} className={heading.level === 3 ? "pl-4" : ""}>
                        <a
                          href={`#${heading.id}`}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                          {heading.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            )}

            <div className="article-content">
              <ArticleContentWithAds content={article.content} />
            </div>

            {/* Mobile Share Buttons */}
            <div className="lg:hidden flex items-center gap-2 mt-8 pt-6 border-t border-border/60">
              <span className="text-xs text-muted-foreground mr-1 font-medium">Share:</span>
              {[
                { platform: "twitter", icon: Twitter },
                { platform: "facebook", icon: Facebook },
                { platform: "linkedin", icon: Linkedin },
                { platform: "copy", icon: Link2 },
              ].map(({ platform, icon: Icon }) => (
                <button
                  key={platform}
                  onClick={() => handleShare(platform)}
                  className="w-9 h-9 rounded-md bg-card border border-border/60 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            <AdSlot className="my-8" />

            {/* Article Footer */}
            <div className="py-6 border-t border-border/60">
              <p className="text-xs text-muted-foreground">
                Published on {publishDate} by Prophetic Editorial Team
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <AdSlot />

            {/* Related Articles */}
            {relatedArticles && relatedArticles.length > 0 && (
              <div className="bg-card rounded-lg border border-border/60 p-4">
                <h3 className="font-display text-sm font-semibold mb-3">Related Articles</h3>
                <div className="space-y-0.5">
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

            <div className="sticky top-20">
              <AdSlot />
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
