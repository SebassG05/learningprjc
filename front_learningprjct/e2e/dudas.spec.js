// Recorrido de extremo a extremo de Dudas: alumna, profesora, profesor de otro curso, alumno de una
// edición terminada, admin e invitación de profesor. Contra el backend local de
// backend_learningprjct/scripts/e2e/dudasServer.mjs (Mongo en memoria, correo a un archivo) y el front
// construido con VITE_API_URL=http://localhost:8551. Nunca contra la API de producción: cualquier petición
// a otro host se aborta y la prueba falla si alguna iba a producción.
//
//   npx playwright test -c e2e/playwright.e2e.config.mjs
//
// Capturas (no se versionan): E2E_SHOTS_DIR o test-results/e2e-dudas-shots.
/* global process -- se ejecuta en Node (Playwright) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';

const here = path.dirname(fileURLToPath(import.meta.url));
const API = process.env.E2E_API_URL || 'http://localhost:8551';
const FRONT = 'http://localhost:5175';
const MAIL_LOG = path.resolve(here, '../../backend_learningprjct/scripts/e2e/.out/mails.jsonl');
const SHOTS = process.env.E2E_SHOTS_DIR || path.resolve(here, '../test-results/e2e-dudas-shots');

const DUDA = {
  titulo: '¿El carbono orgánico se mide igual en suelos calizos?',
  texto: 'En el tema 1 se habla del carbono del suelo, pero no me queda claro si en suelos calizos hay que separar el carbono inorgánico antes de medir.',
};
const RESPUESTA = 'Sí: en suelos calizos hay que eliminar los carbonatos (por ejemplo, con ácido) antes de medir el carbono orgánico.';
const AVISO_DUDA = 'Tu duda la verán los alumnos y profesores de este curso';

// ---------- utilidades ----------
let seed;
const prodHits = [];

async function api(pathname, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${API}${pathname}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* sin JSON */ }
  return { status: res.status, body: json };
}

async function apiLogin(email) {
  const r = await api('/api/users/login', { method: 'POST', body: { email, password: seed.password } });
  expect(r.status, `login de ${email}`).toBe(200);
  return r.body.token;
}

const readMails = () => {
  if (!fs.existsSync(MAIL_LOG)) return [];
  return fs.readFileSync(MAIL_LOG, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
};
const recipients = (m) => (Array.isArray(m.to) ? m.to : [m.to]).map((x) => (typeof x === 'string' ? x : x.address));

async function newUserContext(browser, { width = 1440, height = 900 } = {}) {
  const context = await browser.newContext({
    baseURL: FRONT,
    viewport: { width, height },
    locale: 'es-ES',
    serviceWorkers: 'block',
    reducedMotion: 'reduce',
  });
  // Sin banner de cookies (consentimiento ya dado: solo las necesarias)
  await context.addInitScript(() => {
    try {
      localStorage.setItem('evenortech_cookie_consent', 'true');
      localStorage.setItem('evenortech_cookie_consent_date', new Date().toISOString());
      localStorage.setItem('evenortech_cookie_preferences', JSON.stringify({ necessary: true, functional: false, analytics: false, marketing: false }));
    } catch { /* sin almacenamiento */ }
  });
  // Solo el front y el backend locales. Lo demás (fuentes, Google…) se aborta; producción, además, se apunta.
  await context.route('**/*', (route) => {
    const url = route.request().url();
    if (/^(data|blob):/.test(url)) return route.continue();
    const { hostname } = new URL(url);
    if (hostname === 'localhost' || hostname === '127.0.0.1') return route.continue();
    if (hostname.endsWith('evenor-tech.com')) prodHits.push(url);
    return route.abort();
  });
  return context;
}

// Acceso con el formulario real del modal (/login abre el modal de acceso)
async function fillLogin(page, email) {
  const form = page.locator('form').filter({ has: page.locator('#login-email') });
  await form.locator('#login-email').fill(email);
  await form.locator('#login-password').fill(seed.password);
  await form.locator('button[type="submit"]').click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('token')), { message: `sesión de ${email}` }).toBeTruthy();
}
async function loginUI(page, email) {
  await page.goto('/login');
  await fillLogin(page, email);
  await page.waitForURL((u) => new URL(u).pathname === '/');
}

