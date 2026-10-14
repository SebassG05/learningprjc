/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Titular de Contacto: habla a un alumno (cursos, matrícula, acceso, certificados).
import SplitText from '../ui/SplitText';

export default function ContactHero({ className = '' }) {
  return (
    <header className={className}>
      <p className="eyebrow">Contacto</p>
      <SplitText as="h1" trigger="mount" delay={0.1} className="mt-5 block text-contact font-bold text-ink">
        ¿Tienes una duda? <span className="text-brand-400">Te ayudamos.</span>
      </SplitText>
      <p className="mt-6 max-w-lg text-lg text-ink-2">
        Escríbenos sobre un curso, tu matrícula, el acceso a la plataforma o tu certificado. Te responde el
        equipo del campus.
      </p>
    </header>
  );
}
