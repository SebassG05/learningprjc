// Reseñas de ejemplo para ver la página llena en desarrollo (?demo=reviews&n=20).
// Solo se cargan con import() detrás de import.meta.env.DEV: nunca llegan al build de producción.

const SAMPLES = [
  ['María José Fernández de la Cruz', 5, 'El curso de modelización de carbono me ha cambiado la forma de trabajar. Los ejercicios prácticos están muy bien pensados y la corrección llegó rápido y con comentarios útiles.'],
  ['Luis Romero', 4, 'Muy útil y bien explicado. Me faltó algún ejemplo más del tema de inventarios.'],
  ['Ana García', 5, 'Claro, práctico y aplicable desde el primer día.'],
  ['Pedro Ruiz', 3, 'Correcto. El contenido está bien, pero el tema 3 se hace largo.'],
  ['Carmen Ortega', 5, 'Excelente.'],
  ['Javier Moreno', 4, 'Buen ritmo y una guía de usuario que ayuda mucho a empezar. El test final está bien planteado.'],
  ['Lucía Navarro', 5, 'Lo recomendaría a cualquiera que trabaje con suelos o con proyectos de sostenibilidad y quiera algo aplicado de verdad, no solo teoría.'],
  ['Andrés Vidal', 2, 'La plataforma a veces iba lenta al subir los ejercicios; el contenido, bien.'],
  ['Sofía Martín', 5, 'Me sirvió para cambiar de puesto en mi empresa. Gracias al equipo.'],
  ['Diego Herrera', 4, 'Material claro y bien organizado.'],
  ['Elena Castillo', 5, 'Repetiría sin dudarlo.'],
  ['Raúl Domínguez', 4, 'El certificado llegó enseguida y el soporte respondió en el día.'],
  ['Marta Gil', 5, 'Por fin un curso que no se queda en la teoría.'],
  ['Hugo Serrano', 3, 'Bien, aunque esperaba más ejercicios resueltos paso a paso.'],
  ['Irene Molina', 5, 'Las correcciones personalizadas marcan la diferencia.'],
  ['Pablo Ibáñez', 4, 'Muy recomendable para empezar.'],
  ['Nuria Delgado', 5, 'Contenido actualizado y con casos reales.'],
  ['Álvaro Rubio', 4, 'Me gustó poder ir a mi ritmo.'],
  ['Laura Méndez', 5, 'De lo mejor que he hecho este año.'],
  ['Sergio Cano', 4, 'Útil y directo.'],
];

const DAY = 24 * 3600 * 1000;

export default function demoReviews(count) {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const [user, rating, description] = SAMPLES[i % SAMPLES.length];
    return {
      _id: `demo-${i}`,
      user,
      rating,
      description,
      createdAt: new Date(now - (i * i * 1.7 + i * 0.6) * DAY - 3 * 3600 * 1000).toISOString(),
    };
  });
}
