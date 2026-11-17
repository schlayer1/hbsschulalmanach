import { LegalChunk, SearchResult, CustomDocument } from '../types/almanach';
import { getLoadedCorpusSync, LoadedCorpus } from './corpusLoader';

const EMBEDDING_DIM = 768;
const queryEmbeddingCache = new Map<string, Float32Array>();

const STOPWORDS = new Set([
  'und', 'oder', 'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'einer',
  'mit', 'bei', 'was', 'darf', 'wie', 'für', 'von', 'vom', 'ich', 'wir', 'man', 'sich', 'auf', 'aus',
  'zu', 'zum', 'zur', 'im', 'in', 'an', 'am', 'als', 'auch', 'ist', 'sind', 'wird', 'werden', 'kann',
  'muss', 'müssen', 'soll', 'sollen', 'wenn', 'wann', 'welche', 'welcher', 'welches', 'sofort', 'tun',
  'machen', 'gibt', 'nach', 'über', 'unter', 'vor', 'andere', 'anderen', 'anderer', 'regelung', 'regelungen',
]);

const GENERIC_SCHOOL_WORDS = new Set([
  'schüler', 'schülerin', 'schülerinnen', 'schule', 'schulen', 'lehrer', 'lehrkraft', 'lehrkräfte',
  'unterricht', 'klasse', 'klassen', 'regelschule', 'thüringen', 'thüringer', 'heimbürgeschule',
]);

