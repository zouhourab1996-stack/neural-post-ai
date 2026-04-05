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

const fallbackImages: Record<string, string> = {
  AI: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1200',
  Tech: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200',
  Business: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1200',
  Science: 'https://images.pexels.com/photos/256262/pexels-photo-256262.jpeg?auto=compress&cs=tinysrgb&w=1200',
};

function normalizeHeadlineKey(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 100);
}

function enhanceTitleForCTR(title: string): string {
  const clean = String(title || '').replace(/\s+/g, ' ').trim();
  if (!clean) return title;

  const hasYear = /\b20(2[5-9]|3[0-9])\b/.test(clean);
  const withYear = hasYear ? clean : `${clean} (2026)`;

  if (withYear.length <= 70) {
    return withYear;
  }

  return withYear.slice(0, 67).replace(/\s+\S*$/, '') + '...';
}

function ensureUniqueSlug(slug: string, used: Set<string>) {
  let finalSlug = slug;
  while (used.has(finalSlug)) {
    finalSlug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }
  used.add(finalSlug);
  return finalSlug;
}

function countWords(text: string): number {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

function buildMetaDescription(content: string, fallback: string): string {
  const clean = String(content || '')
    .replace(/\s+/g, ' ')
    .replace(/[#>*_`]/g, '')
    .trim();
  const base = clean || fallback || '';
  return base.slice(0, 160);
}

function appendSourcesAndRelated(
  content: string,
  source?: { title?: string; url?: string; source?: string },
  relatedLinks: { title: string; url: string }[] = [],
): string {
  const sections: string[] = [];

  if (relatedLinks.length > 0) {
    sections.push(
      '## Related Coverage',
      relatedLinks.map((link) => `- [${link.title}](${link.url})`).join('\n'),
    );
  }

  if (source?.url) {
    const label = source.source ? `${source.source}: ${source.title || 'Source'}` : (source.title || 'Source');
    sections.push('## Sources', `- [${label}](${source.url})`);
  }

  sections.push(
    '## About Prophetic',
    '- Learn more about our editorial mission: [About Prophetic](https://prophetic.pw/about/)',
    '- Transparency and standards: [Editorial Policy](https://prophetic.pw/editorial/)',
    '- Contact the team: [Contact](https://prophetic.pw/contact/)',
  );

  if (sections.length === 0) {
    return content;
  }

  return `${content.trim()}\n\n${sections.join('\n')}\n`;
}

async function fetchRelatedLinks(
  supabaseUrl: string,
  serviceRoleKey: string,
  category: string,
  excludeSlug: string,
  keywords: string[] = [],
) {
  const client = createClient(supabaseUrl, serviceRoleKey);

  // Fetch same-category articles
  const { data: sameCat } = await client
    .from('articles')
    .select('title,slug')
    .eq('category', category)
    .neq('slug', excludeSlug)
    .order('created_at', { ascending: false })
    .limit(4);

  // Fetch cross-category articles matching keywords (for topical relevance)
  let crossCat: any[] = [];
  if (keywords.length > 0) {
    const searchTerm = keywords.slice(0, 2).join(' | ');
    const { data } = await client
      .from('articles')
      .select('title,slug')
      .neq('category', category)
      .neq('slug', excludeSlug)
      .or(`title.ilike.%${keywords[0]}%,meta_description.ilike.%${keywords[0]}%`)
      .order('created_at', { ascending: false })
      .limit(2);
    crossCat = data || [];
  }

  const combined = [...(sameCat || []), ...crossCat];
  const seen = new Set<string>();

  return combined
    .filter((item: any) => {
      if (!item?.title || !item?.slug || seen.has(item.slug)) return false;
      seen.add(item.slug);
      return true;
    })
    .slice(0, 6)
    .map((item: any) => ({
      title: String(item.title).trim(),
      url: `https://prophetic.pw/article/${item.slug}/`,
    }));
}

async function selectFreshHeadline(
  headlines: { title: string; source: string; url: string; description: string }[],
  category: string,
  supabaseUrl?: string | null,
  serviceRoleKey?: string | null,
) {
  if (!supabaseUrl || !serviceRoleKey) {
    return headlines[0];
  }

  try {
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 2);

    const { data, error } = await adminClient
      .from('trending_keywords')
      .select('keyword')
      .eq('category', category)
      .gte('discovered_at', recentDate.toISOString().split('T')[0])
      .limit(100);

    if (error) {
      console.error('Failed to load recent keyword history:', error);
      return headlines[0];
    }

    const usedHeadlines = new Set((data || []).map((item: any) => normalizeHeadlineKey(item.keyword || '')));
    return headlines.find((headline) => !usedHeadlines.has(normalizeHeadlineKey(headline.title))) || headlines[0];
  } catch (error) {
    console.error('Headline freshness selection failed:', error);
    return headlines[0];
  }
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
      return data.photos[randomIndex].src.large || data.photos[randomIndex].src.medium || data.photos[randomIndex].src.original;
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

  const articlePrompt = `You are Prophetic AI, an expert in future trend forecasting and AI predictions. Today is ${currentDate}.

TRENDING TOPIC: "${headline}"
Source: ${source}
Brief: ${description}

TASK: Write a comprehensive, forward-looking prediction article analyzing this trend and forecasting what comes next. Write in fluent, natural English.

MANDATORY SEO REQUIREMENTS:
1. Primary Keyword: "${primaryKeyword}"
2. Secondary Keywords to naturally include: ${keywordList}
3. The article MUST be at least 1,800 words (this is critical!)
4. Include the primary keyword in:
   - The H1 title (55-65 characters)
   - The first paragraph (within first 100 words)
   - At least 2 H2 subheadings
   - Naturally throughout the body (no keyword stuffing)
5. Use a clear search intent: explain the current state, why it matters, and predict what comes next.
6. Meta description must be 150-160 characters, include the primary keyword, and end with a soft CTA.

FRESHNESS SIGNAL (CRITICAL):
- The article must explicitly mention that this covers developments from ${currentDate}
- Reference "today", "this week", or current month/year to signal freshness to Google
- Include a "What This Means Going Forward" section for timeliness

WRITING STYLE:
- Authoritative, intelligent, forward-looking tone - HUMAN-LIKE writing
- Write like an expert futurist and trend analyst
- Use data, statistics, and expert perspectives where relevant
- Include thought-provoking predictions backed by logical reasoning
- Break up text with bullet points, quotes, and subheadings
- Make it engaging and readable for a general audience
- Do NOT invent quotes, sources, or specific statistics
- If you mention numbers, keep them clearly framed as estimates or trends
- Add a brief "At a Glance" bullet list near the top (3-5 bullets)
- Add a "Key Terms Explained" mini-section (3-5 concise definitions)
- Add a "Practical Takeaways" section aimed at general readers
- Add a short FAQ section with 3 questions (and brief answers)
- Avoid repeating the same phrases; keep paragraphs varied

STRUCTURE (Minimum 1,800 words):
1. **Headline (H1)**: SEO-optimized, prediction-style, under 60 chars
2. **Hook/Lead**: Attention-grabbing first paragraph with keyword
3. **Current State (H2)**: What's happening now and why it matters
4. **Short-Term Predictions (H2)**: What to expect in 3-6 months
5. **Long-Term Outlook (H2)**: Predictions for 1-3 years ahead
6. **Expert Analysis (H2)**: Data-backed insights and implications
7. **Industry Impact (H2)**: How this affects the broader ${category} landscape
8. **What's Next (H2)**: Future predictions and timeline
9. **FAQ (H2)**: 3 short Q&A
10. **Key Takeaways**: Bullet-point summary

Return ONLY valid JSON:
{
  "title": "SEO-optimized prediction headline under 60 characters with keyword",
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
          content: 'You are an elite tech journalist. Write comprehensive, SEO-optimized articles that are engaging and human-like. Always respond with valid JSON. Articles must be at least 1,800 words and written in natural English.' 
        },
        { role: 'user', content: articlePrompt }
      ],
      temperature: 0.75,
      max_tokens: 8000,
      stream: false,
    }),
    signal: AbortSignal.timeout(120000),
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

async function notifyBingIndexNow(url: string) {
  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "prophetic.pw",
        key: "a0ed604574874b10b1d2245fd9eeaed8",
        keyLocation: "https://prophetic.pw/a0ed604574874b10b1d2245fd9eeaed8.txt",
        urlList: [url],
      }),
    });
    console.log(`Bing IndexNow notified for: ${url}`);
  } catch (e) { console.error("Bing IndexNow error:", e); }
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
    const selectedHeadline = await selectFreshHeadline(
      headlines,
      selectedCategory,
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
    );
    console.log(`Selected headline: ${selectedHeadline.title} (${selectedHeadline.source})`);

    // Phase 2: Discover SEO Keywords for the headline
    const { keywords } = await discoverKeywords(selectedHeadline.title, selectedCategory, DEEPSEEK_API_KEY);
    console.log(`Extracted keywords: ${keywords.map(k => k.keyword).join(', ')}`);

    // Phase 3: Generate Article using DeepSeek
    let article = await generateArticle(
      selectedHeadline.title, 
      selectedHeadline.description,
      selectedHeadline.source,
      keywords, 
      selectedCategory, 
      DEEPSEEK_API_KEY
    );

    let wordCount = countWords(article.content);
    if (wordCount < 1500) {
      console.warn(`Article too short (${wordCount}). Retrying once with expanded guidance.`);
      article = await generateArticle(
        selectedHeadline.title, 
        selectedHeadline.description,
        selectedHeadline.source,
        keywords, 
        selectedCategory, 
        DEEPSEEK_API_KEY
      );
      wordCount = countWords(article.content);
      if (wordCount < 1500) {
        throw new Error(`Generated article too short: ${wordCount} words`);
      }
    }
    
    // Phase 4: Fetch image from Pexels
    let imageUrl = null;
    if (PEXELS_API_KEY && article.image_query) {
      imageUrl = await fetchPexelsImage(article.image_query, PEXELS_API_KEY);
      console.log(`Fetched image for query "${article.image_query}": ${imageUrl ? 'Success' : 'Failed'}`);
    }

    if (!imageUrl) {
      imageUrl = fallbackImages[selectedCategory] || fallbackImages.AI;
    }

    const normalizedSlug = String(article.slug || article.title || selectedHeadline.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');

    const datedSlug = normalizedSlug.endsWith(getISODate())
      ? normalizedSlug
      : `${normalizedSlug}-${getISODate()}`;

    let finalSlug = datedSlug;
    if (autoPublish && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: existing } = await adminClient
        .from('articles')
        .select('slug')
        .eq('slug', finalSlug)
        .maybeSingle();
      if (existing?.slug) {
        finalSlug = `${finalSlug}-${Math.random().toString(36).slice(2, 6)}`;
      }
    }

    const metaDescription = buildMetaDescription(
      article.meta_description || article.content,
      selectedHeadline.description || selectedHeadline.title,
    );

    let finalContent = String(article.content || '').trim();

    if (autoPublish && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const keywordStrings = keywords.map((k: any) => k.keyword);
      const relatedLinks = await fetchRelatedLinks(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
        selectedCategory,
        finalSlug,
        keywordStrings,
      );
      finalContent = appendSourcesAndRelated(finalContent, {
        title: selectedHeadline.title,
        url: selectedHeadline.url,
        source: selectedHeadline.source,
      }, relatedLinks);
    }

    // Prepare the final article object
    const finalTitle = enhanceTitleForCTR(String(article.title || selectedHeadline.title).trim());

    const finalArticle = {
      title: finalTitle,
      slug: finalSlug,
      meta_description: metaDescription,
      content: finalContent,
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

      // Notify Bing IndexNow
      const articleUrl = `https://prophetic.pw/article/${savedArticle.slug}/`;
      await notifyBingIndexNow(articleUrl);

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
