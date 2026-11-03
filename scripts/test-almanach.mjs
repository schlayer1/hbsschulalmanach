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
assert(fs.existsSync(path.join(projectRoot, 'src', 'data', 'legalCorpus.ts')), 'legalCorpus.ts existiert');
assert(fs.existsSync(path.join(projectRoot, 'src', 'data', 'categories.ts')), 'categories.ts existiert');
assert(fs.existsSync(path.join(projectRoot, 'src', 'services', 'searchEngine.ts')), 'searchEngine.ts existiert');
assert(fs.existsSync(path.join(projectRoot, 'src', 'services', 'geminiService.ts')), 'geminiService.ts existiert');
assert(fs.existsSync(path.join(projectRoot, 'src', 'services', 'storageService.ts')), 'storageService.ts existiert');
assert(fs.existsSync(path.join(projectRoot, 'src', 'App.tsx')), 'App.tsx existiert');
assert(fs.existsSync(path.join(projectRoot, 'api', 'gemini.ts')), 'api/gemini.ts (Vercel Serverless Function) existiert');
assert(fs.existsSync(path.join(projectRoot, 'public', 'manifest.webmanifest')), 'PWA Manifest existiert');
assert(fs.existsSync(path.join(projectRoot, 'public', 'icon.svg')), 'PWA Icon existiert');

// 2. Rechtsdokumente im Korpus prüfen
const corpus = fs.readFileSync(path.join(projectRoot, 'src', 'data', 'legalCorpus.ts'), 'utf8');

assert(corpus.includes('§ 51 ThürSchulG'), '§ 51 ThürSchulG (Ordnungsmaßnahmen) ist enthalten');
assert(corpus.includes('§ 56 ThürSchulO'), '§ 56 ThürSchulO (Klassenarbeiten) ist enthalten');
assert(corpus.includes('§ 57 ThürSchulO'), '§ 57 ThürSchulO (Hausaufgaben) ist enthalten');
assert(corpus.includes('Ziffer 4 Wanderrichtlinie') && corpus.includes('Freiplatz'), 'Wanderrichtlinie (Freiplatzverbot) ist enthalten');
assert(corpus.includes('Abschnitt I-3') && corpus.includes('DEGINTU'), 'RISU (Schutzbrillenpflicht & DEGINTU) ist enthalten');
assert(corpus.includes('26 Pflichtstunden'), 'ThürLehrAzVO (26 Pflichtstunden Regelschule) ist enthalten');
assert(corpus.includes('Montag und Freitag'), 'Duales Lehramtsstudium (Praxistage Mo & Fr) ist enthalten');
assert(corpus.includes('ThILLM'), 'Seiteneinsteiger-Vorkurs ist enthalten');
assert(corpus.includes('HBS Hausordnung'), 'Hausordnung Heimbürgeschule Kahla ist enthalten');
assert(corpus.includes('DienstO-L'), 'Dienstordnung Lehrkräfte (DienstO-L) ist enthalten');
assert(corpus.includes('Kinderschutz § 8a SGB VIII'), 'Kinderschutz (§ 8a SGB VIII & Jugendamt) ist enthalten');
assert(corpus.includes('VV Nachteilsausgleich / LRS'), 'Nachteilsausgleich & Notenschutz (LRS) ist enthalten');
assert(corpus.includes('Medikamentengabe TMBJS/UKT'), 'Medikamentengabe & Notfallpläne ist enthalten');
assert(corpus.includes('Geschenke-Richtlinie ThürBG'), 'Geschenke-Richtlinie & Korruptionsprävention ist enthalten');

console.log('');
console.log(`Ergebnis: ${passedTests} von ${totalTests} Tests erfolgreich absolviert.`);

if (passedTests === totalTests) {
  console.log('🎉 ALLE INTEGRATIONSTESTS BESTANDEN!');
  process.exit(0);
} else {
  console.error('⚠️ EINIGE TESTS SIND FEHLGESCHLAGEN.');
  process.exit(1);
}
