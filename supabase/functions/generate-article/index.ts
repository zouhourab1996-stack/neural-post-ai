import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getCurrentDate(): string {
  const now = new Date();
  return now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function getISODate(): string {
  return new Date().toISOString().split('T')[0];
}

const fallbackImages: Record<string, string> = {
  AI: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1200',
  Tech: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200',
  Business: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1200',
  Science: 'https://images.pexels.com/photos/256262/pexels-photo-256262.jpeg?auto=compress&cs=tinysrgb&w=1200',
  Markets: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=1200',
};

function normalizeHeadlineKey(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 100);
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

// Robust JSON parser — handles truncation, extra text, unescaped characters
function robustJsonParse(raw: string, context = 'json'): any {
  // 1. Remove markdown fences
  let s = raw.replace(/```json\n?|\n?```/g, '').trim();

  // 2. Direct parse
  try { return JSON.parse(s); } catch (_) {}

  // 3. Extract the largest {...} block
  const firstBrace = s.indexOf('{');
  const lastBrace = s.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const block = s.slice(firstBrace, lastBrace + 1);
    try { return JSON.parse(block); } catch (_) {}

    // 4. Fix common issues: unescaped newlines/tabs inside string values
    const fixed = block
      .replace(/([^\\])\n/g, '$1\\n')
      .replace(/([^\\])\r/g, '$1\\r')
      .replace(/([^\\])\t/g, '$1\\t');
    try { return JSON.parse(fixed); } catch (_) {}

    // 5. Last resort: extract individual fields with regex
    const titleMatch = block.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*?)"/);
    const slugMatch  = block.match(/"slug"\s*:\s*"((?:[^"\\]|\\.)*?)"/);
    const metaMatch  = block.match(/"meta_description"\s*:\s*"((?:[^"\\]|\\.)*?)"/);
    const imgMatch   = block.match(/"image_query"\s*:\s*"((?:[^"\\]|\\.)*?)"/);
    // For content, grab everything between "content": " ... " (greedy, handles escapes)
    const contentMatch = block.match(/"content"\s*:\s*"((?:[\s\S]*?))",?\s*"image_query"/);

    if (titleMatch && contentMatch) {
      console.warn(`[${context}] Used regex fallback for JSON extraction`);
      return {
        title: titleMatch[1],
        slug: slugMatch?.[1] || '',
        meta_description: metaMatch?.[1] || '',
        content: contentMatch[1].replace(/\\n/g, '\n').replace(/\\t/g, '\t'),
        image_query: imgMatch?.[1] || 'technology news',
      };
    }
  }

  console.error(`[${context}] All JSON parse attempts failed. Raw snippet:`, raw.slice(0, 300));
  throw new Error('Failed to parse article content');
}

