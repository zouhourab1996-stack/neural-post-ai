import { Link } from "react-router-dom";
import { TrendingUp, Flame, ArrowRight } from "lucide-react";
import ArticleCard from "@/components/ArticleCard";

interface Article {
  id: string;
  title: string;
  slug: string;
  meta_description: string;
  category: string;
  image_url?: string;
  is_trending?: boolean;
  created_at: string;
}

interface SidebarProps {
  trendingArticles: Article[];
}

const categories = [
  { name: "AI", count: 42, color: "bg-blue-500" },
  { name: "Tech", count: 38, color: "bg-green-500" },
  { name: "Business", count: 25, color: "bg-purple-500" },
  { name: "Science", count: 31, color: "bg-orange-500" },
];

export default function Sidebar({ trendingArticles }: SidebarProps) {
  return (
    <aside className="space-y-8">
      {/* Ad Slot - Sidebar */}
      <div className="ad-slot h-64 w-full rounded-xl">
        Advertisement Space - 300x250
      </div>

      {/* Trending Articles */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-accent" />
          <h3 className="font-serif text-lg font-semibold">Trending Now</h3>
        </div>
        <div className="space-y-1">
          {trendingArticles.slice(0, 5).map((article, index) => (
            <ArticleCard key={article.id} article={article} variant="compact" index={index} />
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-serif text-lg font-semibold mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/category/${category.name}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${category.color}`} />
                <span className="font-medium group-hover:text-primary transition-colors">
                  {category.name}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">{category.count}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-gradient-to-br from-primary to-accent rounded-xl p-6 text-primary-foreground">
        <h3 className="font-serif text-xl font-semibold mb-2">Stay Updated</h3>
        <p className="text-sm text-primary-foreground/80 mb-4">
          Get the latest AI and tech news delivered to your inbox.
        </p>
        <div className="space-y-3">
          <input
            type="email"
            placeholder="your@email.com"
            className="w-full px-4 py-2 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
          />
          <button className="w-full px-4 py-2 rounded-lg bg-primary-foreground text-primary font-medium hover:bg-primary-foreground/90 transition-colors flex items-center justify-center gap-2">
            Subscribe <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Another Ad Slot */}
      <div className="ad-slot h-64 w-full rounded-xl sticky top-24">
        Advertisement Space - 300x250
      </div>
    </aside>
  );
}
