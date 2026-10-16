/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Cierre: salida clara (la acción «Comenzar ahora» de la home y los cursos) y el contacto de siempre,
// sobre el horizonte con la luz de amanecer de la home, que enlaza con el pie.
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import SplitText from '../ui/SplitText';
import { preloadAuthModal } from '../auth/loadAuthModal';
import { CLOSING } from './aboutCopy';

const link = 'rounded-sm text-brand-300 underline underline-offset-4 hover:text-brand-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-300';

export default function AboutClosing({ onStart, className = '' }) {
  return (
    <section className={`relative isolate overflow-hidden ${className}`}>
      <div aria-hidden="true" className="about-horizon pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[22rem] sm:h-[26rem]">
        <div className="about-dawn absolute left-1/2 top-[18%] h-[22rem] w-[150vw] -translate-x-1/2" />
        <div className="about-planet absolute left-1/2 top-[52%] aspect-square w-[max(260vw,150rem)] -translate-x-1/2 rounded-full" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent to-canvas" />
      </div>

      <div className="mx-auto flex max-w-3xl flex-col items-center px-gutter pb-36 text-center sm:pb-44">
        <SplitText as="h2" className="block text-balance text-title-1 font-bold text-ink">{CLOSING.title}</SplitText>
        <p className="mt-6 max-w-[52ch] text-pretty text-lg text-gray-200">
          Escríbenos a{' '}
          <a href={CLOSING.emailHref} target="_blank" rel="noopener noreferrer" title={CLOSING.emailTitle} className={link}>
            {CLOSING.email}
          </a>{' '}
          o rellena nuestro{' '}
          <Link to="/contacto" className={link}>
            formulario de contacto
          </Link>
          .
        </p>
        <div className="mt-10 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button size="lg" className="text-button-lg shadow-glow-lg" onClick={onStart} onPointerEnter={preloadAuthModal} onFocus={preloadAuthModal}>
            {CLOSING.start} <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Button>
          <Button size="lg" variant="secondary" className="text-button-lg" to="/cursos">
            {CLOSING.courses}
          </Button>
        </div>
      </div>
    </section>
  );
}
