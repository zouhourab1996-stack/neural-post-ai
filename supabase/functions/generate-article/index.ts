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

// Google AI Studio (Gemini) call — returns raw text (JSON string)
const GEMINI_MODELS = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];

async function callGemini(
  apiKey: string,
  systemInstruction: string,
  userPrompt: string,
  opts: { temperature?: number; maxOutputTokens?: number; timeoutMs?: number; grounded?: boolean } = {},
): Promise<string> {
  const { temperature = 0.9, maxOutputTokens = 8192, timeoutMs = 180000, grounded = false } = opts;
  let lastError = '';

  // When grounding is enabled we try grounded first, then plain JSON mode as a fallback.
  const passes = grounded ? [true, false] : [false];

  for (const useSearch of passes) {
    for (const model of GEMINI_MODELS) {
      try {
        const generationConfig: Record<string, unknown> = {
          temperature,
          maxOutputTokens,
          thinkingConfig: { thinkingLevel: 'low' },
        };
        // responseMimeType JSON is not allowed together with the google_search tool
        if (!useSearch) generationConfig.responseMimeType = 'application/json';

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemInstruction }] },
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
              ...(useSearch ? { tools: [{ google_search: {} }] } : {}),
              generationConfig,
            }),
            signal: AbortSignal.timeout(timeoutMs),
          },
        );

        if (!res.ok) {
          lastError = `${model}${useSearch ? '+search' : ''}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`;
          console.error('Google AI error:', lastError);
          continue;
        }

        const data = await res.json();
        const text = (data.candidates?.[0]?.content?.parts || [])
          .map((p: any) => p.text || '')
          .join('')
          .trim();

        if (text) {
          if (useSearch) {
            const chunks = data.candidates?.[0]?.groundingMetadata?.groundingChunks?.length || 0;
            console.log(`Google Search grounding active (${model}), sources used: ${chunks}`);
          }
          return text;
        }
        lastError = `${model}: empty response`;
        console.error('Google AI empty response:', JSON.stringify(data).slice(0, 300));
      } catch (e) {
        lastError = `${model}: ${e instanceof Error ? e.message : 'unknown error'}`;
        console.error('Google AI request failed:', lastError);
      }
    }
    if (useSearch) console.warn('Grounded generation failed, falling back to ungrounded JSON mode.');
  }

  throw new Error(`Google AI request failed - ${lastError}`);
}

// ===== Local topic ledger (file on the function instance disk) =====
const TOPIC_LEDGER_PATH = '/tmp/published-topics.json';

