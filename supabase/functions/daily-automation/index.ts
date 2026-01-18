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

    // Categories to generate articles for (2 articles/day, rotating)
    const categories = ['AI', 'Tech', 'Business', 'Science'];
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // Pick 2 categories based on day rotation
    const category1 = categories[dayOfYear % 4];
    const category2 = categories[(dayOfYear + 1) % 4];

    const results = [];

    // Generate first article
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

    const result1 = await response1.json();
    results.push({ category: category1, ...result1 });
    console.log(`Article 1 result: ${result1.success ? 'Success' : 'Failed'}`);

    // Wait a bit between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Generate second article
    console.log(`Generating article for category: ${category2}`);
    const response2 = await fetch(`${SUPABASE_URL}/functions/v1/generate-article`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        category: category2,
        autoPublish: true 
      }),
    });

    const result2 = await response2.json();
    results.push({ category: category2, ...result2 });
    console.log(`Article 2 result: ${result2.success ? 'Success' : 'Failed'}`);

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