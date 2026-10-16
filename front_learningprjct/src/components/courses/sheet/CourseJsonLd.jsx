/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { SITE_NAME, SITE_URL } from '../../../lib/site';
import { courseHours } from '../courseFormat';

// Datos estructurados (schema.org/Course) para que el curso salga bien en buscadores
export default function CourseJsonLd({ course, title, description }) {
  const hours = courseHours(course);
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: title,
    description,
    url: `${SITE_URL}/curso/${course._id}/inscripcion`,
    inLanguage: course.idiomasDisponibles?.length ? course.idiomasDisponibles : ['es'],
    ...(course.image ? { image: course.image } : {}),
    ...(course.category?.length ? { keywords: course.category.join(', ') } : {}),
    ...(course.nivel ? { educationalLevel: course.nivel } : {}),
    ...(hours ? { timeRequired: `PT${Math.round(hours)}H` } : {}),
    ...(course.profesor?.nombre ? { instructor: { '@type': 'Person', name: course.profesor.nombre } } : {}),
    provider: { '@type': 'EducationalOrganization', name: SITE_NAME, url: SITE_URL },
  };
  // JSON.stringify no escapa «</script>»: se neutraliza «<» para que el bloque no se pueda cerrar
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
