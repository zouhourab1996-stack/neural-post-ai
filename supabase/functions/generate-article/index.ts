import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category } = await req.json();
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    const validCategories = ['AI', 'Tech', 'Business', 'Science'];
    const selectedCategory = validCategories.includes(category) ? category : 'AI';

    const prompt = `Generate a high-quality news article about ${selectedCategory}. 
Return a JSON object with these exact fields:
- title: A catchy, SEO-optimized headline (60-80 characters)
- meta_description: SEO meta description (150-160 characters)
- slug: URL-friendly slug derived from title (lowercase, hyphens)
- content: Full article in Markdown format (800-1200 words), well-structured with headers
- image_prompt: A description for generating a relevant image

Focus on current trends, innovations, and developments. Make it informative and engaging.`;

    console.log(`Generating article for category: ${selectedCategory}`);

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a professional tech journalist. Always respond with valid JSON only, no markdown code blocks.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from DeepSeek');
    }

    // Parse the JSON response
    let article;
    try {
      article = JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim());
    } catch (e) {
      console.error('Failed to parse article JSON:', content);
      throw new Error('Failed to parse article content');
    }

    // Add category and timestamps
    article.category = selectedCategory;
    article.is_featured = Math.random() > 0.7;
    article.is_trending = Math.random() > 0.6;

    console.log('Article generated successfully:', article.title);

    return new Response(JSON.stringify({ success: true, article }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating article:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
