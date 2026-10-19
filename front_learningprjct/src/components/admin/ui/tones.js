// Tonos de estado → clases de la paleta (@theme). Texto AA sobre surface/surface-2 en los cuatro.
export const TONE = {
  neutral: { text: 'text-ink-2', dot: 'bg-ink-3', badge: 'bg-white/[0.05] border-line-strong text-ink-2', ring: 'ring-ink-3/60' },
  dawn: { text: 'text-dawn', dot: 'bg-dawn', badge: 'bg-dawn/10 border-dawn/25 text-dawn', ring: 'ring-dawn/60' },
  brand: { text: 'text-brand-300', dot: 'bg-brand', badge: 'bg-brand/10 border-brand/25 text-brand-300', ring: 'ring-brand/60' },
  danger: { text: 'text-danger', dot: 'bg-danger', badge: 'bg-danger/10 border-danger/25 text-danger', ring: 'ring-danger/60' },
};

export const tone = (name) => TONE[name] ?? TONE.neutral;

// Anillo de foco común del panel
export const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400';
