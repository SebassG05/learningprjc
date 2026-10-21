// Lighthouse CI: build de pruebas (perf/scripts/build.mjs) servido junto a la API simulada.
// En CI:  npm run perf:build && npx lhci autorun
// Los umbrales salen del baseline (perf/baseline/REPORT.md) con margen para la variación entre ejecuciones.
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'node perf/scripts/serve.mjs',
      startServerReadyPattern: 'Local',
      startServerReadyTimeout: 60000,
      url: [
        'http://localhost:4173/',
        'http://localhost:4173/cursos',
        'http://localhost:4173/sobre',
        'http://localhost:4173/contacto',
        'http://localhost:4173/rese%C3%B1as',
      ],
      numberOfRuns: 3,
      settings: { onlyCategories: ['performance'], chromeFlags: '--headless=new --no-sandbox' },
    },
    assert: {
      aggregationMethod: 'median-run',
      assertions: {
        'categories:performance': ['error', { minScore: 0.75 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 6000 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'total-byte-weight': ['warn', { maxNumericValue: 800000 }],
      },
    },
    upload: { target: 'filesystem', outputDir: 'perf/runs/lhci' },
  },
};
