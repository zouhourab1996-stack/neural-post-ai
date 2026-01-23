import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, TrendingUp, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface Article {
  id: string;
  title: string;
  slug: string;
  meta_description: string;
  category: string;
  image_url?: string;
  is_featured?: boolean;
  is_trending?: boolean;
  created_at: string;
}

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "featured" | "compact";
  index?: number;
}

export default function ArticleCard({ article, variant = "default", index = 0 }: ArticleCardProps) {
  const timeAgo = formatDistanceToNow(new Date(article.created_at), { addSuffix: true });
  
  // Generate descriptive alt text for SEO
  const getAltText = () => {
    return `${article.title} - ${article.category} news article on NeuralPost`;
  };

  const fallbackImage = `https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80`;

  if (variant === "featured") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group relative overflow-hidden rounded-2xl bg-card border border-border shadow-lg"
        itemScope
        itemType="https://schema.org/NewsArticle"
      >
        <Link to={`/article/${article.slug}`} className="block" itemProp="url">
          <div className="aspect-[16/10] overflow-hidden">
            <img
              src={article.image_url || fallbackImage}
              alt={getAltText()}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              itemProp="image"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="bg-primary text-primary-foreground" itemProp="articleSection">
                {article.category}
              </Badge>
              {article.is_trending && (
                <Badge variant="outline" className="border-accent text-accent bg-accent/10">
                  <TrendingUp className="w-3 h-3 mr-1" aria-hidden="true" />
                  <span>Trending</span>
                </Badge>
              )}
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors" itemProp="headline">
              {article.title}
            </h2>
            <p className="text-sm text-primary-foreground/80 line-clamp-2 mb-3" itemProp="description">
              {article.meta_description}
            </p>
            <div className="flex items-center text-sm text-primary-foreground/60">
              <Clock className="w-4 h-4 mr-1" aria-hidden="true" />
              <time dateTime={article.created_at} itemProp="datePublished">{timeAgo}</time>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  if (variant === "compact") {
    return (
      <motion.article
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="group"
        itemScope
        itemType="https://schema.org/NewsArticle"
      >
        <Link to={`/article/${article.slug}`} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted transition-colors" itemProp="url">
          <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
            <img
              src={article.image_url || `https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&q=80`}
              alt={getAltText()}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              itemProp="image"
            />
          </div>
          <div className="flex-1 min-w-0">
            <Badge variant="outline" className="mb-1 text-xs" itemProp="articleSection">
              {article.category}
            </Badge>
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors" itemProp="headline">
              {article.title}
            </h3>
            <time className="text-xs text-muted-foreground mt-1 block" dateTime={article.created_at} itemProp="datePublished">
              {timeAgo}
            </time>
          </div>
        </Link>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group bg-card rounded-xl border border-border overflow-hidden card-hover"
      itemScope
      itemType="https://schema.org/NewsArticle"
    >
      <Link to={`/article/${article.slug}`} className="block" itemProp="url">
        <div className="aspect-video overflow-hidden">
          <img
            src={article.image_url || fallbackImage}
            alt={getAltText()}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            itemProp="image"
          />
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" itemProp="articleSection">{article.category}</Badge>
            {article.is_trending && (
              <Badge variant="outline" className="text-accent border-accent">
                <TrendingUp className="w-3 h-3 mr-1" aria-hidden="true" />
                <span>Trending</span>
              </Badge>
            )}
          </div>
          <h3 className="font-serif text-xl font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors" itemProp="headline">
            {article.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4" itemProp="description">
            {article.meta_description}
          </p>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" aria-hidden="true" />
              <time dateTime={article.created_at} itemProp="datePublished">{timeAgo}</time>
            </div>
            <span className="flex items-center text-primary font-medium group-hover:gap-2 transition-all">
              Read more <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}