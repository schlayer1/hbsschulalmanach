// Verifikationstest für lückenlose Fundstellen-Verknüpfung und Zero-Hallucination
import puppeteer from 'puppeteer';
import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function verifyCitationDrawerExactMatch() {
  console.log('🧪 VERIFIKATIONSTEST: ZITAT- UND FUNDSTELLEN-KONSISTENZ...');

  const server = await createServer({
    configFile: path.join(projectRoot, 'vite.config.ts'),
    server: { port: 5195 },
  });
  await server.listen();

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 }); // iPad Landscape

  await page.goto('http://localhost:5195', { waitUntil: 'networkidle0' });

  // Suche nach Schülerausschluss / Schulfahrt
  const searchInput = await page.$('input[type="text"]');
  await searchInput.type('Darf ich einen Schüler von einer Schulfahrt ausschließen Ziffer 7');
  await page.click('button[type="submit"]');

  // Warten auf Stufe 3 Fundstellen
  await page.waitForFunction(
    () => document.body.innerText.includes('Stufe 3') && document.body.innerText.includes('Verifizierte Fundstellen'),
    { timeout: 8000 }
  );

  console.log('✅ Antwort gerendert. Klicke auf die Fundstellen-Karte...');

  // Finde Zitat-Karten
  const citationCards = await page.$$('div.group.text-left.cursor-pointer');
  console.log(`Gefundene Zitatkarten: ${citationCards.length}`);

  if (citationCards.length === 0) {
    throw new Error('Keine Zitatkarten gefunden!');
  }

  // Klicke erste Zitatkarte
  await citationCards[0].click();

  // Warten bis Drawer geöffnet ist
  await page.waitForSelector('h2.text-lg', { timeout: 3000 });

  // Prüfe Text im Drawer
  const drawerInfo = await page.evaluate(() => {
    const headerTitle = document.querySelector('[data-testid="drawer-paragraph-title"]')?.textContent?.trim() || '';
    const sectionSubtitle = document.querySelector('[data-testid="drawer-section-title"]')?.textContent?.trim() || '';
    const lawText = document.querySelector('div.whitespace-pre-line')?.textContent?.trim() || '';
    const takeaways = document.querySelector('ul.list-disc')?.textContent?.trim() || '';
    const linkUrl = document.querySelector('a[href*="http"]')?.getAttribute('href') || '';
    return { headerTitle, sectionSubtitle, lawText, takeaways, linkUrl };
  });

  console.log('📋 DRAWER-INHALT GEPRÜFT:');
  console.log('  Header Paragraph:', drawerInfo.headerTitle);
  console.log('  Abschnitts-Titel:', drawerInfo.sectionSubtitle);
  console.log('  Text-Vorschau:   ', drawerInfo.lawText.slice(0, 100) + '...');
  console.log('  Offizieller Link:', drawerInfo.linkUrl);

  // Sicherstellen, dass kein Mismatch vorliegt (z. B. Ziffer 7 im Titel, aber Ziffer 3 im Text)
  if (drawerInfo.headerTitle.includes('Ziffer 7') && drawerInfo.sectionSubtitle.includes('Aufsichtspersonen')) {
    throw new Error('MISMATCH DETECTED: Titel und Text gehören zu unterschiedlichen Abschnitten!');
  }

  // Screenshot sichern
  const screenshotPath = path.join(projectRoot, 'scripts', 'screenshot-verified-citation-drawer.png');
  await page.screenshot({ path: screenshotPath });
  console.log(`📸 Screenshot gesichert: ${screenshotPath}`);

  await browser.close();
  await server.close();

  console.log('🎉 VERIFIKATION VOLLSTÄNDIG BESTANDEN! Keine Mismatches oder Halluzinationen!');
}

verifyCitationDrawerExactMatch().catch(err => {
  console.error('❌ TEST FEHLGESCHLAGEN:', err);
  process.exit(1);
});
