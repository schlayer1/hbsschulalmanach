import puppeteer from 'puppeteer';
import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function runVerification() {
  console.log('🚀 STARTE VOLLSTÄNDIGE BROWSER-VERIFIKATION AUF IPAD...');
  
  const server = await createServer({
    configFile: path.join(projectRoot, 'vite.config.ts'),
    server: { port: 5192 },
  });
  await server.listen();
  console.log('✅ Vite Testserver läuft auf Port 5192');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    // iPad Pro Viewport (1024x768 @ 2x Retina)
    await page.setViewport({ width: 1024, height: 768, deviceScaleFactor: 2 });

    await page.goto('http://localhost:5192', { waitUntil: 'networkidle0' });

    // 1. Startansicht prüfen
    const title = await page.title();
    console.log(`📄 Seitentitel: "${title}"`);
    await page.screenshot({ path: path.join(projectRoot, 'scripts', 'screenshot-1-ipad-home.png') });
    console.log('📸 Screenshot 1: Startbildschirm auf iPad');

    // 2. Recherche durchführen
    console.log('👉 Führe Rechtsrecherche durch: "Darf ich einen Schüler suspendieren § 51"...');
    await page.type('input[type="text"]', 'Darf ich einen Schüler suspendieren § 51');
    await page.click('button[type="submit"]');

    // Warten auf Antwortansicht
    await page.waitForFunction(
      () => document.body.innerText.includes('SCHNELLES PRAXIS-FAZIT') || document.body.innerText.includes('Stufe 1'),
      { timeout: 8000 }
    );
    console.log('✅ 3-Stufen-Praxisantwort gerendert!');
    await page.screenshot({ path: path.join(projectRoot, 'scripts', 'screenshot-2-antwort-stufe123.png') });
    console.log('📸 Screenshot 2: 3-Stufen-Antwort mit Paragraphenzitaten');

    // 3. Auf Merkzettel pinnen
    console.log('👉 Klicke "Auf Merkzettel"...');
    const bookmarkBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.includes('Auf Merkzettel'));
    });
    if (bookmarkBtn) {
      await bookmarkBtn.click();
      console.log('✅ Antwort erfolgreich auf Merkzettel gepinnt');
    }

    // 4. In-App Paragraphen-Reader (Drawer) öffnen
    console.log('👉 Öffne In-App Paragraphen-Reader für § 51...');
    const citationCard = await page.waitForSelector('.cursor-pointer');
    if (citationCard) {
      // Klicke auf die erste Fundstellen-Karte
      await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div')).filter(d => d.innerText.includes('§ 51 Abs.'));
        if (cards.length > 0) cards[0].click();
      });
      await new Promise(r => setTimeout(r, 600));
      await page.screenshot({ path: path.join(projectRoot, 'scripts', 'screenshot-3-paragraphen-reader.png') });
      console.log('📸 Screenshot 3: In-App Paragraphen-Reader (Drawer)');

      // Drawer schließen
      await page.evaluate(() => {
        const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Schließen'));
        if (closeBtn) closeBtn.click();
      });
      await new Promise(r => setTimeout(r, 400));
    }

    // 5. Tab Gesetzeskatalog testen
    console.log('👉 Wechsle in den Tab "Gesetzeskatalog"...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Gesetzeskatalog'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(projectRoot, 'scripts', 'screenshot-4-gesetzeskatalog.png') });
    console.log('📸 Screenshot 4: Gesetzeskatalog mit 12 Rechtsquellen');

    // 6. Tab Merkzettel testen
    console.log('👉 Wechsle in den Tab "Merkzettel"...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Merkzettel'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(projectRoot, 'scripts', 'screenshot-5-merkzettel.png') });
    console.log('📸 Screenshot 5: Merkzettel mit MDM-Backup-Funktion');

    console.log('🎉 BROWSER-VERIFIKATION ERFOLGREICH ABGESCHLOSSEN!');
  } finally {
    if (browser) await browser.close();
    await server.close();
  }
}

runVerification().catch(err => {
  console.error('❌ FEHLER:', err);
  process.exit(1);
});
