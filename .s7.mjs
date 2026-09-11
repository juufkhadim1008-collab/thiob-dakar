import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 420, height: 900 } });
await p.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForTimeout(800);
const createBtn = p.getByText('Créer mon compte', { exact: false }).first();
await createBtn.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
await createBtn.click({ force: true }).catch(() => {});
await p.waitForTimeout(1000);
const nameInput = p.locator('input[type="text"]').first();
await nameInput.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
await nameInput.fill('Test User').catch(() => {});
const phoneInput = p.locator('input[type="tel"]').first();
await phoneInput.fill('771234567').catch(() => {});
const submit = p.locator('button[type="submit"], button:has-text("Continuer"), button:has-text("Commencer"), button:has-text("Valider"), button:has-text("Terminer")').first();
await submit.click({ force: true }).catch(() => {});
await p.waitForSelector('text=Recherche par plat', { timeout: 20000 }).catch(() => {});
await p.waitForTimeout(800);

async function shot(label, tabText) {
  await p.getByText(tabText, { exact: true }).first().click({ force: true }).catch(() => {});
  await p.waitForTimeout(900);
  await p.screenshot({ path: `.s7-${label}.png` });
}

await shot('livreur', 'Livreur');
await shot('commandes', 'Commandes');
await shot('favoris', 'Favoris');
await shot('profil', 'Profil');
await b.close();
