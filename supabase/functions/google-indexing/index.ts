import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri: string;
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: sa.token_uri,
    iat: now,
    exp: now + 3600,
  }));

  const textEncoder = new TextEncoder();
  const inputData = textEncoder.encode(`${header}.${payload}`);

  // Import the private key
  const pemContent = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '');
  const binaryKey = Uint8Array.from(atob(pemContent), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, inputData);
  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const jwt = `${header}.${payload}.${sig}`;

  const tokenRes = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const { access_token } = await tokenRes.json();
  return access_token;
}

async function submitUrl(accessToken: string, url: string, type: string = "URL_UPDATED") {
  const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ url, type }),
  });

  const data = await res.json();
  return { url, status: res.status, ...data };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const saJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    if (!saJson) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON secret not configured");
    }

    const serviceAccount: ServiceAccount = JSON.parse(saJson);
    const accessToken = await getAccessToken(serviceAccount);

    const { action, urls } = await req.json();

    // If no URLs provided, fetch all article URLs from database
    let urlsToSubmit: string[] = urls || [];

    if (urlsToSubmit.length === 0) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: articles, error } = await supabase
        .from("articles")
        .select("slug")
        .order("created_at", { ascending: false });

      if (error) throw error;

      urlsToSubmit = (articles || []).map(
        (a: { slug: string }) => `https://prophetic.pw/article/${a.slug}`
      );

      // Also add static pages
      const staticPages = [
        "https://prophetic.pw/",
        "https://prophetic.pw/about",
        "https://prophetic.pw/contact",
        "https://prophetic.pw/privacy",
        "https://prophetic.pw/terms",
        "https://prophetic.pw/disclaimer",
      ];
      urlsToSubmit = [...staticPages, ...urlsToSubmit];
    }

    const type = action === "remove" ? "URL_DELETED" : "URL_UPDATED";

    const results = [];
    for (const url of urlsToSubmit) {
      try {
        const result = await submitUrl(accessToken, url, type);
        results.push(result);
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 100));
      } catch (e) {
        results.push({ url, error: e.message });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      submitted: results.length,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Google Indexing API error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
