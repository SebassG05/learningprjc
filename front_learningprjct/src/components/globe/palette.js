import { Color } from 'three';

// Colores de la escena leídos de los tokens de index.css (boceto: solo brand-50…950,
// ink, surface-3 y canvas). Así el 3D no tiene hex propios.
const TOKENS = {
  brand100: '--color-brand-100',
  brand200: '--color-brand-200',
  brand300: '--color-brand-300',
  brand400: '--color-brand-400',
  brand500: '--color-brand-500',
  brand600: '--color-brand-600',
  brand700: '--color-brand-700',
  brand800: '--color-brand-800',
  brand900: '--color-brand-900',
  brand950: '--color-brand-950',
  ink: '--color-ink',
  ink3: '--color-ink-3',
  surface3: '--color-surface-3',
  canvas: '--color-canvas',
};

let cached = null;

export function getPalette() {
  if (cached) return cached;
  const styles = getComputedStyle(document.documentElement);
  cached = Object.fromEntries(
    Object.entries(TOKENS).map(([key, name]) => [key, new Color(styles.getPropertyValue(name).trim())]),
  );
  return cached;
}
