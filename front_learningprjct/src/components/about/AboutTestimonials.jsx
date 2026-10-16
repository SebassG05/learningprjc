/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Testimonios: citas estáticas (sin carrusel) con su idioma marcado y un enlace a las reseñas del campus.
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Reveal from '../ui/Reveal';
import SplitText from '../ui/SplitText';
import StarRating from '../reviews/StarRating';
import { REVIEWS_LINK, TESTIMONIALS, TESTIMONIALS_LANG, TESTIMONIALS_TITLE, initialsOf } from './aboutCopy';

export default function AboutTestimonials({ className = '' }) {
  return (
    <section className={className}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SplitText as="h2" className="block text-title-1 font-bold text-ink">{TESTIMONIALS_TITLE}</SplitText>
        <Link
          to={REVIEWS_LINK.to}
          className="group inline-flex items-center gap-2 self-start rounded-sm text-base font-semibold text-brand-300 underline-offset-4 hover:text-brand-200 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-300 sm:self-auto"
        >
          {REVIEWS_LINK.label}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out-expo group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>

      <Reveal group className="mt-12 grid grid-cols-1 gap-x-16 gap-y-12 sm:mt-16 md:grid-cols-2">
        {TESTIMONIALS.map((t) => (
          <Reveal.Item as="figure" key={t.name} className="border-t border-line-strong pt-8">
            <blockquote lang={TESTIMONIALS_LANG} className="max-w-[54ch] text-pretty text-lg text-gray-100">
              <p>“{t.text}”</p>
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-4">
              <span aria-hidden="true" className="about-monogram grid h-11 w-11 place-items-center rounded-full font-display text-sm font-bold text-brand-200">
                {initialsOf(t.name)}
              </span>
              <span className="flex flex-col gap-1">
                <cite className="text-base font-semibold not-italic text-ink">{t.name}</cite>
                <span className="flex items-center gap-2 text-sm text-gray-300">
                  {t.source}
                  <StarRating value={t.rating} size="h-3.5 w-3.5" label={`${t.rating} de 5 estrellas`} />
                </span>
              </span>
            </figcaption>
          </Reveal.Item>
        ))}
      </Reveal>
    </section>
  );
}
