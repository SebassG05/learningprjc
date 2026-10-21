// Dispositivos emulados y condiciones de red. La CPU se frena con CDP (Emulation.setCPUThrottlingRate);
// la GPU NO se puede frenar por software: se usa la real del equipo (ver REPORT.md, «Limitaciones»).

export const NETWORK = {
  // Presets de Chrome DevTools / Lighthouse
  'slow-4g': { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8 * 0.9, uploadThroughput: (750 * 1024) / 8 * 0.9 },
  'fast-3g': { offline: false, latency: 562.5, downloadThroughput: (1.6 * 1024 * 1024) / 8 * 0.9, uploadThroughput: (750 * 1024) / 8 * 0.9 },
  none: null,
};

export const DEVICES = {
  // Android de gama media (Moto G Power, el de Lighthouse móvil): táctil, sin Lenis ni escenas fijadas
  movil: {
    label: 'Móvil gama media (412×823 @1.75x, táctil)',
    context: {
      viewport: { width: 412, height: 823 },
      deviceScaleFactor: 1.75,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
    },
    touch: true,
  },
  // Portátil modesto: 1366×768 a 1x, ratón (Lenis + escenas fijadas + globo en calidad alta)
  portatil: {
    label: 'Portátil modesto (1366×768 @1x, ratón)',
    context: { viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1 },
    touch: false,
  },
};

// Matriz del baseline: CPU 4x con Slow 4G y CPU 6x con Fast 3G (equipo más débil con peor red)
export const MATRIX = [
  { device: 'movil', cpu: 4, network: 'slow-4g' },
  { device: 'movil', cpu: 6, network: 'fast-3g' },
  { device: 'portatil', cpu: 4, network: 'slow-4g' },
  { device: 'portatil', cpu: 6, network: 'fast-3g' },
  // GPU débil: render por software (SwiftShader). Sus fps no son los de ningún equipo real, pero
  // escalan con el trabajo de GPU (shaders, resolución, backdrop-filter): sirven para comparar antes/después
  { device: 'portatil', cpu: 1, network: 'none', gpu: 'soft' },
  { device: 'movil', cpu: 1, network: 'none', gpu: 'soft' },
];

// Chrome instalado con la GPU real (SwiftShader pinta el globo a ~8 fps y falsea las cifras).
// PERF_CHANNEL=chromium usa el Chromium de Playwright (p. ej. en CI sin Chrome).
export function launchOptions(gpu = 'real') {
  const channel = process.env.PERF_CHANNEL || 'chrome';
  if (gpu === 'soft') return { headless: true, ...(channel === 'chromium' ? {} : { channel }), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] };
  return {
    headless: process.env.PERF_HEADED ? false : true,
    ...(channel === 'chromium' ? {} : { channel }),
    args: ['--enable-gpu', '--ignore-gpu-blocklist', ...(process.platform === 'win32' ? ['--use-angle=d3d11'] : [])],
  };
}

export const BASE_URL = process.env.PERF_BASE_URL || 'http://localhost:4173';
