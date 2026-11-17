import { LegalChunk, LegalDocument } from '../types/almanach';
import { LEGAL_DOCUMENTS } from '../data/legalCorpus';

const EMBEDDING_DIM = 768;
const BYTES_PER_CHUNK = 4 + EMBEDDING_DIM;

export interface LoadedCorpus {
  documents: LegalDocument[];
  chunks: LegalChunk[];
  vectors: Float32Array | null; // flacher Puffer: chunks.length * 768
  chunkIndexById: Map<string, number>;
  chunksByDocId: Map<string, LegalChunk[]>;
}

let cachedCorpus: LoadedCorpus | null = null;
let loadPromise: Promise<LoadedCorpus> | null = null;

function buildFallbackCorpus(): LoadedCorpus {
  return {
    documents: LEGAL_DOCUMENTS,
    chunks: [],
    vectors: null,
    chunkIndexById: new Map(),
    chunksByDocId: new Map(),
  };
}

function decodeEmbeddings(buffer: ArrayBuffer, expectedCount: number): Float32Array | null {
  const expectedBytes = expectedCount * BYTES_PER_CHUNK;
  if (buffer.byteLength !== expectedBytes) {
    console.warn(
      `Embedding-Binary Größe (${buffer.byteLength} B) passt nicht zu ${expectedCount} Chunks (${expectedBytes} B).`
    );
    return null;
  }

  const view = new DataView(buffer);
  const int8 = new Int8Array(buffer);
  const flat = new Float32Array(expectedCount * EMBEDDING_DIM);

  for (let i = 0; i < expectedCount; i++) {
    const byteOffset = i * BYTES_PER_CHUNK;
    const scale = view.getFloat32(byteOffset, true);
    const inv = scale / 127;
    const vecOffset = i * EMBEDDING_DIM;
    const dataOffset = byteOffset + 4;

    let normSq = 0;
    for (let d = 0; d < EMBEDDING_DIM; d++) {
      const v = int8[dataOffset + d] * inv;
      flat[vecOffset + d] = v;
      normSq += v * v;
    }

    // Auf exakte Einheitslänge normieren für schnelles Dot-Product-Cosine-Matching
    if (normSq > 0) {
      const invNorm = 1 / Math.sqrt(normSq);
      for (let d = 0; d < EMBEDDING_DIM; d++) {
        flat[vecOffset + d] *= invNorm;
      }
    }
  }

  return flat;
}

export async function loadCorpus(): Promise<LoadedCorpus> {
  if (cachedCorpus) return cachedCorpus;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const [chunksRes, embedRes] = await Promise.all([
        fetch('/data/corpus-chunks.json'),
        fetch('/data/corpus-embeddings.bin').catch(() => null),
      ]);

      if (!chunksRes.ok) {
        throw new Error(`HTTP ${chunksRes.status} beim Laden von corpus-chunks.json`);
      }

      const data = await chunksRes.json();
      const documents: LegalDocument[] = Array.isArray(data.documents) ? data.documents : LEGAL_DOCUMENTS;
      const chunks: LegalChunk[] = Array.isArray(data.chunks) ? data.chunks : [];

      let vectors: Float32Array | null = null;
      if (embedRes && embedRes.ok) {
        const buf = await embedRes.arrayBuffer();
        vectors = decodeEmbeddings(buf, chunks.length);
      }

      const chunkIndexById = new Map<string, number>();
      const chunksByDocId = new Map<string, LegalChunk[]>();

      for (let i = 0; i < chunks.length; i++) {
        const c = chunks[i];
        chunkIndexById.set(c.id, i);
        const list = chunksByDocId.get(c.docId);
        if (list) {
          list.push(c);
        } else {
          chunksByDocId.set(c.docId, [c]);
        }
      }

      cachedCorpus = {
        documents,
        chunks,
        vectors,
        chunkIndexById,
        chunksByDocId,
      };
      return cachedCorpus;
    } catch (err) {
      console.error('Fehler beim Laden des Volltext-Korpus:', err);
      loadPromise = null;
      return buildFallbackCorpus();
    }
  })();

  return loadPromise;
}

export function getLoadedCorpusSync(): LoadedCorpus {
  return cachedCorpus || buildFallbackCorpus();
}

export function getNeighborChunks(chunk: LegalChunk | null): {
  prev: LegalChunk | null;
  next: LegalChunk | null;
  position: number;
  total: number;
} {
  if (!chunk || !cachedCorpus) {
    return { prev: null, next: null, position: 0, total: 0 };
  }
  const list = cachedCorpus.chunksByDocId.get(chunk.docId);
  if (!list || list.length === 0) {
    return { prev: null, next: null, position: 0, total: 0 };
  }
  const idx = list.findIndex((c) => c.id === chunk.id);
  if (idx < 0) {
    return { prev: null, next: null, position: 0, total: list.length };
  }
  return {
    prev: idx > 0 ? list[idx - 1] : null,
    next: idx < list.length - 1 ? list[idx + 1] : null,
    position: idx + 1,
    total: list.length,
  };
}
