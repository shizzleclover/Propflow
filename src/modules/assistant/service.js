import OpenAI from 'openai';
import { env } from '../../config/env.js';
import { Property } from '../properties/model.js';

const MAX_CANDIDATES_FETCH = 120;
const MAX_EMBED = 64;
const TOP_K = 10;

/** @param {number[]} a @param {number[]} b */
function cosineSimilarity(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom ? dot / denom : 0;
}

/** @param {string} text */
function tokenize(text) {
  const m = text.toLowerCase().match(/[a-z0-9]+/g);
  return m || [];
}

/** @param {string} query @param {string} propertyText */
function lexicalScore(query, propertyText) {
  const q = new Set(tokenize(query));
  const p = new Set(tokenize(propertyText));
  if (q.size === 0) return 0;
  let hits = 0;
  for (const w of q) {
    if (w.length < 2) continue;
    if (p.has(w)) hits += 1;
  }
  return hits / Math.sqrt(q.size * Math.max(p.size, 1));
}

/** @param {import('mongoose').LeanDocument<any>} p */
function buildPropertyDocText(p) {
  const parts = [
    p.title,
    p.description,
    p.address?.line1,
    p.address?.city,
    p.address?.state,
    p.attributes?.propertyType,
    `beds ${p.attributes?.beds ?? 0}`,
    `baths ${p.attributes?.baths ?? 0}`,
    p.listingCategory,
    String(p.price),
  ];
  return parts.filter(Boolean).join(' ');
}

/** @param {string} text */
function parseMoneyFromText(text) {
  const numbers = [];
  const re = /(?:₦|ngn|naira)?\s*([\d][\d,]*(?:\.\d+)?)\s*(k|m|b)?/gi;
  let m = re.exec(text);
  while (m !== null) {
    let n = Number.parseFloat(m[1].replace(/,/g, ''));
    if (!Number.isNaN(n)) {
      const mult = m[2]?.toLowerCase();
      if (mult === 'k') n *= 1000;
      if (mult === 'm') n *= 1_000_000;
      if (mult === 'b') n *= 1_000_000_000;
      numbers.push(n);
    }
    m = re.exec(text);
  }
  return numbers;
}

/** @param {string} s */
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** @param {string} userText */
function extractHeuristic(userText) {
  const text = userText || '';
  const lower = text.toLowerCase();
  const nums = parseMoneyFromText(text);
  let minPrice = null;
  let maxPrice = null;
  if (nums.length > 0) {
    if (/\b(under|below|max|less than|at most|up to)\b/i.test(text)) {
      maxPrice = Math.max(...nums);
    } else if (/\b(over|above|min|more than|at least|from)\b/i.test(text)) {
      minPrice = Math.min(...nums);
    } else if (nums.length >= 2) {
      minPrice = Math.min(...nums);
      maxPrice = Math.max(...nums);
    } else {
      maxPrice = nums[0];
    }
  }

  let listingCategory = null;
  if (/\b(rent|lease|rental)\b/i.test(lower)) listingCategory = 'RENT';
  else if (/\b(buy|sale|purchase)\b/i.test(lower)) listingCategory = 'SALE';

  let minBeds = null;
  let maxBeds = null;
  const bedM = lower.match(/(\d+)\s*(?:bed|bedroom|br|bd|bdrm)s?\b/);
  if (bedM) {
    const b = Number.parseInt(bedM[1], 10);
    if (!Number.isNaN(b)) {
      minBeds = b;
      if (/\b(exactly|only)\b/.test(lower)) maxBeds = b;
    }
  }

  const cities = [
    'Lagos',
    'Abuja',
    'Port Harcourt',
    'Ibadan',
    'Kano',
    'Enugu',
    'Benin',
    'Calabar',
    'Uyo',
  ];
  let city = null;
  for (const c of cities) {
    if (lower.includes(c.toLowerCase())) {
      city = c;
      break;
    }
  }

  const keywords = tokenize(text).filter((w) => w.length > 2).slice(0, 14);
  return {
    listingCategory,
    minPrice,
    maxPrice,
    minBeds,
    maxBeds,
    city,
    keywords,
    intentSummary: text.slice(0, 280).trim() || 'Property search',
  };
}

