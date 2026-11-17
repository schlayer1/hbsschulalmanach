import { LegalChunk, SearchResult, CustomDocument, SchoolTypeScope } from '../types/almanach';
import { getLoadedCorpusSync, LoadedCorpus } from './corpusLoader';

const EMBEDDING_DIM = 768;
const queryEmbeddingCache = new Map<string, Float32Array>();

export interface QueryEmbeddingResult {
  embedding: Float32Array | null;
  errorReason?: string;
}

const STOPWORDS = new Set([
  'und', 'oder', 'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'einer',
  'mit', 'bei', 'was', 'darf', 'wie', 'für', 'von', 'vom', 'ich', 'wir', 'man', 'sich', 'auf', 'aus',
  'zu', 'zum', 'zur', 'im', 'in', 'an', 'am', 'als', 'auch', 'ist', 'sind', 'wird', 'werden', 'kann',
  'muss', 'müssen', 'soll', 'sollen', 'wenn', 'wann', 'welche', 'welcher', 'welches', 'sofort', 'tun',
  'machen', 'gibt', 'nach', 'über', 'unter', 'vor', 'andere', 'anderen', 'anderer', 'regelung', 'regelungen',
  'ende', 'schon', 'noch', 'aber', 'habe', 'haben', 'hat', 'hatte', 'kann', 'können', 'nicht',
]);

const GENERIC_SCHOOL_WORDS = new Set([
  'schüler', 'schülerin', 'schülerinnen', 'schule', 'schulen', 'lehrer', 'lehrkraft', 'lehrkräfte',
  'unterricht', 'klasse', 'klassen', 'regelschule', 'thüringen', 'thüringer', 'heimbürgeschule',
  'schuljahr', 'schuljahres', 'gemeinschaftsschule', 'sekundarstufe',
]);

// Primärnormen & schulinterne Kernvorschriften haben Vorrang vor bloßen FAQs / Übersichten
const PRIMARY_STATUTE_DOCS = new Set([
  'doc-thuerschulg',
  'doc-thuerschulo',
  'doc-diensto-l',
  'doc-vvorg',
  'doc-vv-schulfahrten',
  'doc-dienstanweisung-gewalt',
  'doc-hbs-schutzkonzept',
  'doc-hbs-projektarbeit-hinweise',
  'doc-hbs-projektarbeit-bewertung',
  'doc-hbs-elterninfo-verhalten',
  'doc-hbs-intern',
]);

const SECONDARY_FAQ_DOCS = new Set([
  'doc-faq-thuerschulo',
  'doc-thuerschulo-neu-2024',
  'doc-faq-schulkonten',
  'doc-faq-sportlager',
  'doc-faq-begegnungen',
]);

const NON_RS_SPECIFIC_DOCS = new Set([
  'doc-gos-handreichung',
  'doc-unfall-primar',
  'doc-kursplan-medienkunde-gs',
]);

const TGS_DOCS = new Set([
  'doc-tgs-handreichung',
  'doc-hbs-konzept-tgs',
]);

