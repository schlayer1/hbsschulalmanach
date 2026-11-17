#!/usr/bin/env node
/**
 * Erzeugt echte 768-dimensionale gemini-embedding-001 Vektoren für alle
 * extrahierten Rechts- und Schul-Chunks und exportiert:
 *   1. public/data/corpus-chunks.json     (Dokumente + Volltext-Chunks ohne Vektoren)
 *   2. public/data/corpus-embeddings.bin  (Int8-quantisierte 768-dim Vektoren, 772 B/Chunk)
 *   3. src/data/legalCorpus.ts            (Schlanker Katalog-Export für Instant-Render)
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const EXTRACTED_PATH = path.join(__dirname, '.extracted-corpus.json');
const CACHE_PATH = path.join(__dirname, '.embedding-cache.json');
const PUBLIC_DATA_DIR = path.join(projectRoot, 'public', 'data');
const CHUNKS_OUT_PATH = path.join(PUBLIC_DATA_DIR, 'corpus-chunks.json');
const EMBED_OUT_PATH = path.join(PUBLIC_DATA_DIR, 'corpus-embeddings.bin');
const LEGAL_CORPUS_TS_PATH = path.join(projectRoot, 'src', 'data', 'legalCorpus.ts');

const DIMENSIONS = 768;
const BATCH_SIZE = 25;
const BYTES_PER_CHUNK = 4 + DIMENSIONS; // 4B Float32 maxAbs + 768B Int8

function loadApiKeys() {
  const keys = [];
  const addKeys = (raw) => {
    if (!raw) return;
    for (const part of raw.split(',')) {
      const clean = part.trim().replace(/^["']|["']$/g, '');
      if (clean && !keys.includes(clean)) keys.push(clean);
    }
  };

  addKeys(process.env.GEMINI_API_KEYS);
  addKeys(process.env.GEMINI_API_KEY);

  const envLocal = path.join(projectRoot, '.env.local');
  if (fs.existsSync(envLocal)) {
    const content = fs.readFileSync(envLocal, 'utf8');
    const mMulti = content.match(/^GEMINI_API_KEYS=(.+)$/m);
    if (mMulti) addKeys(mMulti[1]);
    const mSingle = content.match(/^GEMINI_API_KEY=(.+)$/m);
    if (mSingle) addKeys(mSingle[1]);
  }
  return keys;
}

function hashChunk(chunk) {
  return crypto
    .createHash('sha256')
    .update(`${chunk.docId}\n${chunk.paragraph}\n${chunk.sectionTitle}\n${chunk.text}`)
    .digest('hex');
}

function normalizeVector(vec) {
  let norm = 0;
  for (let i = 0; i < vec.length; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm === 0) return vec;
  return vec.map((v) => v / norm);
}

async function embedBatchWithPool(keyPool, batchChunks) {
  const requests = batchChunks.map((c) => {
    const contentText = `${c.docShortTitle} | ${c.paragraph} | ${c.sectionTitle}\n\n${c.text}`.slice(0, 1600);
    return {
      model: 'models/gemini-embedding-001',
      content: { parts: [{ text: contentText }] },
      taskType: 'RETRIEVAL_DOCUMENT',
      title: `${c.paragraph} - ${c.sectionTitle}`.slice(0, 180),
      outputDimensionality: DIMENSIONS,
    };
  });

  let rpmCycles = 0;
  while (keyPool.active.length > 0) {
    // Wähle den nächsten nicht im Cooldown befindlichen Key
    const now = Date.now();
    let candidate = keyPool.active.find((k) => k.cooldownUntil <= now);
    if (!candidate) {
      const soonest = keyPool.active.reduce((a, b) => (a.cooldownUntil < b.cooldownUntil ? a : b));
      const waitMs = Math.max(1000, soonest.cooldownUntil - now);
      console.warn(`  ⏳ Alle ${keyPool.active.length} aktiven Keys im Minuten-Cooldown – warte ${(waitMs / 1000).toFixed(1)}s...`);
      await new Promise((r) => setTimeout(r, waitMs));
      candidate = soonest;
    }

    // Round-Robin ans Ende verschieben
    keyPool.active = keyPool.active.filter((k) => k !== candidate);
    keyPool.active.push(candidate);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=${encodeURIComponent(candidate.key)}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(45000),
      body: JSON.stringify({ requests }),
    });

    if (res.ok) {
      const json = await res.json();
      const embeddings = json.embeddings || [];
      if (embeddings.length !== batchChunks.length) {
        throw new Error(`Erwartet ${batchChunks.length} Embeddings, erhalten ${embeddings.length}`);
      }
      return embeddings.map((e) => normalizeVector(e.values));
    }

    const errText = await res.text().catch(() => '');
    let waitMs = 62000;
    let quotaInfo = '';
    try {
      const errJson = JSON.parse(errText);
      quotaInfo = errJson?.error?.message || '';
      const retryDetail = (errJson?.error?.details || []).find((d) => d.retryDelay);
      if (retryDetail?.retryDelay) {
        const secs = parseFloat(String(retryDetail.retryDelay).replace(/[^\d.]/g, ''));
        if (!Number.isNaN(secs) && secs > 0) {
          waitMs = Math.ceil((secs + 2) * 1000);
        }
      }
    } catch {
      // ignore parse errors
    }

    if (res.status === 400 || res.status === 401 || res.status === 403) {
      console.warn(`  ⚠️ Key #${candidate.index} ungültig/gesperrt (HTTP ${res.status}), entferne aus Pool.`);
      keyPool.active = keyPool.active.filter((k) => k !== candidate);
      continue;
    }

    if (res.status === 429 && waitMs > 120000) {
      console.warn(`  ℹ️ Key #${candidate.index} hat Tageslimit erreicht (Reset in ${(waitMs / 3600000).toFixed(1)} Std.), wechsle auf nächsten Key.`);
      keyPool.active = keyPool.active.filter((k) => k !== candidate);
      continue;
    }

    if (res.status === 429 || res.status >= 500) {
      rpmCycles++;
      if (rpmCycles > 25) {
        throw new Error(`Zu viele Rate-Limit-Zyklen hintereinander: ${quotaInfo.slice(0, 300)}`);
      }
      candidate.cooldownUntil = Date.now() + Math.min(waitMs, 62000);
      console.warn(`  🔄 Key #${candidate.index} HTTP ${res.status} (Cooldown ${(Math.min(waitMs, 62000) / 1000).toFixed(0)}s) – rotiere weiter...`);
      continue;
    }

    throw new Error(`Gemini Embedding API Fehler HTTP ${res.status}: ${errText.slice(0, 1000)}`);
  }

  throw new Error(
    `Alle konfigurierten API-Keys haben ihr Tageslimit erreicht oder sind ungültig. ` +
    `Bisheriger Fortschritt ist in scripts/.embedding-cache.json gesichert.`
  );
}

async function main() {
  if (!fs.existsSync(EXTRACTED_PATH)) {
    console.error(`❌ ${EXTRACTED_PATH} fehlt. Bitte zuerst "python3 scripts/extract-corpus.py" ausführen.`);
    process.exit(1);
  }

  const apiKeys = loadApiKeys();
  if (apiKeys.length === 0) {
    console.error('❌ Kein GEMINI_API_KEY / GEMINI_API_KEYS gefunden (weder in Umgebung noch in .env.local).');
    process.exit(1);
  }

  const keyPool = {
    active: apiKeys.map((key, idx) => ({ key, index: idx + 1, cooldownUntil: 0 })),
  };

  const extracted = JSON.parse(fs.readFileSync(EXTRACTED_PATH, 'utf8'));
  const { documents, chunks } = extracted;

  let cache = {};
  if (fs.existsSync(CACHE_PATH)) {
    try {
      cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
    } catch {
      cache = {};
    }
  }

  const missing = [];
  const chunkHashes = chunks.map((c) => {
    const h = hashChunk(c);
    if (!Array.isArray(cache[h]) || cache[h].length !== DIMENSIONS) {
      missing.push({ chunk: c, hash: h });
    }
    return h;
  });

  const args = process.argv.slice(2);
  const allowPartial = args.includes('--allow-partial');
  const exportOnly = args.includes('--export-only');

  console.log(`📚 Korpus: ${documents.length} Dokumente, ${chunks.length} Chunks`);
  console.log(`🔑 API-Key-Pool: ${apiKeys.length} Key(s) geladen`);
  console.log(`🧠 Embedding-Cache: ${chunks.length - missing.length} Treffer, ${missing.length} neu zu berechnen (gemini-embedding-001, ${DIMENSIONS}d)`);

  if (!exportOnly) {
    for (let i = 0; i < missing.length; i += BATCH_SIZE) {
      const slice = missing.slice(i, i + BATCH_SIZE);
      try {
        const vectors = await embedBatchWithPool(keyPool, slice.map((s) => s.chunk));
        for (let j = 0; j < slice.length; j++) {
          cache[slice[j].hash] = vectors[j].map((v) => Number(v.toFixed(6)));
        }
        const done = Math.min(i + BATCH_SIZE, missing.length);
        console.log(`  ✨ Batch ${done}/${missing.length} eingebettet`);

        fs.writeFileSync(CACHE_PATH, JSON.stringify(cache));
        if (done < missing.length) {
          await new Promise((r) => setTimeout(r, 400));
        }
      } catch (err) {
        if (allowPartial) {
          console.warn(`⚠️ ${err.message}`);
          console.warn(`📦 Exportiere Teilstand (--allow-partial): ${Object.keys(cache).length} echte Vektoren + Fallback für Rest.`);
          break;
        }
        throw err;
      }
    }
  }

  fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });

  // 1. Kompaktes JSON für Volltext + Metadaten
  const chunksPayload = {
    generatedAt: new Date().toISOString(),
    totalDocuments: documents.length,
    totalChunks: chunks.length,
    embeddingDimensions: DIMENSIONS,
    embeddingFormat: 'int8-scaled',
    documents,
    chunks,
  };
  fs.writeFileSync(CHUNKS_OUT_PATH, JSON.stringify(chunksPayload), 'utf8');

  // 2. Kompakte Binärdatei für 768-dim Vektoren (4B Float32 scale + 768B Int8)
  const zeroVec = new Array(DIMENSIONS).fill(0);
  let fallbackCount = 0;
  const binBuffer = Buffer.allocUnsafe(chunks.length * BYTES_PER_CHUNK);
  for (let i = 0; i < chunks.length; i++) {
    const vec = cache[chunkHashes[i]] || (fallbackCount++, zeroVec);
    let maxAbs = 0;
    for (let d = 0; d < DIMENSIONS; d++) {
      const a = Math.abs(vec[d]);
      if (a > maxAbs) maxAbs = a;
    }
    if (maxAbs === 0) maxAbs = 1;
    const offset = i * BYTES_PER_CHUNK;
    binBuffer.writeFloatLE(maxAbs, offset);
    for (let d = 0; d < DIMENSIONS; d++) {
      const q = Math.max(-127, Math.min(127, Math.round((vec[d] / maxAbs) * 127)));
      binBuffer.writeInt8(q, offset + 4 + d);
    }
  }
  fs.writeFileSync(EMBED_OUT_PATH, binBuffer);
  if (fallbackCount > 0) {
    console.warn(`⚠️ Hinweis: ${fallbackCount} Chunks ohne Cache-Vektor erhielten vorläufigen Null-Vektor (Keyword-/§-Suche aktiv).`);
  }

  // 3. Schlankes src/data/legalCorpus.ts mit Dokumentenkatalog
  const tsContent = `// Automatisch generierter Katalog-Index für den HBS Schulalmanach
// Generiert am: ${new Date().toISOString()}
// Volltext-Chunks (${chunks.length}) & echte gemini-embedding-001 Vektoren (768d) liegen lazy in /data/corpus-chunks.json & /data/corpus-embeddings.bin

import { LegalDocument, LegalChunk } from '../types/almanach';

export const CORPUS_STATS = {
  generatedAt: '${new Date().toISOString()}',
  totalDocuments: ${documents.length},
  totalChunks: ${chunks.length},
  embeddingModel: 'gemini-embedding-001',
  embeddingDimensions: ${DIMENSIONS},
};

export const LEGAL_DOCUMENTS: LegalDocument[] = ${JSON.stringify(documents, null, 2)};

export const LEGAL_CHUNKS: LegalChunk[] = [];
`;
  fs.writeFileSync(LEGAL_CORPUS_TS_PATH, tsContent, 'utf8');

  const jsonMb = (fs.statSync(CHUNKS_OUT_PATH).size / (1024 * 1024)).toFixed(2);
  const binMb = (fs.statSync(EMBED_OUT_PATH).size / (1024 * 1024)).toFixed(2);
  console.log(`\n💾 Export abgeschlossen:`);
  console.log(`   • ${CHUNKS_OUT_PATH} (${jsonMb} MB)`);
  console.log(`   • ${EMBED_OUT_PATH} (${binMb} MB)`);
  console.log(`   • ${LEGAL_CORPUS_TS_PATH} (Katalog mit ${documents.length} Dokumenten)`);
}

main().catch((err) => {
  console.error('❌ Fehler:', err);
  process.exit(1);
});
