// Automatisiertes Testskript für HBS Schulalmanach
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🧪 STARTE INTEGRATIONSTESTS FÜR HBS SCHULALMANACH...');
console.log('');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

// 1. Dateien vorhanden
const chunksJsonPath = path.join(projectRoot, 'public', 'data', 'corpus-chunks.json');
const embedBinPath = path.join(projectRoot, 'public', 'data', 'corpus-embeddings.bin');

assert(fs.existsSync(path.join(projectRoot, 'src', 'data', 'legalCorpus.ts')), 'legalCorpus.ts existiert');
assert(fs.existsSync(path.join(projectRoot, 'src', 'data', 'categories.ts')), 'categories.ts existiert');
assert(fs.existsSync(path.join(projectRoot, 'src', 'services', 'corpusLoader.ts')), 'corpusLoader.ts existiert');
assert(fs.existsSync(path.join(projectRoot, 'src', 'services', 'searchEngine.ts')), 'searchEngine.ts existiert');
assert(fs.existsSync(path.join(projectRoot, 'src', 'services', 'geminiService.ts')), 'geminiService.ts existiert');
assert(fs.existsSync(path.join(projectRoot, 'src', 'services', 'storageService.ts')), 'storageService.ts existiert');
assert(fs.existsSync(path.join(projectRoot, 'src', 'App.tsx')), 'App.tsx existiert');
assert(fs.existsSync(path.join(projectRoot, 'api', 'gemini.ts')), 'api/gemini.ts (Vercel Serverless Function) existiert');
assert(fs.existsSync(path.join(projectRoot, 'api', 'embed.ts')), 'api/embed.ts (Vercel Embedding Function) existiert');
assert(fs.existsSync(chunksJsonPath), 'public/data/corpus-chunks.json existiert');
assert(fs.existsSync(embedBinPath), 'public/data/corpus-embeddings.bin existiert');
assert(fs.existsSync(path.join(projectRoot, 'public', 'manifest.webmanifest')), 'PWA Manifest existiert');
assert(fs.existsSync(path.join(projectRoot, 'public', 'icon.svg')), 'PWA Icon existiert');

// 2. Volltext-Korpus und Embeddings prüfen
if (fs.existsSync(chunksJsonPath) && fs.existsSync(embedBinPath)) {
  const payload = JSON.parse(fs.readFileSync(chunksJsonPath, 'utf8'));
  const binSize = fs.statSync(embedBinPath).size;
  const expectedBinSize = payload.chunks.length * (4 + 768);
  assert(payload.documents.length >= 55, `Mindestens 55 Volltext-Dokumente geladen (${payload.documents.length})`);
  assert(payload.chunks.length >= 2500, `Mindestens 2500 Volltext-Chunks geladen (${payload.chunks.length})`);
  assert(binSize === expectedBinSize, `Embedding-Binärdatei exakt (${binSize} B === ${expectedBinSize} B)`);

  const allText = payload.chunks.map((c) => `${c.paragraph} ${c.sectionTitle} ${c.text}`).join('\n');
  assert(allText.includes('§ 51 ThürSchulG'), '§ 51 ThürSchulG (Ordnungsmaßnahmen) ist enthalten');
  assert(allText.includes('§ 60 ThürSchulO'), '§ 60 ThürSchulO (Klassenarbeiten/Leistungsnachweise) ist enthalten');
  assert(allText.includes('§ 8 DienstO-L'), '§ 8 DienstO-L (Aufsichtspflicht & Hausrecht) ist enthalten');
  assert(allText.includes('VV Wandertage & Klassenfahrten') && allText.includes('Freiplatz'), 'VV Wandertage & Klassenfahrten (Freiplätze) ist enthalten');
  assert(allText.includes('RiSU (KMK)') && allText.includes('DEGINTU'), 'RiSU & DEGINTU sind enthalten');
  assert(allText.includes('26 Pflichtstunden'), 'ThürLehrAzVO (26 Pflichtstunden Regelschule) ist enthalten');
  assert(allText.includes('HBS Schutzkonzept'), 'HBS Schutzkonzept ist enthalten');
  assert(allText.includes('HBS Hausordnung'), 'HBS Hausordnung ist enthalten');
}

console.log('');
console.log(`Ergebnis: ${passedTests} von ${totalTests} Tests erfolgreich absolviert.`);

if (passedTests === totalTests) {
  console.log('🎉 ALLE INTEGRATIONSTESTS BESTANDEN!');
  process.exit(0);
} else {
  console.error('⚠️ EINIGE TESTS SIND FEHLGESCHLAGEN.');
  process.exit(1);
}