const courseUrl = () => `/curso/${seed.courseId}`;
const temaDudas = (page) => page.locator('details.tema-dudas').first();

async function openTemaDudas(page) {
  const block = temaDudas(page);
  await block.scrollIntoViewIfNeeded();
  if (!(await block.evaluate((el) => el.open))) await block.locator('summary').click();
  await expect(block).toHaveJSProperty('open', true);
  await expect(block.getByText('Cargando las dudas…')).toHaveCount(0);
  return block;
}

async function openCourse(page) {
  await page.goto(courseUrl());
  await expect(page.getByRole('heading', { level: 1, name: seed.courseTitle })).toBeVisible();
}

// ---------- recorrido ----------
test.describe.configure({ mode: 'serial' });

let ana; // { context, page, token }
let laura;
let dudaId;
let inviteLink;

test.beforeAll(async ({ browser }) => {
  const r = await fetch(`${API}/__e2e/reset`, { method: 'POST' });
  expect(r.ok, 'reset del backend e2e').toBe(true);
  seed = await r.json();
  fs.mkdirSync(SHOTS, { recursive: true });

  const ctx = await newUserContext(browser);
  ana = { context: ctx, page: await ctx.newPage() };
});

test.afterAll(async () => {
  await ana?.context.close();
  await laura?.context.close();
  expect(prodHits, 'ninguna petición a producción').toEqual([]);
});

test('1. Ana pregunta una duda en el tema 1', async () => {
  const { page } = ana;
  await loginUI(page, seed.users.ana.email);
  ana.token = await page.evaluate(() => localStorage.getItem('token'));
  await openCourse(page);

  const block = await openTemaDudas(page);
  await expect(block.getByText('Aún no hay dudas sobre este tema.', { exact: false })).toBeVisible();

  await block.getByRole('button', { name: 'Preguntar una duda' }).click();
  await block.getByLabel('Título').fill(DUDA.titulo);
  await block.getByLabel('Tu duda').fill(DUDA.texto);

  // Aviso de privacidad visible y justo encima del botón de enviar
  const aviso = block.getByText(AVISO_DUDA, { exact: false });
  const publicar = block.getByRole('button', { name: 'Publicar' });
  await expect(aviso).toBeVisible();
  const [a, b] = [await aviso.boundingBox(), await publicar.boundingBox()];
  expect(a.y + a.height).toBeLessThanOrEqual(b.y);

  const created = page.waitForResponse((r) => r.url().endsWith(`/api/courses/${seed.courseId}/dudas`) && r.request().method() === 'POST');
  await publicar.click();
  expect((await created).status()).toBe(201);

  const item = block.locator('li[id^="duda-"]').filter({ hasText: DUDA.titulo });
  await expect(item).toBeVisible();
  await expect(item.getByText(/^Pendiente de respuesta · /)).toBeVisible();
  dudaId = (await item.getAttribute('id')).replace(/^duda-/, '');
  expect(dudaId).toMatch(/^[a-f0-9]{24}$/);
});

test('2. El aviso «Nueva duda en …» va solo a Laura', async () => {
  await expect.poll(() => readMails().filter((m) => m.subject.startsWith('Nueva duda en')).length).toBe(1);
  const mail = readMails().find((m) => m.subject.startsWith('Nueva duda en'));
  expect(recipients(mail)).toEqual([seed.users.laura.email]);
  const all = readMails().flatMap(recipients);
  expect(all).not.toContain(seed.users.oscar.email);
});

