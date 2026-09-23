import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import { supabase } from "@/integrations/supabase/client"

type ArticleRow = {
  title: string
  slug: string
  meta_description: string
  content: string
  category: string
  image_url: string | null
  created_at: string
  updated_at: string
}

const SITE = "https://prophetic.pw"

export default function Article() {
  const { slug = "" } = useParams()
  const [article, setArticle] = useState<ArticleRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    supabase.from("articles").select("title,slug,meta_description,content,category,image_url,created_at,updated_at").eq("slug", slug).maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error) console.error("Article load error:", error)
        setArticle((data as ArticleRow | null) || null)
        setLoading(false)
      })
    return () => { active = false }
  }, [slug])

  useEffect(() => {
    if (!article) return
    const url = `${SITE}/article/${article.slug}/`
    document.title = `${article.title} | Prophetic`
    const setMeta = (selector: string, attr: string, value: string) => document.querySelector(selector)?.setAttribute(attr, value)
    setMeta('meta[name="description"]', "content", article.meta_description.slice(0, 160))
    setMeta('meta[name="robots"]', "content", "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1")
    setMeta('link[rel="canonical"]', "href", url)
    setMeta('meta[property="og:type"]', "content", "article")
    setMeta('meta[property="og:url"]', "content", url)
    setMeta('meta[property="og:title"]', "content", article.title)
    setMeta('meta[property="og:description"]', "content", article.meta_description.slice(0, 160))
    if (article.image_url) setMeta('meta[property="og:image"]', "content", article.image_url)

    const existing = document.querySelector('script[data-schema="article-page"]')
    existing?.remove()
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.meta_description,
      datePublished: article.created_at,
      dateModified: article.updated_at || article.created_at,
      author: { "@type": "Organization", name: "Prophetic Editorial Team" },
      publisher: { "@type": "Organization", name: "Prophetic", url: SITE, logo: { "@type": "ImageObject", url: `${SITE}/logo.svg` } },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      url,
      articleSection: article.category,
      inLanguage: "en-US",
      ...(article.image_url ? { image: [article.image_url] } : {}),
    }
    const script = document.createElement("script")
    script.type = "application/ld+json"
    script.setAttribute("data-schema", "article-page")
    script.textContent = JSON.stringify(schema)
    document.head.appendChild(script)
    return () => script.remove()
  }, [article])

  if (loading) return <main className="container-main section-pad"><p>Loading article…</p></main>
  if (!article) return <main className="container-main section-pad"><h1>Article not found</h1><p>This article is no longer available.</p><Link to="/">Return home</Link></main>

  return <main className="container-main section-pad"><article className="article-page">
    <header><span className="eyebrow">{article.category}</span><h1>{article.title}</h1><p>{article.meta_description}</p><time dateTime={article.created_at}>{new Date(article.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time></header>
    {article.image_url && <img src={article.image_url} alt={article.title} loading="eager" />}
    <div className="article-content"><ReactMarkdown>{article.content}</ReactMarkdown></div>
  </article></main>
}
