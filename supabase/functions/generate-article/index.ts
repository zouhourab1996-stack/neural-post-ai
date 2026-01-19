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

// Fetch trending headlines from NewsAPI
async function fetchNewsAPIHeadlines(category: string, apiKey: string): Promise<{
  headlines: { title: string; source: string; url: string; description: string }[];
}> {
  try {
    // Map our categories to NewsAPI categories
    const categoryMap: Record<string, string> = {
      'AI': 'technology',
      'Tech': 'technology',
      'Business': 'business',
      'Science': 'science'
    };
    
    const newsCategory = categoryMap[category] || 'technology';
    
    // Fetch top headlines from NewsAPI
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=${newsCategory}&language=en&pageSize=10&apiKey=${apiKey}`
    );

    if (!response.ok) {
      console.error('NewsAPI error:', response.status);
      return { headlines: [] };
    }

    const data = await response.json();
    
    if (data.articles && data.articles.length > 0) {
      // Filter and map headlines
      const headlines = data.articles
        .filter((article: any) => article.title && article.title !== '[Removed]')
        .slice(0, 5)
        .map((article: any) => ({
          title: article.title,
          source: article.source?.name || 'Unknown',
          url: article.url || '',
          description: article.description || ''
        }));
      
      console.log(`Fetched ${headlines.length} headlines from NewsAPI for ${category}`);
      return { headlines };
    }
    
    return { headlines: [] };
  } catch (error) {
    console.error('Error fetching NewsAPI headlines:', error);
    return { headlines: [] };
  }
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
      const randomIndex = Math.floor(Math.random() * Math.min(5, data.photos.length));
      return data.photos[randomIndex].src.large2x || data.photos[randomIndex].src.large;
    }
    return null;
  } catch (error) {
    console.error('Error fetching Pexels image:', error);
    return null;
  }
}

// Discover SEO keywords using DeepSeek based on headline
async function discoverKeywords(headline: string, category: string, apiKey: string): Promise<{
  keywords: { keyword: string; volume: string; competition: string }[];
}> {
  const currentDate = getCurrentDate();
  
  const keywordPrompt = `You are an expert SEO analyst. Today is ${currentDate}.

For the news headline: "${headline}"
Category: ${category}

Identify 4-5 high-value SEO keywords that:
- Have high search volume potential
- Have relatively low competition (long-tail keywords)
- Are specific enough to rank for
- Include the current year (2025/2026) where relevant
- Relate directly to the headline topic

Return ONLY valid JSON in this exact format:
{
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
        { role: 'system', content: 'You are an SEO expert. Always respond with valid JSON only.' },
        { role: 'user', content: keywordPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error during keyword discovery: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  try {
    const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim());
    return { keywords: parsed.keywords || [] };
  } catch (e) {
    console.error('Failed to parse keywords:', content);
    return { keywords: [] };
  }
}

// Generate the full article with SEO optimization using DeepSeek
async function generateArticle(
  headline: string, 
  description: string,
  source: string,
  keywords: { keyword: string; volume: string; competition: string }[],
  category: string,
  apiKey: string
): Promise<any> {
  const currentDate = getCurrentDate();
  const keywordList = keywords.map(k => k.keyword).join(', ');
  const primaryKeyword = keywords[0]?.keyword || headline.split(' ').slice(0, 3).join(' ');

  const articlePrompt = `You are a senior tech journalist at a publication like TechCrunch or The Verge. Today is ${currentDate}.

BREAKING NEWS HEADLINE: "${headline}"
Source: ${source}
Brief: ${description}

TASK: Write a comprehensive, in-depth analytical article about this breaking news.

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
- Analytical, authoritative, and engaging tone - HUMAN-LIKE writing
- Write like a top-tier tech journalist (TechCrunch/The Verge style)
- Use data, statistics, and expert perspectives where relevant
- Include thought-provoking analysis, not just news regurgitation
- Break up text with bullet points, quotes, and subheadings
- Make it engaging and readable for a general audience

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
          content: 'You are an elite tech journalist. Write comprehensive, SEO-optimized articles that are engaging and human-like. Always respond with valid JSON. Articles must be at least 1,500 words.' 
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
    
    const NEWSAPI_KEY = Deno.env.get('NEWSAPI_KEY');
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
    const PEXELS_API_KEY = Deno.env.get('PEXELS_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!NEWSAPI_KEY) {
      throw new Error('NEWSAPI_KEY is not configured');
    }
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    const validCategories = ['AI', 'Tech', 'Business', 'Science'];
    const selectedCategory = validCategories.includes(category) ? category : 'AI';

    console.log(`[${new Date().toISOString()}] Starting article generation for: ${selectedCategory}`);

    // Phase 1: Fetch Real-Time Headlines from NewsAPI
    const { headlines } = await fetchNewsAPIHeadlines(selectedCategory, NEWSAPI_KEY);
    
    if (headlines.length === 0) {
      throw new Error('No headlines found from NewsAPI');
    }

    // Pick the top headline for article generation
    const selectedHeadline = headlines[0];
    console.log(`Selected headline: ${selectedHeadline.title} (${selectedHeadline.source})`);

    // Phase 2: Discover SEO Keywords for the headline
    const { keywords } = await discoverKeywords(selectedHeadline.title, selectedCategory, DEEPSEEK_API_KEY);
    console.log(`Extracted keywords: ${keywords.map(k => k.keyword).join(', ')}`);

    // Phase 3: Generate Article using DeepSeek
    const article = await generateArticle(
      selectedHeadline.title, 
      selectedHeadline.description,
      selectedHeadline.source,
      keywords, 
      selectedCategory, 
      DEEPSEEK_API_KEY
    );
    
    // Phase 4: Fetch image from Pexels
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

    // Phase 5: Auto-publish if requested
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

      // Save keywords with headline info
      const keywordsToSave = keywords.map(k => ({
        keyword: k.keyword,
        category: selectedCategory,
        search_volume: k.volume,
        competition: k.competition,
        discovered_at: getISODate(),
      }));

      // Also save the original headline as a keyword for trending display
      keywordsToSave.push({
        keyword: selectedHeadline.title.slice(0, 100),
        category: selectedCategory,
        search_volume: 'high',
        competition: 'low',
        discovered_at: getISODate(),
      });

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
        headline: selectedHeadline,
        allHeadlines: headlines,
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
      headline: selectedHeadline,
      allHeadlines: headlines,
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