test('3. Laura responde desde «Mis dudas pendientes»', async ({ browser }) => {
  const ctx = await newUserContext(browser);
  laura = { context: ctx, page: await ctx.newPage() };
  const { page } = laura;
  await loginUI(page, seed.users.laura.email);

  await page.getByRole('button', { name: /Laura Pérez/ }).first().click();
  const menuItem = page.getByRole('button', { name: /Mis dudas pendientes/ });
  await expect(menuItem).toBeVisible();
  await expect(menuItem.getByLabel('1 pendientes')).toHaveText('1');
  await menuItem.click();
  await page.waitForURL('**/profesor/dudas');

  const item = page.locator(`li#duda-${dudaId}`);
  await expect(item.getByText(DUDA.titulo)).toBeVisible();
  await item.getByRole('button', { name: 'Responder' }).first().click();
  await item.getByLabel('Tu respuesta').fill(RESPUESTA);
  const answered = page.waitForResponse((r) => r.url().endsWith(`/api/dudas/${dudaId}/respuestas`) && r.request().method() === 'POST');
  await item.locator('form').getByRole('button', { name: 'Responder' }).click();
  expect((await answered).status()).toBe(201);

  const respuesta = item.locator('li').filter({ hasText: RESPUESTA });
  await expect(respuesta).toBeVisible();
  await expect(respuesta.getByText('Profesor', { exact: true })).toBeVisible();
  await expect(respuesta.getByText('Laura Pérez', { exact: true })).toBeVisible();
});

test('4. Ana recibe un único «… ha respondido a tu duda»', async () => {
  await expect.poll(() => readMails().filter((m) => m.subject.includes('ha respondido a tu duda')).length).toBe(1);
  const mail = readMails().find((m) => m.subject.includes('ha respondido a tu duda'));
  expect(recipients(mail)).toEqual([seed.users.ana.email]);
});

test('5. Ana ve «Respuesta nueva»; al abrirla se marca como vista', async () => {
  const { page } = ana;
  await openCourse(page);
  await expect(page.getByRole('link', { name: 'Dudas · 1 nuevas' })).toBeVisible();

  const block = temaDudas(page);
  await block.scrollIntoViewIfNeeded();
  await expect(block.locator('summary')).toContainText('Respuesta nueva');

  const vista = page.waitForResponse((r) => r.url().endsWith(`/api/dudas/${dudaId}/vista`) && r.request().method() === 'POST');
  await openTemaDudas(page);
  const item = block.locator(`li#duda-${dudaId}`);
  await expect(item.getByText('Respuesta nueva', { exact: true })).toBeVisible();
  await expect(item.getByText(/Pendiente de respuesta/)).toHaveCount(0);
  await expect(item.getByText(RESPUESTA)).toBeVisible();
  await expect(item.getByText('Profesor', { exact: true })).toBeVisible();
  expect((await vista).ok()).toBe(true);

  // Estado en el servidor: respondida
  const list = await api(`/api/courses/${seed.courseId}/dudas?temaId=${seed.temas[0]._id}`, { token: ana.token });
  expect(list.body.find((d) => d._id === dudaId).estado).toBe('respondida');

  // Capturas del bloque abierto (una duda con una respuesta del profesor)
  await block.screenshot({ path: path.join(SHOTS, 'dudas-tema-1440x900.png'), animations: 'disabled' });

  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: seed.courseTitle })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Dudas', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /nuevas/ })).toHaveCount(0);

  await page.setViewportSize({ width: 375, height: 812 });
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: seed.courseTitle })).toBeVisible();
  const mobileBlock = await openTemaDudas(page);
  await expect(mobileBlock.getByText(RESPUESTA)).toBeVisible();
  await mobileBlock.screenshot({ path: path.join(SHOTS, 'dudas-tema-375x812.png'), animations: 'disabled' });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/curso/${seed.courseId}/dudas`);
  await expect(page.getByRole('heading', { level: 1, name: 'Dudas del curso' })).toBeVisible();
  await expect(page.getByText(RESPUESTA)).toBeVisible();
  await page.screenshot({ path: path.join(SHOTS, 'curso-dudas-1440x900.png'), fullPage: true, animations: 'disabled' });
});

test('6. Óscar (profesor de otro curso) no puede moderar', async ({ browser }) => {
  const token = await apiLogin(seed.users.oscar.email);
  const patch = await api(`/api/dudas/${dudaId}/estado`, { method: 'PATCH', token, body: { accion: 'fijar' } });
  expect([403, 404]).toContain(patch.status);
  const after = await api(`/api/courses/${seed.courseId}/dudas`, { token: ana.token });
  expect(after.body.find((d) => d._id === dudaId).fijada).toBeFalsy();

  // En la interfaz no llega al aula del curso (ni, por tanto, a botones de moderar); en el suyo, como
  // profesor sin aceptación previa, se le piden las condiciones la primera vez
  const ctx = await newUserContext(browser);
  const page = await ctx.newPage();
  await loginUI(page, seed.users.oscar.email);
  await page.goto(courseUrl());
  await page.waitForURL(`**/curso/${seed.courseId}/inscripcion`);
  await expect(page.getByRole('button', { name: 'Fijar' })).toHaveCount(0);

  await page.goto(`/curso/${seed.otherCourseId}`);
  await expect(page.getByRole('heading', { level: 1, name: seed.otherCourseTitle })).toBeVisible();
  const terms = page.getByRole('dialog');
  await expect(terms).toBeVisible();
  await expect(terms.getByText('Condiciones actualizadas')).toBeVisible();
  await ctx.close();
});

test('7. Bruno (edición terminada) lee pero no publica', async ({ browser }) => {
  const ctx = await newUserContext(browser);
  const page = await ctx.newPage();
  await loginUI(page, seed.users.bruno.email);
  await openCourse(page);
  const block = await openTemaDudas(page);
  await expect(block.getByText('La edición ha terminado: puedes leer las dudas, pero no publicar.')).toBeVisible();
  await expect(block.getByRole('button', { name: 'Preguntar una duda' })).toHaveCount(0);
  await expect(block.locator(`li#duda-${dudaId}`).getByText(DUDA.titulo)).toBeVisible();
  await expect(block.locator(`li#duda-${dudaId}`).getByRole('button', { name: 'Responder' })).toHaveCount(0);

  const token = await page.evaluate(() => localStorage.getItem('token'));
  const post = await api(`/api/courses/${seed.courseId}/dudas`, {
    method: 'POST', token, body: { temaId: seed.temas[0]._id, titulo: 'Intento', texto: 'No debería poder publicar' },
  });
  expect(post.status).toBe(403);
  await ctx.close();
});

