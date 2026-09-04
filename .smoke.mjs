import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 420, height: 1400 } });
const errors = [];
p.on('pageerror', (e) => errors.push(String(e)));
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await p.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForTimeout(1500);

// Try to reach the client home (whatever entry flow exists)
const clientBtn = p.getByText('Je suis un client', { exact: false }).first();
if (await clientBtn.count()) {
  await clientBtn.click({ force: true }).catch(() => {});
  await p.waitForTimeout(800);
  const nameInput = p.getByPlaceholder('Votre prénom et nom');
  if (await nameInput.count()) {
    await nameInput.fill('Test Smoke').catch(() => {});
    await p.getByText("Commencer l'aventure", { exact: false }).first().click({ force: true }).catch(() => {});
  }
}
await p.waitForTimeout(1500);
await p.screenshot({ path: '.smoke-1-home.png' });

console.log('ERRORS after load:', JSON.stringify(errors, null, 2));
await b.close();