function ensureUniqueSlug(slug: string, used: Set<string>) {
  let finalSlug = slug;
  while (used.has(finalSlug)) {
    finalSlug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }
  used.add(finalSlug);
  return finalSlug;
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

  const { data: sameCat } = await client
    .from('articles')
    .select('title,slug')
    .eq('category', category)
    .neq('slug', excludeSlug)
    .order('created_at', { ascending: false })
    .limit(4);

  let crossCat: any[] = [];
  if (keywords.length > 0) {
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
    recentDate.setDate(recentDate.getDate() - 3);

    // Check both trending_keywords AND existing article titles to avoid duplicates
    const [{ data: recentKeywords }, { data: recentArticles }] = await Promise.all([
      adminClient
        .from('trending_keywords')
        .select('keyword')
        .eq('category', category)
        .gte('discovered_at', recentDate.toISOString().split('T')[0])
        .limit(200),
      adminClient
        .from('articles')
        .select('title')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(50),
    ]);

    const usedHeadlines = new Set([
      ...(recentKeywords || []).map((item: any) => normalizeHeadlineKey(item.keyword || '')),
      ...(recentArticles || []).map((item: any) => normalizeHeadlineKey(item.title || '')),
    ]);

    // Find a headline that hasn't been covered recently
    const fresh = headlines.find((headline) => {
      const key = normalizeHeadlineKey(headline.title);
      // Check for exact match AND partial overlap (>60% word match)
      if (usedHeadlines.has(key)) return false;
      const words = key.split(' ').filter(w => w.length > 3);
      for (const used of usedHeadlines) {
        const usedWords = used.split(' ').filter((w: string) => w.length > 3);
        const overlap = words.filter(w => usedWords.includes(w)).length;
        if (words.length > 0 && overlap / words.length > 0.6) return false;
      }
      return true;
    });

    return fresh || headlines[0];
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
    const categoryMap: Record<string, string> = {
      'AI': 'technology',
      'Tech': 'technology',
      'Business': 'business',
      'Science': 'science',
      'Markets': 'business',
    };
    
    const newsCategory = categoryMap[category] || 'technology';
    
    // Fetch top headlines
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=${newsCategory}&language=en&pageSize=15&apiKey=${apiKey}`
    );

    if (!response.ok) {
      console.error('NewsAPI error:', response.status);
      return { headlines: [] };
    }

    const data = await response.json();
    
    if (data.articles && data.articles.length > 0) {
      const headlines = data.articles
        .filter((article: any) => 
          article.title && 
          article.title !== '[Removed]' &&
          article.title.length > 20 &&
          !article.title.includes('...')  // Skip truncated titles
        )
        .slice(0, 8)
        .map((article: any) => ({
          title: article.title.replace(/ - [^-]+$/, '').trim(), // Remove source suffix
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

// Enhanced keyword discovery with search-engine-focused SEO targeting
async function discoverKeywords(headline: string, category: string, apiKey: string): Promise<{
  keywords: { keyword: string; volume: string; competition: string }[];
}> {
  const currentDate = getCurrentDate();
  
  const keywordPrompt = `You are a world-class SEO strategist specializing in search engine traffic acquisition. Today is ${currentDate}.

For the trending news headline: "${headline}"
Category: ${category}

Your task: Identify 6 high-value SEO keywords that will RANK on Google and drive organic search traffic.

STRATEGY:
1. Think about what REAL USERS type into Google when searching for this topic
2. Target "informational intent" keywords (questions, "how", "what", "why", "will")
3. Include "prediction" and "forecast" variations — these match our brand "Prophetic"
4. Mix: 2 high-volume head terms + 2 medium long-tail + 2 low-competition question keywords
5. Always include the current year (2026) in at least 2 keywords
6. For Business/Markets category: include financial terms (forecast, outlook, prediction, analysis)

EXAMPLES OF GOOD KEYWORDS:
- "bitcoin price prediction 2026" (high volume, prediction-focused)
- "will AI replace programmers" (question-based, high engagement)  
- "S&P 500 forecast Q2 2026" (specific, timely, financial)
- "OpenAI GPT-5 release date" (specific, high search volume)

Return ONLY valid JSON:
{
  "keywords": [
    {"keyword": "primary keyword phrase 2026", "volume": "high", "competition": "medium"},
    {"keyword": "secondary long-tail phrase", "volume": "medium", "competition": "low"},
    {"keyword": "question-based keyword", "volume": "medium", "competition": "low"},
    {"keyword": "trending topic keyword 2026", "volume": "high", "competition": "medium"},
    {"keyword": "specific niche keyword", "volume": "low", "competition": "very-low"},
    {"keyword": "another search query users type", "volume": "medium", "competition": "low"}
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
        { role: 'system', content: 'You are a search engine optimization expert who specializes in keyword research for news and prediction websites. Always respond with valid JSON only. Focus on keywords real users actually search for on Google.' },
        { role: 'user', content: keywordPrompt }
      ],
      temperature: 0.6,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error during keyword discovery: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  try {
    const parsed = robustJsonParse(content, 'keywords');
    return { keywords: parsed.keywords || [] };
  } catch (e) {
    console.error('Failed to parse keywords:', content);
    return { keywords: [] };
  }
}

// Enhanced article generation with human-quality writing and maximum SEO
async function generateArticle(
  headline: string, 
  description: string,
  source: string,
  keywords: { keyword: string; volume: string; competition: string }[],
  category: string,
  apiKey: string,
  existingTitles: string[] = [],
): Promise<any> {
  const currentDate = getCurrentDate();
  const keywordList = keywords.map(k => k.keyword).join(', ');
  const primaryKeyword = keywords[0]?.keyword || headline.split(' ').slice(0, 3).join(' ');
  const secondaryKeyword = keywords[1]?.keyword || '';

  // Build a list of recent titles to avoid repetition
  const avoidTitles = existingTitles.slice(0, 10).map(t => `- "${t}"`).join('\n');

  const articlePrompt = `Today is ${currentDate}.

TRENDING TOPIC: "${headline}"
Source: ${source}
Brief: ${description}

PRIMARY KEYWORD: "${primaryKeyword}"
SECONDARY KEYWORD: "${secondaryKeyword}"
ALL KEYWORDS to weave naturally: ${keywordList}
CATEGORY: ${category}

${avoidTitles ? `AVOID SIMILARITY to these recent articles:\n${avoidTitles}\n` : ''}

Write a complete investigative article about this topic following every rule in your system instructions. Return ONLY the JSON object.`;

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
          content: `You are Sarah Mitchell, an award-winning technology journalist with 18 years of experience at The New York Times, Wired, and MIT Technology Review. You hold a Master's in Computer Science and a journalism degree from Columbia University. You write with authority, precision, and a human voice that readers trust and Google rewards.

ABSOLUTE RULES — NEVER BREAK:
- Output ONLY valid JSON. Zero text before or after the JSON object.
- Write ONLY in English.
- Minimum 1800 words, maximum 2500 words in the content field.
- FORBIDDEN WORDS: delve, crucial, it's worth noting, in conclusion, to summarize, leverage, utilize, furthermore, moreover, paradigm, groundbreaking, revolutionary, game-changer, cutting-edge, state-of-the-art, transformative, unprecedented, it is important to note, needless to say.
- NEVER start a sentence with: Additionally, However, Therefore, Thus, Hence, Importantly.
- NEVER write generic filler. Every sentence must earn its place.
- NEVER sound like AI. Write like a journalist who respects her readers.

ARTICLE STRUCTURE — follow this exact order:

1. HOOK (2-3 sentences): Open with a surprising fact, a specific real scenario, or a counter-intuitive angle. Never start with a definition of the topic.

2. CONTEXT (3-4 sentences): Why this matters right now. Use specific dates, numbers, company names.

3. MAIN BODY — 4 to 6 sections with H2 headers. Each section covers one specific angle with real examples, data points, and expert-level analysis. No padding.

4. THE OTHER SIDE — one honest section presenting limitations, risks, or counter-arguments. This builds reader trust.

5. EXPERT PERSPECTIVE — one section with realistic expert-level analysis. Label clearly as analysis, not direct quotes.

6. WHAT THIS MEANS FOR YOU — practical, specific implications for the reader. Actionable.

7. FAQ — 3 to 5 questions that people actually search for. Direct answers, 2-3 sentences each.

8. CLOSING THOUGHT (2-3 sentences): An original observation or forward-looking prediction. Not a summary. Make it memorable.

WRITING STYLE:
- Mix short punchy sentences with longer analytical ones for rhythm.
- Use specific numbers: write "47%" not "nearly half", write "March 2026" not "recently".
- Name specific companies, products, and real technologies.
- Use analogies to make complex concepts click for a general audience.
- Target 9th-grade readability with expert-level depth.
- Always use active voice.
- Keep paragraphs to 4 sentences maximum.
- Use ## for H2 headers, **bold** for key terms on first mention, and > blockquote for one strong pull quote per article.

SEO REQUIREMENTS — built naturally into the writing:
- Primary keyword appears in: the first 100 words, at least one H2 header, and the closing paragraph.
- 2-3 secondary keywords woven naturally throughout the body.
- Each section flows logically into the next.
- The title must be under 60 characters, specific, and include the year when relevant.
- The meta description must be 140-155 characters and make someone want to click.

OUTPUT — return ONLY this exact JSON structure, nothing else:
{
  "title": "Specific compelling title under 60 characters",
  "slug": "url-friendly-slug-max-70-chars",
  "meta_description": "One sentence 140-155 characters with primary keyword that makes people want to click",
  "content": "Full article in Markdown. ## for H2 headers. **bold** key terms. > for one pull quote. Min 1800 words.",
  "image_query": "Specific photo description for stock search, e.g. person using AI on laptop in office",
  "key_takeaways": [
    "Specific actionable takeaway",
    "Specific data point or insight",
    "Specific forward-looking point"
  ],
  "faq": [
    { "question": "Real question people search", "answer": "Direct answer in 2-3 sentences" },
    { "question": "Second real question", "answer": "Direct answer in 2-3 sentences" },
    { "question": "Third real question", "answer": "Direct answer in 2-3 sentences" }
  ],
  "reading_time": 9,
  "word_count": 1900
}`
        },
        { role: 'user', content: articlePrompt }
      ],
      temperature: 0.82,
      frequency_penalty: 0.5,
      presence_penalty: 0.35,
      max_tokens: 8000,
      stream: false,
      response_format: { type: 'json_object' }, // Force valid JSON output
    }),
    signal: AbortSignal.timeout(120000), // 2 min timeout
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

  return robustJsonParse(content, 'article');
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

    // Phase 1: Fetch Real-Time Trending Headlines from NewsAPI
    const { headlines } = await fetchNewsAPIHeadlines(selectedCategory, NEWSAPI_KEY);
    
    if (headlines.length === 0) {
      throw new Error('No headlines found from NewsAPI');
    }

    console.log(`Found ${headlines.length} candidate headlines`);

    // Phase 2: Select a fresh headline (not covered recently)
    const selectedHeadline = await selectFreshHeadline(
      headlines,
      selectedCategory,
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
    );
    console.log(`Selected headline: ${selectedHeadline.title} (${selectedHeadline.source})`);

    // Phase 3: Discover high-value SEO keywords for this headline
    const { keywords } = await discoverKeywords(selectedHeadline.title, selectedCategory, DEEPSEEK_API_KEY);
    console.log(`Target keywords: ${keywords.map(k => k.keyword).join(', ')}`);

    // Phase 4: Get recent article titles to avoid repetition
    let existingTitles: string[] = [];
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: recent } = await adminClient
        .from('articles')
        .select('title')
        .order('created_at', { ascending: false })
        .limit(15);
      existingTitles = (recent || []).map((a: any) => a.title);
    }

    // Phase 5: Generate article with DeepSeek — human-quality, SEO-optimized
    let article = await generateArticle(
      selectedHeadline.title, 
      selectedHeadline.description,
      selectedHeadline.source,
      keywords, 
      selectedCategory, 
      DEEPSEEK_API_KEY,
      existingTitles,
    );

    let wordCount = countWords(article.content);
    console.log(`First attempt: ${wordCount} words`);

    if (wordCount < 1800) {
      console.warn(`Article too short (${wordCount}). Retrying with expanded guidance.`);
      article = await generateArticle(
        selectedHeadline.title, 
        selectedHeadline.description,
        selectedHeadline.source,
        keywords, 
        selectedCategory, 
        DEEPSEEK_API_KEY,
        existingTitles,
      );
      wordCount = countWords(article.content);
      console.log(`Retry: ${wordCount} words`);
      if (wordCount < 1500) {
        throw new Error(`Generated article too short: ${wordCount} words`);
      }
    }
    
    // Phase 6: Fetch image from Pexels
    let imageUrl = null;
    if (PEXELS_API_KEY && article.image_query) {
      imageUrl = await fetchPexelsImage(article.image_query, PEXELS_API_KEY);
      console.log(`Image for "${article.image_query}": ${imageUrl ? 'Success' : 'Fallback'}`);
    }

    if (!imageUrl) {
      imageUrl = fallbackImages[selectedCategory] || fallbackImages.AI;
    }

    // Phase 7: Build final slug with date stamp
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

    // Phase 8: Add internal links and source attribution
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

    // Phase 9: Auto-publish if requested
    if (autoPublish && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

      console.log(`✅ Published: "${savedArticle.title}" (${wordCount} words)`);

      // Notify Bing IndexNow
      const articleUrl = `https://prophetic.pw/article/${savedArticle.slug}/`;
      await notifyBingIndexNow(articleUrl);

      return new Response(JSON.stringify({ 
        success: true, 
        article: savedArticle,
        keywords: keywordsToSave,
        headline: selectedHeadline,
        allHeadlines: headlines,
        published: true,
        wordCount,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      article: finalArticle,
      keywords,
      headline: selectedHeadline,
      allHeadlines: headlines,
      published: false,
      wordCount,
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
