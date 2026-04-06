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

PRIMARY KEYWORD (must appear in title, H1, first paragraph, 2+ H2s): "${primaryKeyword}"
SECONDARY KEYWORD: "${secondaryKeyword}"
ALL KEYWORDS to weave naturally: ${keywordList}

${avoidTitles ? `AVOID SIMILARITY to these recent articles:\n${avoidTitles}\n` : ''}

TASK: Write a thorough, analytical article as a veteran journalist covering ${category}. This article must rank on Google's first page for the primary keyword.

═══════════════════════════════════════
WRITING VOICE — CRITICAL (READ CAREFULLY)
═══════════════════════════════════════

You are a senior correspondent with 15+ years covering ${category}. Write EXACTLY like a human expert columnist — NOT like an AI.

BANNED WORDS (using ANY of these = article rejected):
"delve", "unleash", "testament", "landscape", "paradigm shift", "game-changer", 
"revolutionize", "cutting-edge", "groundbreaking", "in conclusion", "it's worth noting", 
"it remains to be seen", "only time will tell", "in today's rapidly evolving", 
"navigate the complexities", "at the forefront", "a tapestry of", "robust", "leverage", 
"synergy", "holistic", "comprehensive", "multifaceted", "nuanced", "realm", "pivotal",
"crucial", "essential", "transformative", "innovative", "disruptive", "seamless",
"empower", "foster", "harness", "spearhead", "underscore", "underpin", "bolster",
"facilitate", "optimize", "streamline", "elevate", "amplify", "catalyze",
"in the realm of", "it is important to note", "needless to say", "at the end of the day"

HUMAN WRITING TECHNIQUES (mandatory):
1. Sentence length variation: alternate 4-8 word punches with 25-35 word analysis
2. Start paragraphs differently: question → dependent clause → short declaration → anecdote
3. Use contractions always ("it's", "won't", "they're", "that's", "I'd")  
4. Personal voice: "What catches my eye here...", "The real story is...", "I'd bet that...", "Here's the thing most coverage misses..."
5. Concrete specifics over abstractions — name companies, cite approximate figures, reference real products
6. Occasional colloquial phrasing: "the math doesn't add up", "that's a tough sell", "let's be real"
7. Em-dashes for interruption — like this — and parenthetical asides (which add texture)
8. One or two one-sentence paragraphs for emphasis
9. Rhetorical questions that provoke thought
10. Reference the news source naturally: "According to ${source}..." or "As ${source} reported..."

═══════════════════════════════════════
SEO REQUIREMENTS — GOOGLE RANKING FOCUSED
═══════════════════════════════════════

1. TITLE (H1): 50-60 characters, includes primary keyword, compelling but NOT clickbait
2. META DESCRIPTION: 150-155 characters, includes primary keyword, ends with a reason to click
3. SLUG: URL-friendly, includes primary keyword, 4-6 words max
4. FIRST PARAGRAPH: Must contain primary keyword within first 100 words
5. H2 HEADINGS: At least 4 H2 headings, 2+ must include the primary or secondary keyword
6. KEYWORD DENSITY: Primary keyword appears 4-6 times naturally; secondary 2-3 times
7. INTERNAL LINK ANCHORS: Include 2-3 natural anchor texts for internal linking (e.g., "our analysis of [topic]", "as we covered in our [category] section")
8. WORD COUNT: Minimum 2,000 words (longer content ranks better for informational queries)
9. FRESHNESS SIGNALS: Mention today's date, "this week", "as of April 2026", "latest"
10. E-E-A-T SIGNALS: Show expertise through specific analysis, cite the original source, provide actionable insights

═══════════════════════════════════════
ARTICLE STRUCTURE (2,000+ words minimum)
═══════════════════════════════════════

1. **Headline (H1)**: Sharp, specific, includes primary keyword, under 60 chars
2. **Opening hook** (100-150 words): Drop straight into the story with a striking fact or development. Include primary keyword.
3. **Key Takeaways** (H2): 4-5 bullet points summarizing the most important points — great for featured snippets
4. **What's Happening Now** (H2, include keyword): Deep analysis of current developments with specific data points
5. **Why This Matters** (H2): Context and implications — who's affected, what changes
6. **Data & Comparison Table**: Markdown table with relevant metrics, specs, or comparisons
7. **Market/Industry Impact** (H2, include keyword): How this affects the broader ecosystem  
8. **Expert Perspective** (H2): Your analytical take — what most coverage gets wrong, contrarian angles
9. **What Comes Next** (H2): Short-term (3-6 month) and long-term (1-2 year) predictions
10. **Historical Context**: Brief comparison to similar past events — what patterns repeat
11. **Practical Implications** (H2): Actionable insights for readers — what to watch, what to do
12. **Key Terms Glossary**: 3-4 brief definitions of technical terms (good for featured snippets)
13. **FAQ** (H2): 3-4 questions people actually search for, with concise 2-3 sentence answers
14. **Final Thought**: One strong closing sentence — memorable, not a summary

IMPORTANT RULES:
- Do NOT invent quotes from unnamed sources or fabricate specific statistics
- If citing numbers, frame as "estimated", "approximately", "industry analysts suggest"
- Be honest about uncertainty — predictions should acknowledge unknowns
- No hallucinated company announcements or fake product details
- Reference the ACTUAL source headline and publication

Return ONLY valid JSON:
{
  "title": "SEO-optimized headline with primary keyword, under 60 characters",
  "meta_description": "Compelling 150-155 char description with primary keyword and click-worthy hook",
  "slug": "keyword-rich-url-slug-2026",
  "content": "Full markdown article, minimum 2000 words, following the exact structure above",
  "image_query": "2-3 word image search term for article hero image"
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
          content: `You are Marcus Chen, a veteran technology and markets correspondent who has written for Bloomberg, Reuters, and Wired over a 17-year career. Your byline appears twice weekly. Your writing style:

VOICE: Confident but not arrogant. You have strong opinions backed by analysis. You write the way you'd explain something to a smart colleague over coffee — clear, direct, occasionally witty, always substantive.

RHYTHM: You naturally mix sentence lengths. Short punches. Then longer, more complex sentences that unpack an idea across thirty or forty words before landing on a conclusion. Sometimes a question. Sometimes just a fragment for effect.

HABITS: You use contractions. You start sentences with "But" and "And" and "So." You use em-dashes — frequently — for parenthetical thoughts. You occasionally address the reader directly. You reference your own uncertainty when warranted.

WHAT YOU NEVER DO: You never write like a corporate press release. You never use buzzwords. You never pad word count with filler. You never start with "In the ever-evolving world of..." or end with "Only time will tell." You never use: delve, unleash, testament, landscape, paradigm shift, game-changer, revolutionize, cutting-edge, groundbreaking, comprehensive, multifaceted, nuanced, robust, leverage, synergy, holistic, navigate, tapestry, at the forefront, pivotal, crucial, essential, transformative, innovative, disruptive, seamless, empower, foster, harness, spearhead, underscore, underpin, bolster, facilitate, optimize, streamline, elevate, amplify, catalyze, realm.

FORMAT: Always respond with valid JSON only. Articles must be at least 2,000 words. Use proper markdown with H2 headings, bullet points, and a data table.`
        },
        { role: 'user', content: articlePrompt }
      ],
      temperature: 0.82,
      frequency_penalty: 0.5,
      presence_penalty: 0.35,
      max_tokens: 10000,
      stream: false,
    }),
    signal: AbortSignal.timeout(180000), // 3 min timeout for longer articles
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
