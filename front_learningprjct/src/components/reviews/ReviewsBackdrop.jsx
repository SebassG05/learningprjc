// Fondo de Reseñas: un cuaderno abierto en la penumbra. Pauta muy fina que se desvanece hacia abajo,
// la línea de margen en verde junto a la columna de lectura y una luz suave de ventana arriba a la
// izquierda. Habla de estudiar, no de espacio. Estático: solo CSS, sin coste en la primera carga.

export default function ReviewsBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -top-header -z-10 overflow-hidden lg:-top-header-lg">
      <div className="absolute inset-0 bg-canvas" />
      {/* Luz de ventana: entra en diagonal y se apaga antes del muro */}
      <div className="reviews-window absolute inset-x-0 top-0 h-[110dvh]" />
      {/* Pauta del cuaderno */}
      <div className="reviews-ruled absolute inset-x-0 top-0 h-[115dvh]" />
      {/* Línea de margen alineada con el contenido */}
      <div className="absolute inset-y-0 left-1/2 hidden w-full max-w-wide -translate-x-1/2 px-gutter sm:block">
        <div className="reviews-margin relative h-full" />
      </div>
      {/* Funde con el pie */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-canvas" />
      <div className="contact-grain absolute inset-0" />
    </div>
  );
}
