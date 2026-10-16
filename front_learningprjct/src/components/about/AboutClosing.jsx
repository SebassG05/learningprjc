/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Cierre: salida clara hacia un curso (la acción «Comenzar ahora» de la home y los cursos) y, como salida
// secundaria, el contacto; sobre el horizonte con la luz de amanecer de la home, que enlaza con el pie.
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Horizon from '../ui/Horizon';
import SplitText from '../ui/SplitText';
import { preloadAuthModal } from '../auth/loadAuthModal';
import { CLOSING } from './aboutCopy';

const link = 'rounded-sm text-brand-300 underline underline-offset-4 hover:text-brand-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-300';

export default function AboutClosing({ onStart, className = '' }) {
  return (
    <section className={`relative isolate overflow-hidden ${className}`}>
      <div aria-hidden="true" className="about-horizon pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[22rem] sm:h-[26rem]">
        <Horizon atmosphereClassName="top-[18%] h-[22rem] w-[150vw]" planetClassName="top-[52%] w-[max(260vw,150rem)]" fadeClassName="h-32" />
      </div>

      <div className="mx-auto flex max-w-3xl flex-col items-center px-gutter pb-36 text-center sm:pb-44">
        <SplitText as="h2" className="block text-balance text-title-1 font-bold text-ink">{CLOSING.title}</SplitText>
        <div className="mt-10 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button size="lg" className="text-button-lg shadow-glow-lg" onClick={onStart} onPointerEnter={preloadAuthModal} onFocus={preloadAuthModal}>
            {CLOSING.start} <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Button>
          <Button size="lg" variant="secondary" className="text-button-lg" to="/cursos">
            {CLOSING.courses}
          </Button>
        </div>
        {/* Salida secundaria: colaborar o resolver dudas */}
        <p className="mt-12 max-w-[52ch] text-pretty text-base text-gray-300">
          {CLOSING.contactLead} Escríbenos a{' '}
          <a href={CLOSING.emailHref} className={link}>
            {CLOSING.email}
          </a>{' '}
          o rellena nuestro{' '}
          <Link to="/contacto" className={link}>
            formulario de contacto
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
