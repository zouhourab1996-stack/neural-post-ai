# Architecture rules
- Keep RankYak deliveries in `rankyak_articles` with the provider's bigint ID; the legacy UUID articles table and publisher must remain unchanged.
- Merge published RankYak rows into the existing blog generator and manifest; keep the current sitemap generator as the only sitemap writer.
- Validate webhook payloads before service-role writes and sanitize external HTML for both static and client-rendered blog pages to prevent script injection.