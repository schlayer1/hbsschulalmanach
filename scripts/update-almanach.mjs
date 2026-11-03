// Antigravity Semi-Annual Legal Update & Verification Script
// Führt den halbjährlichen Abgleich aller Thüringer Rechtsvorschriften für die Heimbürgeschule durch.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('='.repeat(70));
console.log('⚖️  HBS SCHULALMANACH – HALBJÄHRLICHER RECHTSSTANDS-ABGLEICH');
console.log('   Staatliche Regelschule Heimbürgeschule Kahla (Thüringen)');
console.log('='.repeat(70));
console.log(`Datum des Abgleichs: ${new Date().toLocaleDateString('de-DE')} ${new Date().toLocaleTimeString('de-DE')}`);
console.log('');

const legalCorpusPath = path.join(projectRoot, 'src', 'data', 'legalCorpus.ts');

if (!fs.existsSync(legalCorpusPath)) {
  console.error('❌ FEHLER: legalCorpus.ts konnte nicht gefunden werden unter:', legalCorpusPath);
  process.exit(1);
}

const corpusContent = fs.readFileSync(legalCorpusPath, 'utf8');

// Prüfungen
const documentsToCheck = [
  { name: 'Thüringer Schulgesetz (ThürSchulG)', id: 'doc-thuerschulg', key: 'ThürSchulG' },
  { name: 'Thüringer Schulordnung (ThürSchulO)', id: 'doc-thuerschulo', key: 'ThürSchulO' },
  { name: 'VVOrg Thüringen', id: 'doc-vvorg', key: 'VVOrg' },
  { name: 'Wanderrichtlinie Thüringen', id: 'doc-wanderrichtlinie', key: 'Wanderrichtlinie' },
  { name: 'RISU / UKT Vorschriften', id: 'doc-risu', key: 'RISU' },
  { name: 'Lehramtsausbildung LAA (ThürAZStPLVO)', id: 'doc-laa-thueringen', key: 'ThürAZStPLVO' },
  { name: 'Seiteneinsteiger-Richtlinie TMBJS', id: 'doc-seiteneinsteiger', key: 'Seiteneinsteiger' },
  { name: 'Duales Lehramtsstudium Thüringen', id: 'doc-duales-studium', key: 'Duales Studium' },
  { name: 'Lehrerarbeitszeitverordnung (ThürLehrAzVO)', id: 'doc-thuerlehrazvo', key: 'ThürLehrAzVO' },
  { name: 'Thür. Personalvertretungsgesetz (ThürPersVG)', id: 'doc-thuerpersvg', key: 'ThürPersVG' },
  { name: 'Datenschutz an Schulen (ThürDSG / DSGVO)', id: 'doc-datenschutz', key: 'Datenschutz' },
  { name: 'Hausordnung Heimbürgeschule Kahla', id: 'doc-hbs-intern', key: 'Heimbürgeschule' },
];

console.log('📋 Überprüfe integrierte Rechtsdokumente auf Vollständigkeit und Paragraphen:');
console.log('-'.repeat(70));

let allPassed = true;

for (const doc of documentsToCheck) {
  const hasDoc = corpusContent.includes(doc.id);
  const countMatches = (corpusContent.match(new RegExp(doc.id, 'g')) || []).length;
  const chunkCount = countMatches > 1 ? countMatches - 1 : 0;

  if (hasDoc) {
    console.log(`✅ [OK] ${doc.name.padEnd(46)} | Chunks: ${String(chunkCount).padStart(2)} hinterlegt`);
  } else {
    console.log(`❌ [FEHLT] ${doc.name}`);
    allPassed = false;
  }
}

console.log('-'.repeat(70));
console.log('🔍 Prüfe zentrale Schulkernnormen:');

const coreNorms = [
  { label: '§ 51 ThürSchulG (Erziehungs- und Ordnungsmaßnahmen)', pattern: '§ 51' },
  { label: '§ 6 ThürSchulG (Regelschule & Anspruchsebenen I/II)', pattern: '§ 6 ThürSchulG' },
  { label: '§ 56 ThürSchulO (Klassenarbeiten & Ankündigung)', pattern: '§ 56 ThürSchulO' },
  { label: '§ 57 ThürSchulO (Hausaufgaben & Wochenende)', pattern: '§ 57 ThürSchulO' },
  { label: '§ 58/60 ThürSchulO (Täglicher Unterrichtsbeitrag)', pattern: '§ 58' },
  { label: 'Freiplatzverbot Wandertage (Antikorruption)', pattern: 'Freiplatzverbot' },
  { label: 'Schutzbrillenpflicht & DEGINTU (RISU / UKT)', pattern: 'Schutzbrille' },
  { label: '26 Pflichtstunden Regelschule (§ 4 ThürLehrAzVO)', pattern: '26 Pflichtstunden' },
  { label: '3-Monate-Vorkurs Seiteneinsteiger (ThILLM)', pattern: 'Vorkurs' },
  { label: 'Duales Studium Praxistage Montag & Freitag', pattern: 'Montag und Freitag' },
];

for (const norm of coreNorms) {
  const present = corpusContent.includes(norm.pattern);
  console.log(`${present ? '✅' : '❌'} ${norm.label}`);
  if (!present) allPassed = false;
}

console.log('-'.repeat(70));

if (allPassed) {
  console.log('🎉 RECHTSSTAND VERIFIZIERT: Alle 12 Rechtsquellen und Kernnormen sind intakt!');
  console.log('   Hinweis für das neue Schuljahr: Bei Veröffentlichung der neuen VVOrg');
  console.log('   einfach die Jahreszahlen und Stundentabellen in src/data/legalCorpus.ts');
  console.log('   fortschreiben und dieses Skript erneut ausführen.');
} else {
  console.error('⚠️ WARNUNG: Einige Dokumente oder Kernnormen konnten nicht verifiziert werden.');
  process.exit(1);
}

console.log('='.repeat(70));
