// Registro con contraseña y confirmación del correo con el código, de extremo a extremo.
// Mismo backend local que dudas.spec.js (scripts/e2e/dudasServer.mjs: Mongo en memoria, correo a un
// archivo) y el front construido con VITE_API_URL=http://localhost:8551. Nunca contra producción.
//
//   npx playwright test -c e2e/playwright.e2e.config.mjs verificarCorreo
/* global process -- se ejecuta en Node (Playwright) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';

const here = path.dirname(fileURLToPath(import.meta.url));
const API = process.env.E2E_API_URL || 'http://localhost:8551';
const MAIL_LOG = path.resolve(here, '../../backend_learningprjct/scripts/e2e/.out/mails.jsonl');
const SHOTS = process.env.E2E_SHOTS_DIR || path.resolve(here, '../test-results/e2e-verificar-shots');
const PASS = 'Secreta-2026';

const readMails = () => (fs.existsSync(MAIL_LOG)
  ? fs.readFileSync(MAIL_LOG, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
  : []);
const codesFor = (email) => readMails().filter((m) => m.to === email).map((m) => /^(\d{6}) /.exec(m.subject)?.[1]).filter(Boolean);
const lastCode = async (email, count) => {
  await expect.poll(() => codesFor(email).length, { message: `correo con código para ${email}` }).toBeGreaterThanOrEqual(count);
  return codesFor(email).at(-1);
};
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, `${name}.png`) });

const prodHits = [];
test.beforeAll(async () => {
  const r = await fetch(`${API}/__e2e/reset`, { method: 'POST' });
  expect(r.ok).toBeTruthy();
  fs.mkdirSync(SHOTS, { recursive: true });
});
test.afterAll(() => expect(prodHits, 'ninguna petición a producción').toEqual([]));

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      localStorage.setItem('evenortech_cookie_consent', 'true');
      localStorage.setItem('evenortech_cookie_consent_date', new Date().toISOString());
      localStorage.setItem('evenortech_cookie_preferences', JSON.stringify({ necessary: true, functional: false, analytics: false, marketing: false }));
    } catch { /* sin almacenamiento */ }
  });
  await context.route('**/*', (route) => {
    const url = route.request().url();
    if (/^(data|blob):/.test(url)) return route.continue();
    const { hostname } = new URL(url);
    if (hostname === 'localhost' || hostname === '127.0.0.1') return route.continue();
    if (hostname.endsWith('evenor-tech.com')) prodHits.push(url);
    return route.abort();
  });
});

const token = (page) => page.evaluate(() => localStorage.getItem('token'));

async function registrar(page, email) {
  await page.goto('/login');
  await page.getByRole('tab', { name: 'Registrarse' }).click();
  await page.locator('#register-name').fill('Marta Ruiz');
  await page.locator('#register-email').fill(email);
  await page.locator('#register-password').fill(PASS);
  await page.locator('#register-confirm').fill(PASS);
  await page.getByRole('button', { name: 'Registrarse', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Revisa tu correo' })).toBeVisible();
  await expect(page.locator('#register-name')).toHaveCount(0); // fin del cambio de panel
}

test('registro → código → sesión abierta; sin el código no hay sesión', async ({ page }) => {
  const email = 'marta@example.test';
  await registrar(page, email);
  await expect(page.getByText(email)).toBeVisible();
  await expect(page.locator('#verify-code')).toBeFocused();
  await expect(page.getByRole('button', { name: /Reenviar código en \d+ s/ })).toBeDisabled();
  expect(await token(page)).toBeNull();
  await shot(page, '01-revisa-tu-correo');

  const code = await lastCode(email, 1);
  const bad = code === '000000' ? '111111' : '000000';
  await page.locator('#verify-code').fill(bad);
  await page.getByRole('button', { name: 'Confirmar correo' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Te quedan 4 intentos' })).toBeVisible();
  await shot(page, '02-codigo-incorrecto');

  await page.locator('#verify-code').fill(`Código: ${code.slice(0, 3)} ${code.slice(3)}`); // pegado con texto y espacio
  await expect(page.locator('#verify-code')).toHaveValue(code);
  await page.getByRole('button', { name: 'Confirmar correo' }).click();
  await expect.poll(() => token(page), { message: 'sesión tras confirmar' }).toBeTruthy();
  await expect(page.getByRole('heading', { name: 'Revisa tu correo' })).toHaveCount(0);
  await shot(page, '03-dentro');
});

test('quien cierra sin confirmar y vuelve a entrar con su contraseña ve el paso del código', async ({ page }) => {
  const email = 'pedro@example.test';
  await registrar(page, email);
  await lastCode(email, 1);
  // Cierra el modal sin confirmar
  await page.getByRole('button', { name: 'Cerrar' }).click();
  await expect(page.getByRole('heading', { name: 'Revisa tu correo' })).toHaveCount(0);

  await page.goto('/login');
  const form = page.locator('form').filter({ has: page.locator('#login-email') });
  await form.locator('#login-email').fill(email);
  await form.locator('#login-password').fill(PASS);
  await form.locator('button[type="submit"]').click();
  await expect(page.getByRole('heading', { name: 'Revisa tu correo' })).toBeVisible();
  expect(await token(page)).toBeNull();
  await shot(page, '04-login-pendiente');

  // Dentro del minuto no se manda otro: el primer código sigue valiendo
  const code = await lastCode(email, 1);
  await page.locator('#verify-code').fill(code);
  await page.getByRole('button', { name: 'Confirmar correo' }).click();
  await expect.poll(() => token(page), { message: 'sesión tras confirmar' }).toBeTruthy();
});

test('en móvil el paso del código cabe sin desplazamiento lateral', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 740 });
  await registrar(page, 'lucia@example.test');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await shot(page, '05-movil');
});
