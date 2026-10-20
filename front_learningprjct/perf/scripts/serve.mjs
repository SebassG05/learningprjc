// Sirve el build de pruebas (dist-perf) y la API simulada a la vez. Lo usa Lighthouse CI
// (startServerCommand) y sirve para medir a mano: node perf/scripts/serve.mjs
import { spawn } from 'node:child_process';

const procs = [
  spawn('node', ['tests/fixtures/mock-api.mjs'], { stdio: 'inherit', shell: true }),
  spawn('npx', ['vite', 'preview', '--outDir', 'dist-perf', '--port', '4173', '--strictPort'], { stdio: 'inherit', shell: true }),
];
const stop = () => { procs.forEach((p) => p.kill()); process.exit(0); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
procs.forEach((p) => p.on('exit', (code) => { if (code) { console.error('servidor caído', code); stop(); } }));
