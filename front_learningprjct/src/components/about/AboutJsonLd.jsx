// Datos estructurados de la organización (JSON-LD). Solo datos reales que ya están en el frontend:
// nombre, URL, logo, correo del campus y perfiles sociales. Sin valoraciones ni cifras.
import { CAMPUS_EMAIL, SOCIAL_URLS } from '../../lib/site';

const ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Evenor-Tech Campus',
  url: 'https://campus.evenor-tech.com/',
  logo: 'https://res.cloudinary.com/dgbmy60sc/image/upload/v1768916537/cff7066b-a1cb-4456-8037-525c463c7100_u2rx1x-removebg-preview_irj1mg.png',
  email: CAMPUS_EMAIL,
  sameAs: Object.values(SOCIAL_URLS),
};

export default function AboutJsonLd() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION) }} />;
}
