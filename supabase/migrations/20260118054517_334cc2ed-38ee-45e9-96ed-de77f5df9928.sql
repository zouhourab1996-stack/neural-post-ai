-- Create table for storing discovered trends and keywords
CREATE TABLE public.trending_keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  category TEXT NOT NULL,
  search_volume TEXT DEFAULT 'unknown',
  competition TEXT DEFAULT 'unknown',
  discovered_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trending_keywords ENABLE ROW LEVEL SECURITY;

-- Allow public read access for displaying trends
CREATE POLICY "Anyone can view trending keywords"
  ON public.trending_keywords
  FOR SELECT
  USING (true);

-- Create index for efficient querying
CREATE INDEX idx_trending_keywords_date ON public.trending_keywords(discovered_at DESC);
CREATE INDEX idx_trending_keywords_category ON public.trending_keywords(category);

-- Add indexes to articles for better SEO performance
CREATE INDEX IF NOT EXISTS idx_articles_trending ON public.articles(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_articles_featured ON public.articles(is_featured) WHERE is_featured = true;