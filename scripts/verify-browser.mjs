import puppeteer from 'puppeteer';
import { createServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function runVerification() {
  console.log('🚀 STARTE VOLLSTÄNDIGE BROWSER-VERIFIKATION (REAL EMBEDDINGS + IN-DOC + ONLINE-LINKS)...');

  const server = await createServer({
    configFile: path.join(projectRoot, 'vite.config.ts'),
    server: { port: 5192 },
  });
  await server.listen();
  console.log('✅ Vite Testserver läuft auf Port 5192');

  let browser;
  try {
    const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    browser = await puppeteer.launch({
      headless: 'new',
      ...(fs.existsSync(macChrome) ? { executablePath: macChrome } : {}),
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 768, deviceScaleFactor: 2 });

    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('http://localhost:5192', { waitUntil: 'networkidle0' });

    // 1. Startansicht prüfen
    const title = await page.title();
    console.log(`📄 Seitentitel: "${title}"`);
    await page.screenshot({ path: path.join(projectRoot, 'scripts', 'screenshot-1-ipad-home.png') });

    // 2. Modus "Nur Embeddingsuche (Sofort)" testen mit Alltagssprache (OHNE §-Nummer!)
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Nur Embeddingsuche')
      );
      if (btn) btn.click();
    });

    const query = 'Schüler schlägt anderen auf dem Schulhof was darf ich sofort tun';
    console.log(`👉 Teste Alltagssprache-Embeddingsuche: "${query}"`);
    await page.type('input[type="text"]', query);
    await page.click('button[type="submit"]');

    await page.waitForFunction(
      () =>
        document.body.innerText.includes('Direkte Fundstellen in den Dokumenten') &&
        document.body.innerText.includes('Im Dokument öffnen'),
      { timeout: 15000 }
    );

    const searchReport = await page.evaluate(() => {
      const txt = document.body.innerText;
      return {
        hasEmbeddingBadge: txt.includes('KI-Embedding aktiv'),
        hasOfflineBadge: txt.includes('Offline-Suche'),
        hasOnlineRef: txt.includes('Online-Referenz'),
        has51OrViolence: txt.includes('§ 51') || txt.includes('Gewalt') || txt.includes('Ordnungsmaßnahme'),
        topCards: Array.from(document.querySelectorAll('article h4')).slice(0, 5).map((h) => h.textContent),
      };
    });
    console.log('🔍 Suchergebnis:', JSON.stringify(searchReport));
    if (!searchReport.hasEmbeddingBadge) {
      throw new Error('KI-Embedding Badge war nicht aktiv (erwartet echte gemini-embedding-001 Live-Suche)!');
    }
    if (!searchReport.has51OrViolence) {
      throw new Error('Weder § 51 noch Gewalt/Ordnungsmaßnahme in den Top-Treffern!');
    }
    await page.screenshot({ path: path.join(projectRoot, 'scripts', 'screenshot-2-antwort-stufe123.png') });

    // 3. "Im Dokument öffnen" testen -> Native <dialog> Reader + Nachbar-Navigation
    console.log('👉 Öffne ersten Treffer im Dokumenten-Reader...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Im Dokument öffnen')
      );
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    const drawerInfo = await page.evaluate(() => {
      const dlg = document.querySelector('dialog');
      const titleEl = document.querySelector('[data-testid="drawer-paragraph-title"]');
      const hasPrevNext =
        document.body.innerText.includes('Vorheriger') && document.body.innerText.includes('Nächster');
      return {
        isOpen: Boolean(dlg && dlg.open),
        title: titleEl?.textContent,
        hasPrevNext,
      };
    });
    console.log('📖 Drawer-Status:', JSON.stringify(drawerInfo));
    if (!drawerInfo.isOpen || !drawerInfo.hasPrevNext) {
      throw new Error('CitationDrawer <dialog> oder Vorheriger/Nächster-Navigation fehlt!');
    }
    await page.screenshot({ path: path.join(projectRoot, 'scripts', 'screenshot-3-paragraphen-reader.png') });

    // Drawer schließen
    await page.evaluate(() => {
      const dlg = document.querySelector('dialog');
      if (dlg) dlg.close();
    });
    await new Promise((r) => setTimeout(r, 300));

    // 4. Gesetzeskatalog (61 Dokumente) prüfen
    console.log('👉 Wechsle in den Gesetzeskatalog...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Gesetzeskatalog')
      );
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 500));
    const docCountText = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Alle Dokumente')
      );
      return btn?.innerText || '';
    });
    console.log('📚 Katalog-Button:', docCountText);
    await page.screenshot({ path: path.join(projectRoot, 'scripts', 'screenshot-4-gesetzeskatalog.png') });

    if (errors.length > 0) {
      console.warn('⚠️ Konsolen-/Seitenfehler:', errors);
    }
    console.log('🎉 BROWSER-VERIFIKATION ERFOLGREICH!');
  } finally {
    if (browser) await browser.close();
    await server.close();
  }
}

runVerification().catch((err) => {
  console.error('❌ FEHLER:', err);
  process.exit(1);
});