// Nur für den Offline-/Quota-Fallback aktiv, wenn /api/embed keinen Vektor liefert:
const OFFLINE_SYNONYM_HINTS: Array<[RegExp, string[]]> = [
  [/\b(\d+\s*[- ]?\s*5(?:er|en)?|fünf(?:en)?|note\s*5)\b/i, ['mangelhaft', 'zwei mangelhafte', 'ausgleich', 'nichtversetzung']],
  [/\b(\d+\s*[- ]?\s*6(?:er|en)?|sechs(?:en)?|note\s*6)\b/i, ['ungenügend', 'ausgleich', 'nichtversetzung']],
  [/versetz|aufrück|sitzenbleib|durchfall|wiederhol|ehrenrunde/i, ['versetzung', 'aufrücken', 'ausgleich', 'wiederholung', 'klassenkonferenz', '§ 51 ThürSchulO', '§ 49 ThürSchulG']],
  [/schläg|prügel|tätlich|angriff|gewalt|rauferei|schlägerei|bedroh|verletz|waffe|messer/i, ['ordnungsmaßnahme', 'gewalt', '§ 51 ThürSchulG', 'pädagogische', 'aufsicht', 'schulfrieden', 'hausrecht']],
  [/suspendier|ausschließ|ausschluss|verweis|tadel|stör/i, ['ordnungsmaßnahme', '§ 51 ThürSchulG', 'unterrichtsausschluss', 'schriftlicher']],
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

function getGermanStem(token: string): string {
  if (token.length < 6) return token;
  const suffixes = [
    'ungen', 'heiten', 'keiten', 'schaft', 'ieren', 'enden', 'endes',
    'endem', 'ender', 'ungs', 'heit', 'keit', 'ende', 'ung',
    'ern', 'ten', 'tet', 'en', 'es', 'em', 'er', 'et', 'te', 'e', 'n', 's',
  ];
  for (const suffix of suffixes) {
    if (token.endsWith(suffix) && token.length - suffix.length >= 5) {
      return token.slice(0, -suffix.length);
    }
  }
  return token;
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
 * Erzeugt einen 768-dimensionalen Query-Vektor via /api/embed (gemini-embedding-001)
 * und liefert bei Quota-/Verbindungsproblemen den konkreten Fehlergrund mit.
 */
export async function fetchQueryEmbeddingDetailed(
  query: string,
  userApiKey?: string
): Promise<QueryEmbeddingResult> {
  const clean = query.trim();
  if (clean.length < 2) return { embedding: null };

  const cacheKey = `${clean.toLowerCase()}::${userApiKey || ''}`;
  const cached = queryEmbeddingCache.get(cacheKey);
  if (cached) return { embedding: cached };

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
      let detail = '';
      try {
        const errJson = await res.json();
        detail = errJson?.error ? ` (${String(errJson.error).slice(0, 90)})` : '';
      } catch {
        // ignore JSON parse error
      }
      if (res.status === 429) {
        return {
          embedding: null,
          errorReason: `Embedding-Tageslimit (HTTP 429) erreicht – Hybrid-Keyword-Suche aktiv${detail}.`,
        };
      }
      return {
        embedding: null,
        errorReason: `Semantische Vektorsuche nicht verfügbar (HTTP ${res.status})${detail} – lokaler Hybrid-Index aktiv.`,
      };
    }

    const data = await res.json();
    const values: unknown = data?.embedding;
    if (!Array.isArray(values) || values.length !== EMBEDDING_DIM) {
      return {
        embedding: null,
        errorReason: 'Ungültige Embedding-Antwort – lokaler Hybrid-Index aktiv.',
      };
    }

    const normalized = normalizeVectorF32(values as number[]);
    queryEmbeddingCache.set(cacheKey, normalized);
    return { embedding: normalized };
  } catch {
    return {
      embedding: null,
      errorReason: 'Keine Verbindung zu /api/embed (Offline- oder Timeout-Modus) – lokaler Hybrid-Index aktiv.',
    };
  }
}

