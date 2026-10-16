/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../../ui/Reveal';
import { PROVISIONAL, SHEET } from '../coursesCopy';
import EnrollButton from './EnrollButton';

const HALO = {
  background: 'radial-gradient(60% 90% at 50% 100%, color-mix(in oklab, var(--color-night-teal) 80%, transparent), transparent 70%)',
};

// Escena 5 · Cierre: una última invitación (o el camino al aula si ya está inscrito)
const CourseClosing = forwardRef(function CourseClosing({ cta, comingSoon }, ref) {
  const { closingTitle, closingLead, comingSoonLead } = PROVISIONAL.sheet;
  return (
    <section aria-labelledby="curso-cierre" className="relative isolate overflow-hidden border-t border-line">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={HALO} />
      <Reveal className="mx-auto flex w-full max-w-site flex-col items-center px-gutter py-28 text-center lg:py-40">
        <h2 id="curso-cierre" className="max-w-3xl text-title-1 font-bold text-ink">{closingTitle}</h2>
        <p className="mt-5 max-w-xl text-lg text-ink-2">{comingSoon ? comingSoonLead : closingLead}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <EnrollButton ref={ref} {...cta} />
          <Link to="/cursos" className="inline-flex h-14 items-center rounded-full px-6 font-semibold text-ink-2 hover:bg-white/[0.06] hover:text-ink">
            {SHEET.backToList}
          </Link>
        </div>
      </Reveal>
    </section>
  );
});

export default CourseClosing;