/** @param {unknown} raw */
function normalizeExtracted(raw) {
  const o = raw && typeof raw === 'object' ? raw : {};
  const lc = o.listingCategory;
  return {
    listingCategory: lc === 'SALE' || lc === 'RENT' ? lc : null,
    minPrice: typeof o.minPrice === 'number' && Number.isFinite(o.minPrice) ? o.minPrice : null,
    maxPrice: typeof o.maxPrice === 'number' && Number.isFinite(o.maxPrice) ? o.maxPrice : null,
    minBeds: typeof o.minBeds === 'number' && Number.isFinite(o.minBeds) ? o.minBeds : null,
    maxBeds: typeof o.maxBeds === 'number' && Number.isFinite(o.maxBeds) ? o.maxBeds : null,
    city: typeof o.city === 'string' && o.city.trim() ? o.city.trim() : null,
    keywords: Array.isArray(o.keywords) ? o.keywords.map(String).filter(Boolean).slice(0, 22) : [],
    intentSummary:
      typeof o.intentSummary === 'string' && o.intentSummary.trim()
        ? o.intentSummary.trim().slice(0, 400)
        : '',
  };
}

/** @param {ReturnType<typeof normalizeExtracted>} extracted */
function buildFilter(extracted) {
  /** @type {Record<string, unknown>} */
  const filter = { status: 'AVAILABLE' };
  if (extracted.listingCategory) filter.listingCategory = extracted.listingCategory;

  if (extracted.minPrice != null || extracted.maxPrice != null) {
    filter.price = {};
    if (extracted.minPrice != null) filter.price.$gte = extracted.minPrice;
    if (extracted.maxPrice != null) filter.price.$lte = extracted.maxPrice;
  }

  if (extracted.minBeds != null || extracted.maxBeds != null) {
    if (
      extracted.minBeds != null &&
      extracted.maxBeds != null &&
      extracted.minBeds === extracted.maxBeds
    ) {
      filter['attributes.beds'] = extracted.minBeds;
    } else {
      const bedq = {};
      if (extracted.minBeds != null) bedq.$gte = extracted.minBeds;
      if (extracted.maxBeds != null) bedq.$lte = extracted.maxBeds;
      if (Object.keys(bedq).length > 0) filter['attributes.beds'] = bedq;
    }
  }

  if (extracted.city) {
    filter['address.city'] = new RegExp(`^${escapeRegex(extracted.city)}$`, 'i');
  }

  return filter;
}

/** @param {Record<string, unknown>} filter */
async function fetchCandidates(filter) {
  return Property.find(filter).sort({ updatedAt: -1 }).limit(MAX_CANDIDATES_FETCH).lean();
}

/** @param {ReturnType<typeof normalizeExtracted>} extracted */
async function tryFetchWithRelaxation(extracted) {
  const strict = buildFilter(extracted);
  let rows = await fetchCandidates(strict);
  if (rows.length > 0) return { rows, relaxedFrom: 'strict' };

  const noCity = buildFilter({ ...extracted, city: null });
  rows = await fetchCandidates(noCity);
  if (rows.length > 0) return { rows, relaxedFrom: 'no_city' };

  const noPrice = buildFilter({
    ...extracted,
    city: null,
    minPrice: null,
    maxPrice: null,
  });
  rows = await fetchCandidates(noPrice);
  if (rows.length > 0) return { rows, relaxedFrom: 'no_price' };

  const broad = buildFilter({
    ...extracted,
    city: null,
    minPrice: null,
    maxPrice: null,
    minBeds: null,
    maxBeds: null,
    listingCategory: null,
  });
  rows = await fetchCandidates(broad);
  if (rows.length > 0) return { rows, relaxedFrom: 'broad' };

  return { rows: [], relaxedFrom: null };
}

/** @param {ReturnType<typeof normalizeExtracted>} extracted @param {import('mongoose').LeanDocument<any>} p */
function structuralBonus(extracted, p) {
  let bonus = 0;
  if (
    extracted.city &&
    p.address?.city &&
    new RegExp(`^${escapeRegex(extracted.city)}$`, 'i').test(String(p.address.city))
  ) {
    bonus += 0.06;
  }
  if (extracted.listingCategory && p.listingCategory === extracted.listingCategory) bonus += 0.04;
  if (extracted.minBeds != null && (p.attributes?.beds ?? 0) >= extracted.minBeds) bonus += 0.03;
  if (extracted.maxPrice != null && p.price <= extracted.maxPrice) bonus += 0.03;
  return bonus;
}

