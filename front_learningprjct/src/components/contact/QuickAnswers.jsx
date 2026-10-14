/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Contenido del campus que ya resuelve muchas dudas, antes de tener que escribir.
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { QUICK_ANSWERS } from './contactInfo';

export default function QuickAnswers({ className = '' }) {
  return (
    <section aria-labelledby="contact-quick" className={className}>
      <h2 id="contact-quick" className="mb-2 font-sans text-sm font-medium text-ink-3">
        Quizá ya tengas la respuesta
      </h2>
      <ul className="divide-y divide-line border-y border-line">
        {QUICK_ANSWERS.map((item) => (
          <li key={item.to}>
            <Link to={item.to} className="group flex min-h-11 items-center justify-between gap-4 py-4">
              <span className="min-w-0">
                <span className="block font-semibold text-ink transition-colors duration-200 group-hover:text-brand-300">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-sm text-ink-2">{item.text}</span>
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200 ease-out-expo group-hover:translate-x-1 group-hover:text-brand-400"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