test('8. Ana retira su duda y la respuesta sigue visible', async () => {
  const { page } = ana;
  await openCourse(page);
  const block = await openTemaDudas(page);
  const item = block.locator(`li#duda-${dudaId}`);
  await item.getByRole('button', { name: 'Retirar' }).click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toContainText('¿Retirar esta duda?');
  const removed = page.waitForResponse((r) => r.url().endsWith(`/api/dudas/${dudaId}`) && r.request().method() === 'DELETE');
  await dialog.getByRole('button', { name: 'Retirar' }).click();
  expect((await removed).ok()).toBe(true);

  await expect(item.getByText('Duda retirada por su autor')).toBeVisible();
  await expect(item.getByText(DUDA.titulo)).toHaveCount(0);
  await expect(item.getByText(RESPUESTA)).toBeVisible();

  await page.reload();
  const again = await openTemaDudas(page);
  await expect(again.locator(`li#duda-${dudaId}`).getByText('Duda retirada por su autor')).toBeVisible();
  await expect(again.locator(`li#duda-${dudaId}`).getByText(RESPUESTA)).toBeVisible();
});

test('9. Admin: pestaña Dudas y alta de un profesor', async ({ browser }) => {
  const ctx = await newUserContext(browser);
  const page = await ctx.newPage();
  await loginUI(page, seed.users.admin.email);

  await page.goto('/admin/correcciones');
  await page.getByRole('tab', { name: /Dudas/ }).click();
  const panel = page.getByRole('tabpanel');
  const item = panel.locator(`li#duda-${dudaId}`);
  await expect(item).toBeVisible();
  await expect(item.getByText('Duda retirada por su autor')).toBeVisible();
  await expect(item.getByText(RESPUESTA)).toBeVisible();

  await page.getByRole('tab', { name: /Gestión de cursos/ }).click();
  await page.getByRole('button', { name: `Editar «${seed.courseTitle}»` }).click();
  const drawer = page.getByRole('dialog');
  await drawer.getByRole('radio', { name: 'Profesores' }).click();
  await expect(drawer.getByText(/Vinculado · Laura Pérez/)).toBeVisible();
  await drawer.getByLabel('Correo del profesor').fill(seed.users.marta.email);
  await drawer.getByRole('button', { name: 'Añadir' }).click();
  const fila = drawer.locator('li').filter({ hasText: seed.users.marta.email });
  await expect(fila).toBeVisible();
  await expect(fila.getByText(/Pendiente/)).toBeVisible();

  await expect.poll(() => readMails().filter((m) => m.subject.startsWith('Te han añadido como profesor del curso')).length).toBe(1);
  const mail = readMails().find((m) => m.subject.startsWith('Te han añadido como profesor del curso'));
  expect(mail.subject).toBe(`Te han añadido como profesor del curso ${seed.courseTitle}`);
  expect(recipients(mail)).toEqual([seed.users.marta.email]);
  const link = `${mail.text ?? ''} ${mail.html ?? ''}`.match(/http:\/\/localhost:5175\/profesor\/invitacion#token=[A-Za-z0-9_%-]+/);
  expect(link, 'enlace con el token en el fragmento').not.toBeNull();
  expect(`${mail.text ?? ''}${mail.html ?? ''}`).not.toMatch(/invitacion\?token=/);
  inviteLink = link[0];
  await ctx.close();
});

test('10. Marta activa la invitación y entra como profesora', async ({ browser }) => {
  expect(inviteLink).toBeTruthy();
  const ctx = await newUserContext(browser);
  const page = await ctx.newPage();
  const urls = [];
  page.on('framenavigated', (f) => f === page.mainFrame() && urls.push(f.url()));

  await page.goto(inviteLink);
  await expect(page.getByRole('heading', { level: 1, name: `Te invitan a ser profesor de ${seed.courseTitle}` })).toBeVisible();
  expect(page.url()).not.toContain('token');

  await page.getByRole('button', { name: 'Entrar para activar el acceso' }).click();
  await fillLogin(page, seed.users.marta.email);
  expect(page.url()).not.toContain('token');

  const redeemed = page.waitForResponse((r) => r.url().endsWith('/api/profesor/invitacion/canjear'));
  await page.getByRole('button', { name: 'Activar acceso de profesor' }).click();
  expect((await redeemed).status()).toBe(200);
  await page.waitForURL(`**/curso/${seed.courseId}`);
  await expect(page.getByRole('heading', { level: 1, name: seed.courseTitle })).toBeVisible();

  // Profesora nueva sin aceptación: primero las condiciones
  const terms = page.getByRole('dialog');
  await expect(terms).toBeVisible();
  const region = terms.getByRole('region', { name: 'Texto de las condiciones' });
  await expect(region.getByText(/Fin del documento/)).toBeAttached();
  await region.evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await terms.getByRole('checkbox').check();
  await terms.getByRole('button', { name: 'Aceptar y continuar' }).click();
  await expect(terms).toHaveCount(0);

  await expect(page.getByRole('note').filter({ hasText: 'Estás viendo el curso como profesor' })).toBeVisible();
  expect(page.url()).not.toContain('token');
  // Solo la carga del enlace llevaba el token (Chrome la notifica dos veces: confirmación y fragmento); en
  // cuanto la página lo lee, la barra queda sin él y ya no vuelve a aparecer
  const firstClean = urls.findIndex((u) => !u.includes('token'));
  expect(firstClean).toBeGreaterThan(0);
  expect(urls.slice(0, firstClean).every((u) => u === inviteLink)).toBe(true);
  expect(urls.slice(firstClean).filter((u) => u.includes('token'))).toEqual([]);
  await ctx.close();
});
