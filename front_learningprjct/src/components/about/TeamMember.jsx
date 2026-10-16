/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Persona del equipo: monograma con anillo de luz, nombre, cargo y LinkedIn.
// En móvil y tablet es una fila; en escritorio, una columna de la fila de cinco.
import { ArrowUpRight } from 'lucide-react';
import Reveal from '../ui/Reveal';
import { initialsOf } from './aboutCopy';

export default function TeamMember({ name, role, linkedin }) {
  return (
    <Reveal.Item as="li" className="grid grid-cols-[auto_1fr] items-center gap-x-5 border-b border-line py-5 first:border-t lg:grid-cols-1 lg:content-start lg:items-start lg:gap-y-5 lg:border-0 lg:py-0 lg:first:border-t-0">
      <span aria-hidden="true" className="about-monogram grid h-14 w-14 place-items-center rounded-full font-display text-lg font-bold text-brand-200 lg:h-16 lg:w-16">
        {initialsOf(name)}
      </span>
      <div className="min-w-0">
        <p className="text-base font-semibold text-ink">{name}</p>
        <p className="mt-1 text-sm text-gray-300">{role}</p>
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`LinkedIn de ${name} (se abre en una pestaña nueva)`}
          className="mt-2 inline-flex items-center gap-1 rounded-sm text-sm font-medium text-brand-300 underline-offset-4 hover:text-brand-200 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-300"
        >
          LinkedIn
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </Reveal.Item>
  );
}