// Nur für den Offline-/Quota-Fallback aktiv, wenn /api/embed keinen Vektor liefert:
const OFFLINE_SYNONYM_HINTS: Array<[RegExp, string[]]> = [
  [/schläg|prügel|tätlich|angriff|gewalt|rauferei|schlägerei|bedroh|verletz|waffe|messer/i, ['ordnungsmaßnahme', 'gewalt', '§ 51', 'pädagogische', 'aufsicht', 'schulfrieden', 'hausrecht']],
  [/suspendier|ausschließ|ausschluss|verweis|tadel|stör/i, ['ordnungsmaßnahme', '§ 51', 'unterrichtsausschluss', 'schriftlicher']],
  [/handy|smartphone|tablet|ipad|foto|video|whatsapp|messenger/i, ['datenschutz', 'einwilligung', 'handy', 'ranzen', 'endgeräte']],
  [/klassenfahrt|wandertag|ausflug|freiplatz|bus|baden|schwimmen/i, ['wandertage', 'klassenfahrten', 'freiplatz', 'aufsicht', 'dienstreise']],
  [/lrs|legasthenie|dyskalkulie|nachteilsausgleich|notenschutz|zeitzugabe/i, ['nachteilsausgleich', 'notenschutz', 'rechtschreibung', 'zeugnisvermerk']],
  [/medikament|asthma|allergie|diabetes|insulin|epipen|adrenalin|unfall|verletz/i, ['medikamentengabe', 'notfallmedikation', 'unfall', 'verbandbuch', 'ukt']],
  [/gefahrstoff|chemikalie|schutzbrille|labor|abzug|laser|werken/i, ['risu', 'degintu', 'schutzbrille', 'gefahrstoff', 'sicherheit']],
  [/schwänz|unentschuldigt|schuldistanz|fehlt|fehlzeit/i, ['schuldistanz', 'schulpflicht', 'schulzwang', 'fehlzeiten']],
  [/geschenk|blumen|gutschein|praline|schokolade/i, ['geschenke', 'belohnungen', 'korruption', 'wertgrenze']],
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[§.,;:/\\()\-–—_'"!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeVectorF32(values: number[]): Float32Array {
  const vec = new Float32Array(values.length);
  let normSq = 0;
  for (let i = 0; i < values.length; i++) {
    vec[i] = values[i];
    normSq += values[i] * values[i];
  }
  const norm = Math.sqrt(normSq);
  if (norm > 0) {
    for (let i = 0; i < vec.length; i++) {
      vec[i] /= norm;
    }
  }
  return vec;
}

export function cosineSimilarity(vecA: ArrayLike<number>, vecB: ArrayLike<number>): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function dotProductAtOffset(queryVec: Float32Array, flatVectors: Float32Array, chunkIndex: number): number {
  const offset = chunkIndex * EMBEDDING_DIM;
  let dot = 0;
  for (let d = 0; d < EMBEDDING_DIM; d++) {
    dot += queryVec[d] * flatVectors[offset + d];
  }
  return dot;
}

/**
 * Erzeugt einen echten 768-dimensionalen Query-Vektor via /api/embed (gemini-embedding-001).
 * Bei Offline-Betrieb oder Proxy-Fehler wird sauber null zurückgegeben (Fallback auf Hybrid-Keyword-Suche).
 */
export async function fetchQueryEmbedding(query: string, userApiKey?: string): Promise<Float32Array | null> {
  const clean = query.trim();
  if (clean.length < 2) return null;

  const cacheKey = `${clean.toLowerCase()}::${userApiKey || ''}`;
  const cached = queryEmbeddingCache.get(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch('/api/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(9000),
      body: JSON.stringify({
        text: clean,
        apiKey: userApiKey || 'serverless-proxy',
        taskType: 'RETRIEVAL_QUERY',
        outputDimensionality: EMBEDDING_DIM,
      }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const values: unknown = data?.embedding;
    if (!Array.isArray(values) || values.length !== EMBEDDING_DIM) {
      return null;
    }

    const normalized = normalizeVectorF32(values as number[]);
    queryEmbeddingCache.set(cacheKey, normalized);
    return normalized;
  } catch {
    return null;
  }
}

// Konvertiert schulinterne CustomDocuments in durchsuchbare LegalChunks
export function customDocsToChunks(customDocs: CustomDocument[]): LegalChunk[] {
  return customDocs.map((doc) => {
    const tags = doc.tags || ['Schulintern', 'HBS'];
    return {
      id: `custom-chunk-${doc.id}`,
      docId: doc.id,
      docShortTitle: doc.shortTitle || doc.title,
      category: doc.category,
      paragraph: `Schulintern: ${doc.shortTitle}`,
      sectionTitle: doc.title,
      text: doc.content,
      summary: doc.summary || doc.content.slice(0, 200) + '...',
      keyTakeaways: [
        `Schulinterne Regelung der Heimbürgeschule`,
        `Hinterlegt im Schulpflegebereich am ${new Date(doc.uploadedAt).toLocaleDateString('de-DE')}`,
      ],
      officialAnchorUrl: '#custom-doc-' + doc.id,
      tags,
    };
  });
}

// Hybrid Search: Echte gemini-embedding-001 Vektor-Suche + exaktes Paragraphen-Matching + Keyword-Boost
export function searchCorpus(
  query: string,
  options?: {
    categoryFilter?: string;
    customChunks?: LegalChunk[];
    queryEmbedding?: Float32Array | number[] | null;
    corpus?: LoadedCorpus;
    limit?: number;
  }
): SearchResult[] {
  const { categoryFilter, customChunks = [], queryEmbedding, corpus, limit = 10 } = options || {};

  if (!query || query.trim().length === 0) {
    return [];
  }

  const activeCorpus = corpus || getLoadedCorpusSync();
  const baseChunks = activeCorpus.chunks;
  const flatVectors = activeCorpus.vectors;

  const queryVec: Float32Array | null = queryEmbedding
    ? queryEmbedding instanceof Float32Array
      ? queryEmbedding
      : normalizeVectorF32(queryEmbedding)
    : null;

  const rawQuery = query.trim().toLowerCase();
  const normalizedQuery = normalizeText(query);
  const queryTokens = normalizedQuery
    .split(' ')
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));

  // Synonym-Erweiterung nur aktivieren, wenn kein echter KI-Embedding-Vektor vorliegt
  const offlineExpandedTokens: string[] = [];
  if (!queryVec || !flatVectors) {
    for (const [pattern, hints] of OFFLINE_SYNONYM_HINTS) {
      if (pattern.test(rawQuery)) {
        offlineExpandedTokens.push(...hints);
      }
    }
  }

  // Erkennung direkter Paragraphenabfragen wie "§ 51", "§56", "§ 8a"
  const paragraphMatch = rawQuery.match(/§\s*(\d+\s*[a-z]?)/i);
  const searchedParagraphNum = paragraphMatch ? paragraphMatch[1].replace(/\s+/g, '') : null;

  const scoredResults: SearchResult[] = [];

  const evaluateChunk = (chunk: LegalChunk, corpusIndex: number) => {
    if (categoryFilter && categoryFilter !== 'all' && chunk.category !== categoryFilter) {
      return;
    }

    let score = 0;
    let matchType: SearchResult['matchType'] = 'keyword';
    let semanticSim: number | undefined;

    const normParagraph = ` ${normalizeText(chunk.paragraph)} `;
    const normTitle = ` ${normalizeText(chunk.sectionTitle)} `;
    const normText = ` ${normalizeText(chunk.text)} `;
    const normSummary = ` ${normalizeText(chunk.summary)} `;
    const normTags = ` ${chunk.tags.map((t) => normalizeText(t)).join(' ')} `;

    // 1. Exakte Paragraphenübereinstimmung (Höchster Boost)
    if (searchedParagraphNum) {
      const regexPara = new RegExp(`§\\s*${searchedParagraphNum}\\b`, 'i');
      if (regexPara.test(chunk.paragraph)) {
        score += 85;
        matchType = 'exact_paragraph';
      }
    }

    // 2. Echte gemini-embedding-001 Vektor-Ähnlichkeit
    if (queryVec && flatVectors && corpusIndex >= 0 && queryVec.length === EMBEDDING_DIM) {
      const sim = dotProductAtOffset(queryVec, flatVectors, corpusIndex);
      semanticSim = sim;
      if (sim > 0.42) {
        score += (sim - 0.40) * 180;
        if (matchType !== 'exact_paragraph') {
          matchType = sim > 0.62 ? 'semantic' : 'hybrid';
        }
      }
    }

    // 3. Token-Matching & Gewichtung (ergänzt Vektor-Suche um exakte Fachbegriffe)
    let tokenHits = 0;
    for (const token of queryTokens) {
      const isGeneric = GENERIC_SCHOOL_WORDS.has(token);
      const mult = isGeneric ? 0.25 : 1.0;
      const needle = isGeneric ? ` ${token} ` : token;

      let hit = false;
      if (normParagraph.includes(needle)) {
        score += 18 * mult;
        hit = true;
      }
      if (normTitle.includes(needle)) {
        score += 12 * mult;
        hit = true;
      }
      if (normTags.includes(needle)) {
        score += 9 * mult;
        hit = true;
      }
      if (normSummary.includes(needle)) {
        score += 5 * mult;
        hit = true;
      }
      if (normText.includes(needle)) {
        score += 3 * mult;
        hit = true;
      }
      if (hit && !isGeneric) tokenHits++;
    }

    // Offline-Synonym-Boost (wenn Embedding-API nicht erreichbar / Quota erschöpft)
    for (const syn of offlineExpandedTokens) {
      if (normParagraph.includes(syn)) score += 16;
      else if (normTitle.includes(syn)) score += 12;
      else if (normTags.includes(syn)) score += 8;
      else if (normText.includes(syn)) score += 4;
    }

    if (queryTokens.length > 0 && tokenHits >= 2) {
      score += tokenHits * 4;
    }

    // 4. Exakter Phrasentreffer
    if (normalizedQuery.length > 6 && (normText.includes(normalizedQuery) || normTitle.includes(normalizedQuery))) {
      score += 24;
      if (matchType === 'keyword') matchType = 'hybrid';
    }

    if (score > 8) {
      scoredResults.push({
        chunk,
        score,
        semanticSimilarity: semanticSim,
        matchType,
      });
    }
  };

  for (let i = 0; i < baseChunks.length; i++) {
    evaluateChunk(baseChunks[i], i);
  }
  for (let i = 0; i < customChunks.length; i++) {
    evaluateChunk(customChunks[i], -1);
  }

  scoredResults.sort((a, b) => b.score - a.score);
  return scoredResults.slice(0, limit);
}