/** @param {ReturnType<typeof normalizeExtracted>} extracted @param {import('mongoose').LeanDocument<any>} p */
function buildReasons(extracted, p) {
  const reasons = [];
  if (
    extracted.city &&
    p.address?.city &&
    String(p.address.city).toLowerCase().includes(extracted.city.toLowerCase())
  ) {
    reasons.push(`Located in ${p.address.city}`);
  }
  if (extracted.listingCategory && p.listingCategory === extracted.listingCategory) {
    reasons.push(p.listingCategory === 'RENT' ? 'Rental listing' : 'For sale');
  }
  if (extracted.minBeds != null && (p.attributes?.beds ?? 0) >= extracted.minBeds) {
    reasons.push(`${p.attributes?.beds ?? 0} bedrooms`);
  }
  if (extracted.maxPrice != null && p.price <= extracted.maxPrice) {
    reasons.push('Within your stated budget');
  }
  if (reasons.length === 0) reasons.push('Close match to your message');
  return reasons.slice(0, 4);
}

/** @param {OpenAI} openai @param {{ role: string, content: string }[]} messages */
async function extractWithLLM(openai, messages) {
  const system = `You extract property search preferences from the conversation. Output ONLY valid JSON:
{
  "listingCategory": "SALE" | "RENT" | null,
  "minPrice": number | null,
  "maxPrice": number | null,
  "minBeds": number | null,
  "maxBeds": number | null,
  "city": string | null,
  "keywords": string[],
  "intentSummary": string
}
Prices are Nigerian Naira (whole numbers). "5m" means 5000000. "under 80k rent" => maxPrice 80000, listingCategory RENT.`;

  const completion = await openai.chat.completions.create({
    model: env.OPENAI_CHAT_MODEL,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      ...messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
    ],
    max_tokens: 500,
    temperature: 0.15,
  });
  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error('Empty LLM extraction');
  return JSON.parse(raw);
}

/**
 * @param {OpenAI} openai
 * @param {string} queryText
 * @param {import('mongoose').LeanDocument<any>[]} properties
 * @param {ReturnType<typeof normalizeExtracted>} extracted
 */
async function rankWithEmbeddingsFixed(openai, queryText, properties, extracted) {
  const slice = properties.slice(0, MAX_EMBED);
  const texts = [queryText, ...slice.map((p) => buildPropertyDocText(p))];
  const emb = await openai.embeddings.create({
    model: env.OPENAI_EMBEDDING_MODEL,
    input: texts,
  });
  const byIndex = new Map(emb.data.map((d) => [d.index, d.embedding]));
  const qv = byIndex.get(0);
  if (!qv) return [];
  return slice.map((property, i) => {
    const v = byIndex.get(i + 1);
    const sim = v ? cosineSimilarity(qv, v) : 0;
    const score = Math.min(1, sim + structuralBonus(extracted, property));
    return { property, score };
  });
}

/** @param {string} queryText @param {import('mongoose').LeanDocument<any>[]} properties @param {ReturnType<typeof normalizeExtracted>} extracted */
function rankLexical(queryText, properties, extracted) {
  return properties.map((property) => {
    const t = buildPropertyDocText(property);
    let score = lexicalScore(queryText, t);
    score += structuralBonus(extracted, property);
    return { property, score };
  });
}

/** @param {OpenAI} openai @param {{ role: string, content: string }[]} messages @param {{ property: any, score: number }[]} matches @param {ReturnType<typeof normalizeExtracted>} extracted */
async function composeReplyLLM(openai, messages, matches, extracted) {
  const lines = matches.slice(0, 6).map(
    (m, i) => `${i + 1}. ${m.property.title} — ₦${m.property.price.toLocaleString('en-NG')}`
  );
  const completion = await openai.chat.completions.create({
    model: env.OPENAI_CHAT_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are a concise Nigerian real estate assistant for Nexa Homes. Reply in 2–5 short sentences. Acknowledge the user, summarize the best matches, and invite them to open a listing. Do not invent properties or prices.',
      },
      ...messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
      {
        role: 'user',
        content: `Ranked matches (most relevant first):\n${lines.join('\n')}\n\nIntent summary: ${extracted.intentSummary || '(none)'}`,
      },
    ],
    max_tokens: 280,
    temperature: 0.45,
  });
  return completion.choices[0]?.message?.content?.trim() || '';
}

