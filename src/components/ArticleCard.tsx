import { Link } from "react-router-dom";
import { Clock, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Article {
  id: string;
  title: string;
  slug: string;
  meta_description: string;
  category: string;
  image_url?: string | null;
  is_featured?: boolean | null;
  is_trending?: boolean | null;
  created_at: string;
}

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "featured" | "compact";
  index?: number;
}

const categoryBadgeClass: Record<string, string> = {
  AI: "badge-ai",
  Tech: "badge-tech",
  Business: "badge-business",
  Science: "badge-science",
};

function CategoryBadge({ category }: { category: string }) {
  const colorClass = categoryBadgeClass[category] || "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`} itemProp="articleSection">
      {category}
    </span>
  );
}

export default function ArticleCard({ article, variant = "default", index = 0 }: ArticleCardProps) {
  const timeAgo = formatDistanceToNow(new Date(article.created_at), { addSuffix: true });
  const altText = `${article.title} - ${article.category} prediction`;
  const fallbackImage = `https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80`;
  const imgSrc = article.image_url || fallbackImage;

  if (variant === "featured") {
    return (
      <article
        className="group relative overflow-hidden rounded-lg bg-card border border-border/60"
        itemScope
        itemType="https://schema.org/NewsArticle"
      >
        <Link to={`/article/${article.slug}/`} className="block" itemProp="url">
          <div className="aspect-[16/10] overflow-hidden">
            <img
              src={imgSrc}
              alt={altText}
              width={800}
              height={500}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={index === 0 ? "high" : "auto"}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              itemProp="image"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center gap-2 mb-2.5">
              <CategoryBadge category={article.category} />
              {article.is_trending && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  Trending
                </span>
              )}
            </div>
            <h2 className="font-display text-xl md:text-2xl font-bold mb-1.5 line-clamp-2 text-foreground group-hover:text-primary transition-colors" itemProp="headline">
              {article.title}
            </h2>
            <p className="text-sm text-slate-400 line-clamp-2 mb-2" itemProp="description">
              {article.meta_description}
            </p>
            <div className="flex items-center text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              <time dateTime={article.created_at} itemProp="datePublished">{timeAgo}</time>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group" itemScope itemType="https://schema.org/NewsArticle">
        <Link to={`/article/${article.slug}/`} className="flex items-start gap-3 p-2.5 rounded-md hover:bg-muted/50 transition-colors" itemProp="url">
          <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
            <img
              src={imgSrc}
              alt={altText}
              width={64}
              height={64}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              itemProp="image"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug" itemProp="headline">
              {article.title}
            </h3>
            <time className="text-xs text-muted-foreground mt-1 block" dateTime={article.created_at} itemProp="datePublished">
              {timeAgo}
            </time>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article
      className="group bg-card rounded-lg border border-border/60 overflow-hidden card-hover"
      itemScope
      itemType="https://schema.org/NewsArticle"
    >
      <Link to={`/article/${article.slug}/`} className="block" itemProp="url">
        <div className="aspect-video overflow-hidden">
          <img
            src={imgSrc}
            alt={altText}
            width={800}
            height={450}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            itemProp="image"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <CategoryBadge category={article.category} />
            {article.is_trending && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                Trending
              </span>
            )}
          </div>
          <h3 className="font-display text-lg font-semibold line-clamp-2 mb-1.5 group-hover:text-primary transition-colors leading-snug" itemProp="headline">
            {article.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3" itemProp="description">
            {article.meta_description}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              <time dateTime={article.created_at} itemProp="datePublished">{timeAgo}</time>
            </div>
            <span className="flex items-center text-primary font-medium gap-0.5 group-hover:gap-1.5 transition-all">
              Read <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
