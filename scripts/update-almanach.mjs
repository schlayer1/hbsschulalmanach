// Antigravity Semi-Annual Legal Update & Verification Script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('='.repeat(70));
console.log('⚖️  HBS SCHULALMANACH – VOLLTEXT- & EMBEDDING-PRÜFUNG');
console.log('   Staatliche Regelschule Heimbürgeschule Kahla (Thüringen)');
console.log('='.repeat(70));

const chunksJsonPath = path.join(projectRoot, 'public', 'data', 'corpus-chunks.json');
if (!fs.existsSync(chunksJsonPath)) {
  console.error('❌ FEHLER: public/data/corpus-chunks.json fehlt. Bitte "npm run build-corpus" ausführen.');
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(chunksJsonPath, 'utf8'));
console.log(`📚 Dokumente: ${payload.documents.length} | Chunks: ${payload.chunks.length} | Dim: ${payload.embeddingDimensions}`);

const requiredDocs = [
  'doc-thuerschulg',
  'doc-thuerschulo',
  'doc-diensto-l',
  'doc-vvorg',
  'doc-vv-schulfahrten',
  'doc-risu',
  'doc-dienstanweisung-gewalt',
  'doc-nachteilsausgleich-lrs',
  'doc-hbs-schutzkonzept',
  'doc-hbs-konzept-tgs',
  'doc-hbs-intern',
];

let allPassed = true;
for (const docId of requiredDocs) {
  const doc = payload.documents.find((d) => d.id === docId);
  if (doc && doc.chunksCount > 0) {
    console.log(`✅ [OK] ${doc.shortTitle.padEnd(40)} | Chunks: ${String(doc.chunksCount).padStart(3)}`);
  } else {
    console.log(`❌ [FEHLT] ${docId}`);
    allPassed = false;
  }
}

if (!allPassed) process.exit(1);
console.log('🎉 ALLE KERNDokumente VOLLSTÄNDIG INDIZIERT!');
