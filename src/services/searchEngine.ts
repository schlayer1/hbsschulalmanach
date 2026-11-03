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

// Konvertiert CustomDocument in durchsuchbare LegalChunks
export function customDocsToChunks(customDocs: CustomDocument[]): LegalChunk[] {
  return customDocs.map((doc) => ({
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
    tags: doc.tags || ['Schulintern', 'HBS'],
  }));
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

    // 4. Semantisches Vektor-Matching (falls Embedding vorhanden)
    if (queryEmbedding && chunk.embedding && chunk.embedding.length > 0) {
      const sim = cosineSimilarity(queryEmbedding, chunk.embedding);
      if (sim > 0.5) {
        score += sim * 40;
        matchType = 'semantic';
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