async function readTopicLedger(): Promise<{ title: string; slug: string; date: string }[]> {
  try {
    const raw = await Deno.readTextFile(TOPIC_LEDGER_PATH);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function appendTopicLedger(entry: { title: string; slug: string; date: string }) {
  try {
    const current = await readTopicLedger();
    current.unshift(entry);
    await Deno.writeTextFile(TOPIC_LEDGER_PATH, JSON.stringify(current.slice(0, 200), null, 2));
    console.log(`Topic ledger updated (${current.length} entries).`);
  } catch (e) {
    console.error('Could not update topic ledger (non-critical):', e);
  }
}



// Enhanced keyword discovery with search-engine-focused SEO targeting
async function discoverKeywords(headline: string, category: string, aiApiKey: string): Promise<{
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

  const content = await callGemini(
    aiApiKey,
    'You are a search engine optimization expert who specializes in keyword research for news and prediction websites. Always respond with valid JSON only. Focus on rising, fast-growing search queries real users type on Google right now.',
    keywordPrompt,
    { temperature: 0.6, maxOutputTokens: 1200, timeoutMs: 90000 },
  );

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
  aiApiKey: string,
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

  const systemInstruction = `You are Sarah Mitchell, an award-winning technology journalist with 18 years of experience at The New York Times, Wired, and MIT Technology Review. You hold a Master's in Computer Science and a journalism degree from Columbia University. You write with authority, precision, and a human voice that readers trust and Google rewards.

You are writing in 2026. You have covered this beat for years, you remember what people got wrong in 2024 and 2025, and you write like someone who was in the room.

ABSOLUTE RULES — NEVER BREAK:
- Output ONLY valid JSON. Zero text before or after the JSON object.
- Write ONLY in English.
- Minimum 1800 words, maximum 2500 words in the content field.
- FORBIDDEN WORDS: delve, crucial, it's worth noting, in conclusion, to summarize, leverage, utilize, furthermore, moreover, paradigm, groundbreaking, revolutionary, game-changer, cutting-edge, state-of-the-art, transformative, unprecedented, it is important to note, needless to say, landscape, realm, tapestry, navigate the, unlock, harness, robust, seamless, testament, dive into, ever-evolving, in today's world, as we move forward, the future of.
- NEVER start a sentence with: Additionally, However, Therefore, Thus, Hence, Importantly, Ultimately.
- NEVER write a title shaped like "X Predictions for 2026", "The Future of X", "Top N X", or "Everything You Need to Know". Titles read like news desk headlines.
- NEVER use the same sentence rhythm twice in a row. Vary length hard: a four-word sentence next to a thirty-word one.
- NEVER write a symmetrical article: sections must differ in length, some two paragraphs, some six.
- NEVER duplicate a title from the AVOID list; if similar, rewrite the angle entirely.

RISING-TREND MANDATE:
- Cover the story while it is still climbing, not after it peaks. Pick the angle competitors have not written yet.
- Name what happens next in the next 30-90 days, with dates and conditions that can be checked.

HOW A HUMAN EXPERT WRITES (this is what Google's reviewers look for):
- Firsthand framing: "When I first tested this in January", "Two engineers I spoke with disagree on this point" — reporting texture, never fabricated named quotes from real people.
- Concrete 2024-2025 memory: reference what actually happened then and how it played out differently than expected. Compare, don't just assert.
- Admit uncertainty out loud at least twice: "The data here is thin", "I could be wrong about the timeline".
- Include one mild opinion or contrarian take the writer owns.
- Include one small, specific, unglamorous detail (a price, a latency number, a support ticket, a config flag) that only someone close to the subject would mention.
- Occasional one-sentence paragraph for emphasis. Occasional aside in parentheses.
- No section that reads like a summary of the article itself.

ARTICLE STRUCTURE — follow the order but let the shape breathe:
1. HOOK (2-3 sentences): a specific real scenario or number, not a definition.
2. CONTEXT: why this matters now, with dates, numbers, company names.
3. MAIN BODY — 4 to 6 H2 sections with real examples, data, and analysis of uneven length.
4. WHAT 2024-2025 TAUGHT US — compare today's claims with how earlier cycles actually resolved.
5. THE OTHER SIDE — honest limits, risks, counter-arguments.
6. WHAT THIS MEANS FOR YOU — practical, specific implications.
7. FAQ — 3 to 5 real search questions with 2-3 sentence direct answers.
8. CLOSING THOUGHT (2-3 sentences): an original observation, not a recap.

WRITING STYLE:
- Active voice. Paragraphs max 4 sentences.
- Specific numbers ("47%", "March 2026"), specific companies and products.
- ## for H2, **bold** for key terms first mention, one > blockquote pull quote.
- One small Technical Specification markdown table where the subject allows it.

SEO REQUIREMENTS built naturally in:
- Primary keyword in first 100 words, in one H2, and in the closing.
- 2-3 secondary keywords woven throughout.
- Title under 60 characters, specific, news-desk style.
- Meta description 140-155 characters, clickable and unique.

OUTPUT — return ONLY this exact JSON structure, nothing else:
{
  "title": "Specific compelling title under 60 characters",
  "slug": "url-friendly-slug-max-70-chars",
  "meta_description": "One sentence 140-155 chars with primary keyword",
  "content": "Full article in Markdown, min 1800 words",
  "image_query": "Specific photo description for stock search",
  "key_takeaways": ["takeaway 1","takeaway 2","takeaway 3"],
  "faq": [{"question":"Q","answer":"A"}],
  "reading_time": 9,
  "word_count": 1900
}`;

  const content = await callGemini(aiApiKey, systemInstruction, articlePrompt, {
    temperature: 0.95,
    maxOutputTokens: 32000,
    timeoutMs: 300000,
    grounded: true,
  });


  if (!content) {
    throw new Error('No content received from Google AI');
  }

  return robustJsonParse(content, 'article');
}

const INDEXNOW_KEY = "b00319baec734ccb90683521e219f02f";
const INDEXNOW_ENDPOINTS = [
  "https://www.bing.com/indexnow",
  "https://api.indexnow.org/indexnow",
];

async function notifyBingIndexNow(urls: string | string[]) {
  const urlList = Array.isArray(urls) ? urls : [urls];
  if (urlList.length === 0) return;

  const payload = JSON.stringify({
    host: "prophetic.pw",
    key: INDEXNOW_KEY,
    keyLocation: `https://prophetic.pw/${INDEXNOW_KEY}.txt`,
    urlList,
  });

  for (const endpoint of INDEXNOW_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: payload,
      });
      console.log(`IndexNow (${endpoint}): HTTP ${res.status} for ${urlList.length} URL(s)`);
      if (res.ok) return;
    } catch (e) {
      console.error(`IndexNow error (${endpoint}):`, e);
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, autoPublish = false } = await req.json();
    
    const NEWSAPI_KEY = Deno.env.get('NEWSAPI_KEY');
    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    const PEXELS_API_KEY = Deno.env.get('PEXELS_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!NEWSAPI_KEY) {
      throw new Error('NEWSAPI_KEY is not configured');
    }

    if (!GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY is not configured');
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
    const { keywords } = await discoverKeywords(selectedHeadline.title, selectedCategory, GOOGLE_AI_API_KEY);
    console.log(`Target keywords: ${keywords.map(k => k.keyword).join(', ')}`);

    // Phase 4: Get recent article titles to avoid repetition
    let existingTitles: string[] = [];
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: recent } = await adminClient
        .from('articles')
        .select('title')
        .order('created_at', { ascending: false })
        .limit(30);
      existingTitles = (recent || []).map((a: any) => a.title);
    }

    // Guard against duplicate title before spending tokens
    const headlineKey = normalizeHeadlineKey(selectedHeadline.title);
    const duplicateHeadline = existingTitles.some(t => normalizeHeadlineKey(t) === headlineKey);
    if (duplicateHeadline) {
      console.warn('Selected headline duplicates an existing title; proceeding with rewrite-only prompt.');
    }

    // Phase 5: Generate article with DeepSeek — human-quality, SEO-optimized
    let article = await generateArticle(
      selectedHeadline.title, 
      selectedHeadline.description,
      selectedHeadline.source,
      keywords, 
      selectedCategory, 
      GOOGLE_AI_API_KEY,
      existingTitles,
    );

    let wordCount = countWords(article.content);
    console.log(`First attempt: ${wordCount} words`);

    // Verify uniqueness of the generated title
    const generatedTitleKey = normalizeHeadlineKey(String(article.title || ''));
    const titleClashes = existingTitles.some(t => normalizeHeadlineKey(t) === generatedTitleKey);

    if (wordCount < 1800 || titleClashes) {
      console.warn(`Retry needed. words=${wordCount} titleClash=${titleClashes}`);
      article = await generateArticle(
        selectedHeadline.title, 
        selectedHeadline.description,
        selectedHeadline.source,
        keywords, 
        selectedCategory, 
        GOOGLE_AI_API_KEY,
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
