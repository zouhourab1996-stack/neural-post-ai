import { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function BlogArticle() {
  const { slug = "" } = useParams();
  useEffect(() => {
    // Static, editorially curated article pages are the source of truth.
    // Force a full navigation so the SPA cannot load legacy database drafts.
    window.location.replace(`/blog/${encodeURIComponent(slug)}/`);
  }, [slug]);
  return <section className="container-main py-16"><p role="status">Opening the published article…</p><p><a href="/blog/">Return to all guides</a></p></section>;
}
