// Fondo de Reseñas: la página está "en órbita". El mismo cielo nocturno que Contacto (cielo,
// estrellas y grano compartidos), pero con el borde del planeta asomando arriba a la derecha y una
// órbita amplia que lo rodea, como la escena de reseñas de la home. Estático: CSS y SVG, sin WebGL.

export default function ReviewsBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -top-header -z-10 overflow-hidden lg:-top-header-lg">
      <div className="contact-sky absolute inset-0" />
      <div className="contact-stars absolute inset-x-0 top-0 h-[120dvh]" />
      <div className="contact-stars contact-stars-far absolute inset-x-0 top-0 h-[120dvh]" />

      {/* Borde del planeta con su atmósfera, fuera de la columna de lectura */}
      <div className="reviews-atmosphere absolute -right-[30rem] -top-[34rem] h-[64rem] w-[64rem] rounded-full sm:-right-[22rem]" />
      <div className="reviews-planet absolute -right-[26rem] -top-[30rem] h-[56rem] w-[56rem] rounded-full sm:-right-[18rem]" />

      {/* Órbita amplia alrededor del planeta */}
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMaxYMin slice" className="absolute inset-x-0 top-0 h-[100dvh] w-full" focusable="false">
        <defs>
          <linearGradient id="reviews-orbit-fade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="var(--color-brand-300)" stopOpacity="0" />
            <stop offset="0.45" stopColor="var(--color-brand-300)" stopOpacity="0.3" />
            <stop offset="1" stopColor="var(--color-brand-300)" stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <ellipse cx="1500" cy="40" rx="1050" ry="300" transform="rotate(-14 1500 40)" fill="none" stroke="url(#reviews-orbit-fade)" strokeWidth="1.2" strokeDasharray="2 9" strokeLinecap="round" />
      </svg>

      {/* Funde con el pie */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-canvas" />
      <div className="contact-grain absolute inset-0" />
    </div>
  );
}
