import puppeteer from 'puppeteer';
import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function debugSearch() {
  const server = await createServer({
    configFile: path.join(projectRoot, 'vite.config.ts'),
    server: { port: 5190 },
  });
  await server.listen();

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('  [BROWSER CONSOLE]', msg.text()));
  page.on('pageerror', err => console.error('  [BROWSER ERROR]', err.message));

  await page.goto('http://localhost:5190', { waitUntil: 'networkidle0' });

  // Input query and submit form
  console.log('Finde Formular und sende Anfrage ab...');
  await page.type('input[type="text"]', 'Darf ich einen Schüler suspendieren § 51');
  
  // Click submit button
  await page.click('button[type="submit"]');

  // Wait 2 seconds
  await new Promise(r => setTimeout(r, 2000));

  const text = await page.evaluate(() => document.body.innerText);
  console.log('Body Text nach 2 Sekunden:');
  console.log('='.repeat(50));
  console.log(text);
  console.log('='.repeat(50));

  await page.screenshot({ path: path.join(projectRoot, 'scripts', 'debug-body.png') });

  await browser.close();
  await server.close();
}

debugSearch().catch(console.error);
