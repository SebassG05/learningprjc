/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Clock, Lock } from 'lucide-react';
import { cloudinarySrcSet, cloudinaryUrl } from '../../lib/cloudinary';
import { spring } from '../../lib/motion';
import { CARD } from './coursesCopy';
import { courseMeta, courseText, levelLabel } from './courseFormat';

const IMG_WIDTHS = [400, 640, 800];
const IMG_SIZES = '(min-width: 1536px) 22rem, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw';
const MAX_TAGS = 3;

// Tarjeta del listado: lleva a la ficha (o al aula, si ya está inscrito en un curso abierto).
// Todo el área es el enlace del título (::after), así el lector de pantalla
// anuncia un solo enlace con su nombre. Hover solo con puntero fino: sube 4 px, la imagen crece
// un 3 % y el borde se ilumina con una capa que solo cambia de opacidad.
function CourseCard({ course, areaName, progress, eager = false, priority = false }) {
  const { title, description } = courseText(course);
  const level = levelLabel(course.nivel);
  const tags = course.category || [];
  const enrolled = progress != null;
  const pct = Math.round(progress?.progress ?? 0);
  const done = progress?.status === 'completed';

  return (
    // Sin whileTap: Framer añadiría tabindex="0" al artículo (una parada de teclado repetida).
    // La pulsación va por CSS cuando se pulsa su enlace.
    <motion.article
      whileHover={{ y: -4 }}
      transition={spring.snappy}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-card transition-[scale] duration-150 ease-out has-[a:active]:scale-[0.98]"
    >
      {/* Brillo de borde y sombra elevada: capas fijas que solo cambian de opacidad */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-3xl opacity-0 shadow-raised ring-1 ring-inset ring-line-strong transition-opacity duration-300 ease-out-expo group-hover:opacity-100 group-has-[:focus-visible]:opacity-100"
      />

      <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
        {course.image ? (
          <img
            src={cloudinaryUrl(course.image, 640)}
            srcSet={cloudinarySrcSet(course.image, IMG_WIDTHS)}
            sizes={IMG_SIZES}
            width={800}
            height={500}
            alt=""
            loading={eager ? 'eager' : 'lazy'}
            // React 18 solo pasa el atributo en minúsculas (fetchPriority es de React 19); el spread evita el aviso de lint
            {...{ fetchpriority: priority ? 'high' : 'auto' }}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand/70">
            <BookOpen className="h-10 w-10" aria-hidden="true" />
          </div>
        )}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {level ? (
            <span className="rounded-full bg-canvas/70 px-3 py-1 text-footnote font-semibold text-ink ring-1 ring-inset ring-line-strong">
              {level}
            </span>
          ) : null}
          {course.accessMode === 'private' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas/70 px-3 py-1 text-footnote font-semibold text-dawn ring-1 ring-inset ring-line-strong">
              <Lock className="h-3 w-3" aria-hidden="true" />
              {CARD.private}
            </span>
          ) : !course.isOpen ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas/70 px-3 py-1 text-footnote font-semibold text-dawn ring-1 ring-inset ring-line-strong">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {CARD.comingSoon}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-6">
        {areaName ? <p className="eyebrow text-brand-300">{areaName}</p> : null}
        <h3 className="text-title-3 font-semibold text-ink">
          <Link
            // Privado: siempre a la ficha, que sabe si su cohorte ya ha empezado y lleva al aula
            to={enrolled && course.isOpen && course.accessMode !== 'private' ? `/curso/${course._id}` : `/curso/${course._id}/inscripcion`}
            className="outline-none after:absolute after:inset-0 after:z-20 after:rounded-3xl focus-visible:after:ring-2 focus-visible:after:ring-brand-400"
          >
            {title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-callout text-ink-2">{description}</p>

        {tags.length > 0 ? (
          <ul className="mt-1 flex flex-wrap gap-1.5" aria-label="Etiquetas">
            {tags.slice(0, MAX_TAGS).map((tag) => (
              <li key={tag} className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-footnote font-medium text-ink-2">
                {tag}
              </li>
            ))}
            {tags.length > MAX_TAGS ? (
              <li className="rounded-full px-1.5 py-0.5 text-footnote font-medium text-ink-3">{CARD.moreTags(tags.length - MAX_TAGS)}</li>
            ) : null}
          </ul>
        ) : null}

        <div className="mt-auto pt-4">
          {enrolled ? (
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between text-footnote">
                <span className="text-ink-2">{done ? CARD.completed : CARD.progress}</span>
                <span className="font-semibold tabular-nums text-brand">{pct} %</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-surface-3" role="presentation">
                <div className="h-full origin-left rounded-full bg-brand" style={{ transform: `scaleX(${pct / 100})` }} />
              </div>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
            <span className="text-footnote font-medium text-ink-3">{courseMeta(course)}</span>
            <span className={`inline-flex shrink-0 items-center gap-1.5 text-callout font-semibold ${enrolled ? 'text-brand' : 'text-ink'}`} aria-hidden="true">
              {enrolled ? CARD.resume : CARD.view}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default memo(CourseCard);
