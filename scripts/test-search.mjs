import puppeteer from 'puppeteer';
import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function testSearchDirect() {
  const server = await createServer({
    configFile: path.join(projectRoot, 'vite.config.ts'),
    server: { port: 5189 },
  });
  await server.listen();

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('  [BROWSER]', msg.text()));

  await page.goto('http://localhost:5189', { waitUntil: 'networkidle0' });

  // Type query into search input
  console.log('Typing search query...');
  await page.type('input[type="text"]', 'Darf ich einen Schüler suspendieren § 51');
  await page.keyboard.press('Enter');

  console.log('Waiting for response view...');
  await page.waitForFunction(
    () => document.body.innerText.includes('Schnelles Praxis-Fazit') || document.body.innerText.includes('Stufe 1'),
    { timeout: 10000 }
  );

  console.log('Success! Capturing screenshot...');
  await page.screenshot({ path: path.join(projectRoot, 'scripts', 'test-search-success.png') });

  await browser.close();
  await server.close();
  console.log('Done!');
}

testSearchDirect().catch(e => {
  console.error(e);
  process.exit(1);
});
