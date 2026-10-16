// ════════════════════════════════════════════════════════════════════════════════
//  PENDIENTE DE REVISIÓN LEGAL
//  Plantilla de los términos que el alumno acepta antes de inscribirse en un curso.
//  Es el ÚNICO sitio donde vive este texto: el front lo pide a GET /api/terms/current.
//
//  Para publicar una versión nueva:
//    1. Cambia el texto de `sections`.
//    2. Sube `version` (p. ej. '1.0' → '1.1') y pon la fecha en `updatedAt`.
//  Con una versión nueva, a todos los alumnos (también a los ya inscritos) se les vuelve
//  a pedir la aceptación antes de inscribirse o de acceder al material.
// ════════════════════════════════════════════════════════════════════════════════

export const TERMS = Object.freeze({
  version: '1.0',
  updatedAt: '2026-10-16',
  status: 'PENDIENTE DE REVISIÓN LEGAL',
  title: 'Confidencialidad, propiedad intelectual y competencia desleal',
  intro:
    'Estas son las condiciones de uso del material del curso. Al aceptarlas te comprometes a cumplirlas mientras dure tu acceso al curso y después.',
  sections: [
    {
      heading: '1. Uso personal y formativo',
      paragraphs: [
        'El material del curso (textos, documentos, presentaciones, vídeos, ejercicios, tests y cualquier otro recurso) se pone a tu disposición únicamente para tu formación personal, mientras dure tu inscripción.',
        'Tu acceso es personal e intransferible: no puedes compartir tu cuenta ni facilitar el acceso al material a otras personas.',
      ],
    },
    {
      heading: '2. Propiedad intelectual',
      paragraphs: [
        'El temario y todo el material del curso son propiedad de Evenor-Tech o de sus autores y están protegidos por la normativa de propiedad intelectual. Inscribirte no te transmite ningún derecho sobre ellos más allá del uso descrito en el punto 1.',
      ],
    },
    {
      heading: '3. Lo que no está permitido',
      paragraphs: [
        'Descargar, copiar, grabar, capturar, reproducir, distribuir, publicar o redistribuir el material, total o parcialmente, por cualquier medio.',
        'Revender el material o utilizarlo con fines comerciales.',
        'Utilizar el temario para impartir formación a terceros o para elaborar cursos, materiales o servicios que compitan con los de Evenor-Tech.',
      ],
    },
    {
      heading: '4. Confidencialidad',
      paragraphs: [
        'El material es confidencial. Te comprometes a no revelar su contenido a terceros y a protegerlo con la misma diligencia con la que protegerías tu propia información confidencial.',
        'Para proteger el temario, los documentos pueden incluir una marca de agua con tu identificación, que permite rastrear el origen de cualquier copia no autorizada.',
      ],
    },
    {
      heading: '5. Competencia desleal',
      paragraphs: [
        'El uso del material para obtener una ventaja competitiva frente a Evenor-Tech, o para beneficiar a un competidor, se considerará un acto de competencia desleal.',
      ],
    },
    {
      heading: '6. Consecuencias del incumplimiento',
      paragraphs: [
        'El incumplimiento de estas condiciones supondrá la baja inmediata en el curso y la pérdida del acceso al material, sin derecho a reembolso.',
        'Evenor-Tech podrá emprender las acciones legales que correspondan, incluida la reclamación de los daños y perjuicios causados.',
      ],
    },
    {
      heading: '7. Registro de la aceptación',
      paragraphs: [
        'Al aceptar, guardamos la versión de estas condiciones, la fecha y hora, tu dirección IP y el navegador desde el que aceptas, como prueba de tu consentimiento.',
      ],
    },
  ],
});
