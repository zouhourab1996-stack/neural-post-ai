import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { payloadSchema, isConnectionTest, sameSecret } from "./payload.ts";

const SITE_URL = "https://prophetic.pw";
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async req => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const secret = Deno.env.get("RANKYAK_WEBHOOK_SECRET");
  if (!secret) return json({ error: "Webhook is not configured" }, 500);
  if (!sameSecret(req.headers.get("x-rankyak-secret"), secret)) return json({ error: "Invalid secret" }, 401);
  try {
    const parsed = payloadSchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Invalid article payload" }, 400);
    const payload = parsed.data;
    if (isConnectionTest(payload)) return json({ ok: true });
    if (payload.event === "ping") return json({ ok: true });
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return json({ error: "Article storage is not configured" }, 500);
    const client = createClient(url, key, { auth: { persistSession: false } });
    // Provider deliveries are stored as drafts only. A webhook event must
    // never publish content to the public site without editorial review.
    const { error } = await client.from("rankyak_articles").upsert({
      ...payload.article, status: "draft", received_at: new Date().toISOString(),
    }, { onConflict: "id" });
    if (error) return json({ error: "Unable to save article" }, 500);
    return json({
      status: "draft",
      message: "Article received. Editorial review is required before publication.",
      url: `${SITE_URL}/blog/${payload.article.slug}/`,
    });
  } catch {
    return json({ error: "Unable to process request" }, 500);
  }
});