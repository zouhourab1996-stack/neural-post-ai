CREATE TABLE public.rankyak_articles (
 id bigint PRIMARY KEY,
 slug text UNIQUE NOT NULL,
 title text NOT NULL,
 excerpt text,
 meta_title text,
 meta_description text,
 html text,
 markdown text,
 header_image_url text,
 status text NOT NULL CHECK (status IN ('published', 'draft')),
 publish_at timestamptz,
 published_at timestamptz,
 updated_at timestamptz,
 archived_at timestamptz,
 received_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rankyak_articles TO anon, authenticated;
GRANT ALL ON public.rankyak_articles TO service_role;
ALTER TABLE public.rankyak_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published RankYak articles are publicly readable" ON public.rankyak_articles FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE INDEX rankyak_articles_published_order ON public.rankyak_articles (published_at DESC) WHERE status = 'published';