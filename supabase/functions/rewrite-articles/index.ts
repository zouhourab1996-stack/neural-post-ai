import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_MODELS = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];

const INDEXNOW_KEY = 'b00319baec734ccb90683521e219f02f';

async function notifyIndexNow(urlList: string[]) {
  if (urlList.length === 0) return;
  const payload = JSON.stringify({
    host: 'prophetic.pw',
    key: INDEXNOW_KEY,
    keyLocation: `https://prophetic.pw/${INDEXNOW_KEY}.txt`,
    urlList,
  });
  for (const endpoint of ['https://www.bing.com/indexnow', 'https://api.indexnow.org/indexnow']) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: payload,
      });
      console.log(`IndexNow (${endpoint}): HTTP ${res.status}`);
      if (res.ok) return;
    } catch (e) {
      console.error('IndexNow error:', e);
    }
  }
}

async function callGemini(apiKey: string, systemInstruction: string, userPrompt: string): Promise<string> {
  let lastError = '';
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: {
              temperature: 0.95,
              maxOutputTokens: 32000,
              responseMimeType: 'application/json',
              thinkingConfig: { thinkingLevel: 'low' },
            },
          }),
          signal: AbortSignal.timeout(240000),
        },
      );
      if (!res.ok) {
        lastError = `${model}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`;
        console.error('Google AI error:', lastError);
        continue;
      }
      const data = await res.json();
      const text = (data.candidates?.[0]?.content?.parts || [])
        .map((p: any) => p.text || '')
        .join('')
        .trim();
      if (text) return text;
      lastError = `${model}: empty response`;
    } catch (e) {
      lastError = `${model}: ${e instanceof Error ? e.message : 'unknown'}`;
      console.error('Google AI request failed:', lastError);
    }
  }
  throw new Error(`Google AI request failed - ${lastError}`);
}

function parseJson(raw: string): any {
  const cleaned = raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error('Could not parse AI JSON response');
  }
}

const SYSTEM_INSTRUCTION = `You are Sarah Mitchell, an award-winning technology journalist with 18 years at The New York Times, Wired, and MIT Technology Review. You are rewriting an existing article so it reads unmistakably like human expert reporting, written in 2026.

ABSOLUTE RULES — NEVER BREAK:
- Output ONLY valid JSON. Zero text before or after the JSON object.
- Write ONLY in English.
- Keep the same topic, the same core facts, and the same overall subject matter. Do not invent new events or fake named quotes from real people.
- Minimum 1800 words, maximum 2600 words in the content field.
- FORBIDDEN WORDS: delve, crucial, it's worth noting, in conclusion, to summarize, leverage, utilize, furthermore, moreover, paradigm, groundbreaking, revolutionary, game-changer, cutting-edge, state-of-the-art, transformative, unprecedented, it is important to note, needless to say, landscape, realm, tapestry, navigate the, unlock, harness, robust, seamless, testament, dive into, ever-evolving, in today's world, as we move forward, the future of.
- NEVER start a sentence with: Additionally, However, Therefore, Thus, Hence, Importantly, Ultimately.
- NEVER use the same sentence rhythm twice in a row. Vary length hard: a four-word sentence next to a thirty-word one.
- NEVER write a symmetrical article: sections must differ in length, some two paragraphs, some six.

HOW A HUMAN EXPERT WRITES:
- Reporting texture: "When I first tested this in January", "Two engineers I spoke with disagree here".
- Concrete 2024-2025 memory: compare what actually happened then with how it was expected to play out.
- Admit uncertainty out loud at least twice.
- Include one mild opinion or contrarian take the writer owns.
- Include one small unglamorous specific (a price, a latency number, a config flag).
- Occasional one-sentence paragraph. Occasional aside in parentheses.
- Active voice. Paragraphs max 4 sentences. Passive voice under 10%.

STRUCTURE (let the shape breathe):
1. HOOK (2-3 sentences): a specific scenario or number, not a definition.
2. CONTEXT with dates, numbers, company names.
3. 4-6 H2 sections of uneven length with real examples and analysis.
4. WHAT 2024-2025 TAUGHT US.
5. THE OTHER SIDE — honest limits, risks, counter-arguments.
6. WHAT THIS MEANS FOR YOU — practical and specific.
7. FAQ — 3 to 5 real search questions with 2-3 sentence answers.
8. CLOSING THOUGHT — an original observation, not a recap.

FORMATTING: Markdown. ## for H2, ### for H3, **bold** on first mention of key terms, one > blockquote pull quote, one comparison or Technical Specification markdown table, short scannable lists where they help.

SEO: keep the primary keyword of the original title in the first 100 words, in one H2, and near the closing. Meta description 140-155 characters, unique and clickable.

OUTPUT — return ONLY this JSON object:
{
  "title": "Improved news-desk style title under 65 characters, same topic",
  "meta_description": "140-155 characters, unique",
  "content": "Full rewritten article in Markdown, min 1800 words"
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(Number(body.limit) || 3, 1), 5);
    const slug: string | undefined = body.slug;

    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    if (!GOOGLE_AI_API_KEY) throw new Error('GOOGLE_AI_API_KEY is not configured');

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    let query = supabase
      .from('articles')
      .select('id, title, slug, category, content, meta_description')
      .order('created_at', { ascending: true })
      .limit(limit);

    if (slug) {
      query = supabase
        .from('articles')
        .select('id, title, slug, category, content, meta_description')
        .eq('slug', slug)
        .limit(1);
    } else {
      query = query.is('humanized_at', null);
    }

    const { data: articles, error } = await query;
    if (error) throw error;

    if (!articles || articles.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No articles left to rewrite', processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results: any[] = [];
    const rewrittenUrls: string[] = [];

    for (const article of articles) {
      try {
        const userPrompt = `Rewrite the article below so it reads like human expert reporting, following every rule in your instructions.

ORIGINAL TITLE: ${article.title}
CATEGORY: ${article.category}
URL SLUG (do not change the topic): ${article.slug}

ORIGINAL ARTICLE (Markdown):
"""
${String(article.content || '').slice(0, 24000)}
"""

Return ONLY the JSON object.`;

        const raw = await callGemini(GOOGLE_AI_API_KEY, SYSTEM_INSTRUCTION, userPrompt);
        const parsed = parseJson(raw);

        if (!parsed.content || String(parsed.content).split(/\s+/).length < 900) {
          throw new Error('Rewritten content too short');
        }

        const { error: updateError } = await supabase
          .from('articles')
          .update({
            title: String(parsed.title || article.title).slice(0, 120),
            meta_description: String(parsed.meta_description || article.meta_description).slice(0, 160),
            content: parsed.content,
            humanized_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', article.id);

        if (updateError) throw updateError;

        rewrittenUrls.push(`https://prophetic.pw/article/${article.slug}/`);
        results.push({ slug: article.slug, success: true });
        console.log(`Rewritten: ${article.slug}`);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error(`Rewrite failed for ${article.slug}:`, message);
        results.push({ slug: article.slug, success: false, error: message });
      }
    }

    await notifyIndexNow(rewrittenUrls);

    return new Response(JSON.stringify({
      success: true,
      processed: results.filter(r => r.success).length,
      results,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('rewrite-articles error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