/** @param {{ property: any, score: number }[]} matches @param {string | null} relaxedFrom */
function composeReplyFallback(matches, relaxedFrom) {
  const n = matches.length;
  const relaxNote =
    relaxedFrom && relaxedFrom !== 'strict'
      ? ' Some filters were relaxed so you still get ideas.'
      : '';
  if (n === 0) {
    return `I could not find available listings that match closely yet. Try another city, budget, or whether you want to rent or buy.${relaxNote}`;
  }
  return `Here ${n === 1 ? 'is' : 'are'} ${n} listing${n === 1 ? '' : 's'} ranked for what you described.${relaxNote}`;
}

function mergeExtracted(llmNorm, heuristicNorm) {
  return {
    listingCategory: llmNorm.listingCategory ?? heuristicNorm.listingCategory,
    minPrice: llmNorm.minPrice ?? heuristicNorm.minPrice,
    maxPrice: llmNorm.maxPrice ?? heuristicNorm.maxPrice,
    minBeds: llmNorm.minBeds ?? heuristicNorm.minBeds,
    maxBeds: llmNorm.maxBeds ?? heuristicNorm.maxBeds,
    city: llmNorm.city ?? heuristicNorm.city,
    keywords: [...new Set([...heuristicNorm.keywords, ...llmNorm.keywords])].slice(0, 24),
    intentSummary: llmNorm.intentSummary || heuristicNorm.intentSummary,
  };
}

/**
 * @param {{ messages: { role: 'user' | 'assistant', content: string }[] }} args
 */
export async function chatAssistant({ messages }) {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const userText = lastUser?.content?.trim() || '';

  const heuristic = normalizeExtracted(extractHeuristic(userText));
  let extracted = heuristic;

  const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

  if (openai) {
    try {
      const raw = await extractWithLLM(openai, messages);
      extracted = mergeExtracted(normalizeExtracted(raw), heuristic);
    } catch {
      extracted = heuristic;
    }
  }

  const { rows, relaxedFrom } = await tryFetchWithRelaxation(extracted);

  const queryText = [
    extracted.intentSummary,
    userText,
    ...extracted.keywords,
  ]
    .filter(Boolean)
    .join(' ');

  /** @type {{ property: import('mongoose').LeanDocument<any>, score: number }[]} */
  let ranked = [];
  let usedEmbeddings = false;

  if (rows.length > 0) {
    if (openai) {
      try {
        ranked = await rankWithEmbeddingsFixed(openai, queryText, rows, extracted);
        usedEmbeddings = ranked.length > 0;
      } catch {
        ranked = rankLexical(queryText, rows, extracted);
      }
    } else {
      ranked = rankLexical(queryText, rows, extracted);
    }
    ranked.sort((a, b) => b.score - a.score);
  }

  const top = ranked.slice(0, TOP_K);
  const matches = top.map(({ property, score }) => ({
    property,
    score: Math.round(score * 1000) / 1000,
    reasons: buildReasons(extracted, property),
  }));

  let reply = composeReplyFallback(matches, relaxedFrom);
  if (openai && matches.length > 0) {
    try {
      reply = await composeReplyLLM(openai, messages, matches, extracted);
    } catch {
      /* keep fallback */
    }
  }

  const mode = usedEmbeddings ? 'hybrid_embedding' : openai ? 'llm_extract_lexical_rank' : 'lexical';

  return {
    reply,
    matches,
    extracted: {
      listingCategory: extracted.listingCategory,
      minPrice: extracted.minPrice,
      maxPrice: extracted.maxPrice,
      minBeds: extracted.minBeds,
      maxBeds: extracted.maxBeds,
      city: extracted.city,
      intentSummary: extracted.intentSummary,
    },
    meta: {
      mode,
      relaxedFrom,
      candidateCount: rows.length,
    },
  };
}
