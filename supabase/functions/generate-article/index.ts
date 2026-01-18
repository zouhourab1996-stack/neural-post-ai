import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get current date formatted
function getCurrentDate(): string {
  const now = new Date();
  return now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Get ISO date for database
function getISODate(): string {
  return new Date().toISOString().split('T')[0];
}

// Fetch image from Pexels API
async function fetchPexelsImage(query: string, apiKey: string): Promise<string | null> {
  try {
    const searchQuery = encodeURIComponent(query.slice(0, 100));
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${searchQuery}&per_page=5&orientation=landscape`,
      {
        headers: { 'Authorization': apiKey }
      }
    );

    if (!response.ok) {
      console.error('Pexels API error:', response.status);
      return null;
    }

    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      // Get a random image from top 5 results for variety
      const randomIndex = Math.floor(Math.random() * Math.min(5, data.photos.length));
      return data.photos[randomIndex].src.large2x || data.photos[randomIndex].src.large;
    }
    return null;
  } catch (error) {
    console.error('Error fetching Pexels image:', error);
    return null;
  }
}

// Discover trending topics using DeepSeek
async function discoverTrends(category: string, apiKey: string): Promise<{
  trends: string[];
  keywords: { keyword: string; volume: string; competition: string }[];
}> {
  const currentDate = getCurrentDate();
  
  const trendPrompt = `You are an expert SEO analyst and tech journalist. Today is ${currentDate}.

For the category "${category}", identify:

1. TOP 2 TRENDING TOPICS: What are the most newsworthy and trending topics in ${category} right now? Focus on:
   - Breaking news and recent announcements (last 24-48 hours)
   - Viral discussions on tech forums and social media
   - Major company announcements, product launches, or research breakthroughs
   - Emerging technologies gaining sudden attention

2. SEO KEYWORDS: For each trend, identify 3-4 high-value SEO keywords that:
   - Have high search volume potential
   - Have relatively low competition (long-tail keywords)
   - Are specific enough to rank for
   - Include the current year (2025/2026) where relevant

Return ONLY valid JSON in this exact format:
{
  "trends": ["Trend Topic 1 - specific and newsworthy", "Trend Topic 2 - specific and newsworthy"],
  "keywords": [
    {"keyword": "primary keyword phrase 2026", "volume": "high", "competition": "low"},
    {"keyword": "secondary keyword phrase", "volume": "medium", "competition": "low"},
    {"keyword": "long-tail keyword phrase", "volume": "medium", "competition": "very-low"},
    {"keyword": "another relevant keyword 2026", "volume": "high", "competition": "medium"}
  ]
}`;

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are an SEO expert and tech trend analyst. Always respond with valid JSON only.' },
        { role: 'user', content: trendPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error during trend discovery: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  try {
    const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim());
    return {
      trends: parsed.trends || [],
      keywords: parsed.keywords || []
    };
  } catch (e) {
    console.error('Failed to parse trends:', content);
    return { trends: [`Latest ${category} developments`], keywords: [] };
  }
}

// Generate the full article with SEO optimization
async function generateArticle(
  trend: string, 
  keywords: { keyword: string; volume: string; competition: string }[],
  category: string,
  apiKey: string
): Promise<any> {
  const currentDate = getCurrentDate();
  const keywordList = keywords.map(k => k.keyword).join(', ');
  const primaryKeyword = keywords[0]?.keyword || trend;

  const articlePrompt = `You are a senior tech journalist at a publication like TechCrunch or The Verge. Today is ${currentDate}.

TASK: Write a comprehensive, in-depth article about: "${trend}"

MANDATORY SEO REQUIREMENTS:
1. Primary Keyword: "${primaryKeyword}"
2. Secondary Keywords to naturally include: ${keywordList}
3. The article MUST be at least 1,500 words (this is critical!)
4. Include the primary keyword in:
   - The H1 title (first 60 characters)
   - The first paragraph (within first 100 words)
   - At least 2 H2 subheadings
   - Naturally throughout the body (density: 1-2%)

FRESHNESS SIGNAL (CRITICAL):
- The article must explicitly mention that this covers developments from ${currentDate}
- Reference "today", "this week", or "January 2026" to signal freshness to Google
- Include a "What This Means Going Forward" section for timeliness

WRITING STYLE:
- Analytical, authoritative, and engaging tone
- Write like a top-tier tech journalist (TechCrunch/The Verge style)
- Use data, statistics, and expert perspectives where relevant
- Include thought-provoking analysis, not just news regurgitation
- Break up text with bullet points, quotes, and subheadings

STRUCTURE (Minimum 1,500 words):
1. **Headline (H1)**: SEO-optimized, includes primary keyword, under 60 chars
2. **Hook/Lead**: Attention-grabbing first paragraph with keyword
3. **Context Section (H2)**: Background and why this matters now
4. **Deep Dive (H2)**: The core story with details, data, quotes
5. **Analysis Section (H2)**: Expert analysis and implications
6. **Industry Impact (H2)**: How this affects the broader ${category} landscape
7. **What's Next (H2)**: Future predictions and timeline
8. **Key Takeaways**: Bullet-point summary

Return ONLY valid JSON:
{
  "title": "SEO-optimized headline under 60 characters with keyword",
  "meta_description": "Compelling meta description 150-160 chars with keyword and CTA",
  "slug": "url-friendly-slug-with-keyword",
  "content": "Full markdown article, minimum 1500 words, well-structured",
  "image_query": "2-3 word search term for finding a relevant high-quality image"
}`;

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system', 
          content: 'You are an elite tech journalist. Write comprehensive, SEO-optimized articles. Always respond with valid JSON. Articles must be at least 1,500 words.' 
        },
        { role: 'user', content: articlePrompt }
      ],
      temperature: 0.75,
      max_tokens: 4000,
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

  try {
    return JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim());
  } catch (e) {
    console.error('Failed to parse article JSON:', content);
    throw new Error('Failed to parse article content');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, autoPublish = false } = await req.json();
    
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
    const PEXELS_API_KEY = Deno.env.get('PEXELS_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    const validCategories = ['AI', 'Tech', 'Business', 'Science'];
    const selectedCategory = validCategories.includes(category) ? category : 'AI';

    console.log(`[${new Date().toISOString()}] Starting trend discovery for: ${selectedCategory}`);

    // Phase 1: Discover Trends
    const { trends, keywords } = await discoverTrends(selectedCategory, DEEPSEEK_API_KEY);
    console.log(`Discovered trends: ${trends.join(', ')}`);
    console.log(`Extracted keywords: ${keywords.map(k => k.keyword).join(', ')}`);

    // Phase 2: Generate Article for first trend
    const selectedTrend = trends[0] || `Latest ${selectedCategory} News`;
    const article = await generateArticle(selectedTrend, keywords, selectedCategory, DEEPSEEK_API_KEY);
    
    // Phase 3: Fetch image from Pexels
    let imageUrl = null;
    if (PEXELS_API_KEY && article.image_query) {
      imageUrl = await fetchPexelsImage(article.image_query, PEXELS_API_KEY);
      console.log(`Fetched image for query "${article.image_query}": ${imageUrl ? 'Success' : 'Failed'}`);
    }

    // Prepare the final article object
    const finalArticle = {
      title: article.title,
      slug: article.slug + '-' + getISODate(),
      meta_description: article.meta_description,
      content: article.content,
      category: selectedCategory,
      image_url: imageUrl,
      is_featured: Math.random() > 0.5,
      is_trending: true,
    };

    // Phase 4: Auto-publish if requested
    if (autoPublish && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Save article
      const { data: savedArticle, error: articleError } = await supabase
        .from('articles')
        .insert(finalArticle)
        .select()
        .single();

      if (articleError) {
        console.error('Error saving article:', articleError);
        throw new Error(`Failed to save article: ${articleError.message}`);
      }

      // Save keywords
      const keywordsToSave = keywords.map(k => ({
        keyword: k.keyword,
        category: selectedCategory,
        search_volume: k.volume,
        competition: k.competition,
        discovered_at: getISODate(),
      }));

      const { error: keywordsError } = await supabase
        .from('trending_keywords')
        .insert(keywordsToSave);

      if (keywordsError) {
        console.error('Error saving keywords:', keywordsError);
      }

      console.log(`Article published: ${savedArticle.title}`);

      return new Response(JSON.stringify({ 
        success: true, 
        article: savedArticle,
        keywords: keywordsToSave,
        trend: selectedTrend,
        published: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return without publishing
    return new Response(JSON.stringify({ 
      success: true, 
      article: finalArticle,
      keywords,
      trend: selectedTrend,
      published: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-article:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});