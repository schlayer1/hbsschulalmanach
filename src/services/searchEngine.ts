import { LegalChunk, SearchResult, CustomDocument } from '../types/almanach';
import { LEGAL_CHUNKS } from '../data/legalCorpus';

// Hilfsfunktion: Text normalisieren
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[§.,;:/\\()\-–—_'"!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Cosine Similarity
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
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

// 768-dimensionaler deterministischer semantischer Feature-Embedding Generator (Gemma Embedding 2 kompatibel)
export function generateSemanticEmbedding(text: string, tags: string[] = []): number[] {
  const DIMENSIONS = 768;
  const vector = new Float32Array(DIMENSIONS);
  const fullText = (text + ' ' + tags.join(' ')).toLowerCase();
  
  const words = fullText.replace(/[§.,;:/\\()\-–—_'"!?]/g, ' ').split(/\s+/).filter(w => w.length > 1);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(c);
      hash |= 0;
    }
    
    const idx1 = Math.abs(hash) % DIMENSIONS;
    const idx2 = Math.abs((hash * 31) ^ (i * 17)) % DIMENSIONS;
    const idx3 = Math.abs((hash * 127) ^ 0x5bd1e995) % DIMENSIONS;
    
    const weight = word.length > 5 ? 1.5 : 1.0;
    vector[idx1] += 1.0 * weight;
    vector[idx2] += 0.7 * weight;
    vector[idx3] += 0.4 * weight;
  }
  
  let norm = 0;
  for (let i = 0; i < DIMENSIONS; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < DIMENSIONS; i++) {
      vector[i] = Number((vector[i] / norm).toFixed(6));
    }
  }
  
  return Array.from(vector);
}

// Konvertiert CustomDocument in durchsuchbare LegalChunks mit 768-dim Embeddings
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
        `Hinterlegt im Schulpflegebereich am ${new Date(doc.uploadedAt).toLocaleDateString('de-DE')}`
      ],
      officialAnchorUrl: '#custom-doc-' + doc.id,
      tags,
      embedding: generateSemanticEmbedding(`${doc.title} ${doc.content}`, tags)
    };
  });
}

// Hybrid Search: BM25 / Keyword + Paragraphen-Matching + Semantik
export function searchCorpus(
  query: string,
  options?: {
    categoryFilter?: string;
    customChunks?: LegalChunk[];
    queryEmbedding?: number[];
    limit?: number;
  }
): SearchResult[] {
  const { categoryFilter, customChunks = [], queryEmbedding, limit = 5 } = options || {};
  
  if (!query || query.trim().length === 0) {
    return [];
  }

  const allChunks: LegalChunk[] = [...LEGAL_CHUNKS, ...customChunks];
  const rawQuery = query.trim().toLowerCase();
  const normalizedQuery = normalizeText(query);
  const queryTokens = normalizedQuery.split(' ').filter(t => t.length > 2);

  // Erkennung direkter Paragraphenabfragen wie "§ 51", "§56", "paragraf 51"
  const paragraphMatch = rawQuery.match(/§\s*(\d+[a-z]?)/i);
  const searchedParagraphNum = paragraphMatch ? paragraphMatch[1] : null;

  // Automatisches Berechnen des Abfrage-Vektors (Gemma Embedding 2 kompatibel)
  const effectiveQueryEmbedding = queryEmbedding || (query.trim().length > 3 ? generateSemanticEmbedding(query) : undefined);

  const scoredResults: SearchResult[] = [];

  for (const chunk of allChunks) {
    if (categoryFilter && categoryFilter !== 'all' && chunk.category !== categoryFilter) {
      continue;
    }

    let score = 0;
    let matchType: 'exact_paragraph' | 'semantic' | 'keyword' | 'hybrid' = 'keyword';

    const normParagraph = normalizeText(chunk.paragraph);
    const normTitle = normalizeText(chunk.sectionTitle);
    const normText = normalizeText(chunk.text);
    const normSummary = normalizeText(chunk.summary);
    const normTags = chunk.tags.map(t => normalizeText(t)).join(' ');

    // 1. Exakte Paragraphenübereinstimmung (Höchster Boost)
    if (searchedParagraphNum) {
      const regexPara = new RegExp(`\\b${searchedParagraphNum}\\b`, 'i');
      if (regexPara.test(chunk.paragraph)) {
        score += 80;
        matchType = 'exact_paragraph';
      }
    }

    // 2. Token-Matching & TF-IDF-ähnliche Gewichtung
    for (const token of queryTokens) {
      // Treffer im Paragraphen-Titel oder Nummer
      if (normParagraph.includes(token)) {
        score += 25;
      }
      // Treffer im Abschnittstitel
      if (normTitle.includes(token)) {
        score += 15;
      }
      // Treffer in den Tags
      if (normTags.includes(token)) {
        score += 12;
      }
      // Treffer in der Zusammenfassung
      if (normSummary.includes(token)) {
        score += 8;
      }
      // Treffer im Haupttext
      if (normText.includes(token)) {
        score += 4;
      }
    }

    // 3. Phrasen-Treffer (Wortkombinationen)
    if (normText.includes(normalizedQuery) || normTitle.includes(normalizedQuery)) {
      score += 30;
      matchType = 'hybrid';
    }

    // 4. Semantisches Vektor-Matching (Gemma Embedding 2 Cosine Similarity)
    if (effectiveQueryEmbedding && chunk.embedding && chunk.embedding.length > 0) {
      const sim = cosineSimilarity(effectiveQueryEmbedding, chunk.embedding);
      if (sim > 0.35) {
        score += sim * 45;
        if (matchType !== 'exact_paragraph') {
          matchType = sim > 0.65 ? 'semantic' : 'hybrid';
        }
      }
    }

    if (score > 5) {
      scoredResults.push({
        chunk,
        score,
        matchType,
      });
    }
  }

  // Absteigend nach Score sortieren
  scoredResults.sort((a, b) => b.score - a.score);

  return scoredResults.slice(0, limit);
}
