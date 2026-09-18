import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase configuration missing');
    }

    console.log(`[${new Date().toISOString()}] Starting daily automation...`);

    // Generate ONE article every day, rotating categories deterministically
    const categories = ['AI', 'Tech', 'Business', 'Science', 'World'];
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const category1 = categories[dayOfYear % categories.length];

    const results = [];

    console.log(`Generating article for category: ${category1}`);
    const response1 = await fetch(`${SUPABASE_URL}/functions/v1/generate-article`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        category: category1,
        autoPublish: true 
      }),
    });

    const result1 = await response1.json().catch(() => ({ success: false, error: `HTTP ${response1.status}` }));
    results.push({ category: category1, slug: result1.slug || result1.article?.slug, ...result1 });
    console.log(`Article result: ${result1.success ? 'Success' : 'Failed'}`);

    const successfulResults = results.filter((r: any) => r.success && r.slug);
    if (successfulResults.length === 0) {
      throw new Error(`No articles were generated: ${results.map((r: any) => `${r.category}: ${r.error || 'unknown error'}`).join('; ')}`);
    }

    // Clean up old keywords (keep last 7 days)
    const supabase = createClient(
      SUPABASE_URL, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || SUPABASE_ANON_KEY
    );
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    await supabase
      .from('trending_keywords')
      .delete()
      .lt('discovered_at', sevenDaysAgo.toISOString().split('T')[0]);

    // Search engines are notified only AFTER the static site is rebuilt,
    // by the post-deploy step in .github/workflows/deploy.yml. Submitting a URL
    // before the page is live makes Google report "Not found (404)".
    const newSlugs = results
      .filter((r: any) => r.success && r.slug)
      .map((r: any) => `https://prophetic.pw/article/${r.slug}/`);

    if (newSlugs.length > 0) {
      console.log(`Pending index submission after next deploy: ${newSlugs.join(', ')}`);
    }

    console.log(`[${new Date().toISOString()}] Daily automation completed`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Daily automation completed',
      results,
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Daily automation error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});