export async function fetchQueryEmbedding(query: string, userApiKey?: string): Promise<Float32Array | null> {
  const res = await fetchQueryEmbeddingDetailed(query, userApiKey);
  return res.embedding;
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

// Hybrid Search: Echte gemini-embedding-001 Vektor-Suche + Kontextualisierung + Schulart-Gewichtung + Keyword/Stem-Boost
export function searchCorpus(
  query: string,
  options?: {
    categoryFilter?: string;
    customChunks?: LegalChunk[];
    queryEmbedding?: Float32Array | number[] | null;
    corpus?: LoadedCorpus;
    limit?: number;
    expandedTerms?: string[];
    schoolScope?: SchoolTypeScope;
  }
): SearchResult[] {
  const {
    categoryFilter,
    customChunks = [],
    queryEmbedding,
    corpus,
    limit = 10,
    expandedTerms = [],
    schoolScope = 'regelschule',
  } = options || {};

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

  // Paragraphen-Hinweise aus Anfrage + Kontextualisierung extrahieren (z.B. "§ 51 ThürSchulO")
  const explicitParaHints: Array<{ num: string; docHint?: string }> = [];
  const rawParaMatch = rawQuery.match(/§\s*(\d+\s*[a-z]?)/i);
  if (rawParaMatch) {
    explicitParaHints.push({ num: rawParaMatch[1].replace(/\s+/g, '') });
  }
  const normalizedExpandedPhrases: string[] = [];
  const expandedSingleTokens = new Set<string>();

  for (const term of expandedTerms) {
    const cleanTerm = term.trim();
    if (!cleanTerm) continue;
    const paraMatch = cleanTerm.match(/§\s*(\d+\s*[a-z]?)(?:\s+([A-Za-zÄÖÜäöüß0-9\-]+))?/i);
    if (paraMatch) {
      explicitParaHints.push({
        num: paraMatch[1].replace(/\s+/g, ''),
        docHint: paraMatch[2]?.toLowerCase(),
      });
      continue;
    }
    const norm = normalizeText(cleanTerm);
    if (!norm) continue;
    if (norm.includes(' ')) {
      normalizedExpandedPhrases.push(norm);
    } else if (norm.length > 2 && !STOPWORDS.has(norm) && !GENERIC_SCHOOL_WORDS.has(norm)) {
      expandedSingleTokens.add(norm);
    }
  }

  // Fallback-Synonyme auch aktivieren, wenn kein KI-Kontextualisierer/Embedding vorlag
  if (!queryVec || !flatVectors) {
    for (const [pattern, hints] of OFFLINE_SYNONYM_HINTS) {
      if (pattern.test(rawQuery)) {
        for (const h of hints) {
          const paraMatch = h.match(/§\s*(\d+\s*[a-z]?)(?:\s+([A-Za-zÄÖÜäöüß0-9\-]+))?/i);
          if (paraMatch) {
            explicitParaHints.push({
              num: paraMatch[1].replace(/\s+/g, ''),
              docHint: paraMatch[2]?.toLowerCase(),
            });
          } else {
            const norm = normalizeText(h);
            if (norm.includes(' ')) normalizedExpandedPhrases.push(norm);
            else if (norm.length > 2) expandedSingleTokens.add(norm);
          }
        }
      }
    }
  }

  // Klassenstufen-Erkennung für zusätzliche Gewichtung (z.B. "7. klasse" / "klasse 7")
  const gradeMatch = rawQuery.match(/\b(\d{1,2})\s*\.?\s*(?:klasse|kl\.?|klassenstufe)\b|\b(?:klasse|kl\.?|klassenstufe)\s*(\d{1,2})\b/i);
  const queriedGrade = gradeMatch ? (gradeMatch[1] || gradeMatch[2]) : null;

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
    const normDocShort = chunk.docShortTitle.toLowerCase();

    // Kurze TOC-Zeilenfragmente ohne echten Regelungsinhalt abwerten
    if (chunk.text.trim().length < 130) {
      score -= 18;
    }

    // 1. Exakte oder kontextualisierte Paragraphenübereinstimmung
    for (const hint of explicitParaHints) {
      const regexPara = new RegExp(`§\\s*${hint.num}\\b`, 'i');
      if (regexPara.test(chunk.paragraph)) {
        const docMatches = !hint.docHint || normDocShort.includes(hint.docHint) || chunk.docId.includes(hint.docHint);
        if (!hint.docHint) {
          score += 85;
          matchType = 'exact_paragraph';
        } else if (docMatches) {
          score += 36;
          if (matchType === 'keyword') matchType = 'hybrid';
        }
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

    // 3. Token-Matching inkl. deutscher Stammreduktion
    let tokenHits = 0;
    for (const token of queryTokens) {
      const isGeneric = GENERIC_SCHOOL_WORDS.has(token);
      const mult = isGeneric ? 0.2 : 1.0;
      const stem = getGermanStem(token);
      const needle = isGeneric ? ` ${token} ` : token;
      const stemNeedle = !isGeneric && stem !== token ? stem : null;

      const matchesField = (field: string) =>
        field.includes(needle) || (stemNeedle !== null && field.includes(stemNeedle));

      let hit = false;
      if (matchesField(normParagraph)) {
        score += 18 * mult;
        hit = true;
      }
      if (matchesField(normTitle)) {
        score += 12 * mult;
        hit = true;
      }
      if (matchesField(normTags)) {
        score += 9 * mult;
        hit = true;
      }
      if (matchesField(normSummary)) {
        score += 5 * mult;
        hit = true;
      }
      if (matchesField(normText)) {
        score += 3 * mult;
        hit = true;
      }
      if (hit && !isGeneric) tokenHits++;
    }

    // 4. Erweiterte Rechtsbegriffe aus Kontextualisierung (online oder lokal)
    let expandedHits = 0;
    for (const term of expandedSingleTokens) {
      if (queryTokens.includes(term)) continue;
      const stem = getGermanStem(term);
      const hasMatch = (field: string) => field.includes(term) || (stem !== term && field.includes(stem));
      if (hasMatch(normTitle)) {
        score += 16;
        expandedHits++;
      } else if (hasMatch(normParagraph)) {
        score += 14;
        expandedHits++;
      } else if (hasMatch(normTags)) {
        score += 10;
        expandedHits++;
      } else if (hasMatch(normText)) {
        score += 6;
        expandedHits++;
      }
    }

    for (const phrase of normalizedExpandedPhrases) {
      if (normTitle.includes(phrase) || normSummary.includes(phrase)) {
        score += 18;
        expandedHits++;
      } else if (normText.includes(phrase)) {
        score += 11;
        expandedHits++;
      }
    }

    if (queryTokens.length > 0 && tokenHits >= 2) {
      score += tokenHits * 4;
    }
    if (expandedHits >= 2) {
      score += expandedHits * 3;
      if (matchType === 'keyword') matchType = 'hybrid';
    }

    // 5. Exakter Phrasentreffer
    if (normalizedQuery.length > 6 && (normText.includes(normalizedQuery) || normTitle.includes(normalizedQuery))) {
      score += 24;
      if (matchType === 'keyword') matchType = 'hybrid';
    }

    // Klassenstufen-Relevanz (z.B. "Klassenstufe 7" / "7 bis 9")
    if (queriedGrade && score > 6) {
      const gradeRegex = new RegExp(`\\b(klassenstufe\\s*${queriedGrade}|klasse\\s*${queriedGrade})\\b`, 'i');
      if (gradeRegex.test(chunk.text) || gradeRegex.test(chunk.sectionTitle)) {
        score += 7;
      }
    }

    // 6. Schulart- & Primärnorm-Gewichtung (nur bei bestehender inhaltlicher Relevanz)
    if (score > 8) {
      const headerContext = `${normParagraph} ${normTitle} ${normSummary.slice(0, 180)}`;
      const mentionsRegelschule = headerContext.includes('regelschule') || normText.includes('in der regelschule');
      const mentionsOtherSchoolTypeOnly =
        (headerContext.includes('grundschule') ||
          headerContext.includes('primarstufe') ||
          headerContext.includes('gymnasiale oberstufe') ||
          headerContext.includes('gymnasium') ||
          headerContext.includes('qualifikationsphase') ||
          headerContext.includes('berufliches gymnasium') ||
          headerContext.includes('kolleg') ||
          headerContext.includes('sonderschule') ||
          headerContext.includes('förderschule')) &&
        !mentionsRegelschule &&
        !normText.includes('regelschule');

      if (schoolScope !== 'all') {
        if (NON_RS_SPECIFIC_DOCS.has(chunk.docId)) {
          score -= 22;
        }
        if (mentionsOtherSchoolTypeOnly) {
          score -= 16;
        }
        if (mentionsRegelschule) {
          score += 11;
        }
        if (schoolScope === 'regelschule' && TGS_DOCS.has(chunk.docId)) {
          score -= 8;
        } else if (schoolScope === 'tgs' && TGS_DOCS.has(chunk.docId)) {
          score += 11;
        }
      }

      if (PRIMARY_STATUTE_DOCS.has(chunk.docId)) {
        score += 7;
      } else if (SECONDARY_FAQ_DOCS.has(chunk.docId)) {
        score -= 7;
      }
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

/**
 * Ergänzt mehrteilige Paragraphen (z.B. "(Teil 1/3)") automatisch um ihre Geschwister-Chunks,
 * damit die KI stets den vollständigen Paragraphen statt einzelner Fragmente liest.
 */
export function expandWithSiblingChunks(
  topChunks: LegalChunk[],
  corpus: LoadedCorpus,
  maxTotal = 9
): LegalChunk[] {
  const seenIds = new Set<string>();
  const result: LegalChunk[] = [];

  const pushChunk = (c: LegalChunk) => {
    if (!seenIds.has(c.id) && result.length < maxTotal) {
      seenIds.add(c.id);
      result.push(c);
    }
  };

  for (const chunk of topChunks) {
    pushChunk(chunk);
    const partMatch = chunk.paragraph.match(/^(.*?)\s*\(Teil\s+\d+\/\d+\)$/i);
    if (partMatch && result.length < maxTotal) {
      const basePara = partMatch[1].trim();
      const siblings = corpus.chunks.filter(
        (c) =>
          c.docId === chunk.docId &&
          c.id !== chunk.id &&
          (c.paragraph === basePara || c.paragraph.startsWith(`${basePara} (Teil `))
      );
      for (const sib of siblings) {
        if (result.length >= maxTotal) break;
        pushChunk(sib);
      }
    }
    if (result.length >= maxTotal) break;
  }

  return result;
}
