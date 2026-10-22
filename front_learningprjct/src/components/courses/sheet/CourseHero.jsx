/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BookOpen, Clock, Lock } from 'lucide-react';
import useMediaQuery from '../../../hooks/useMediaQuery';
import { useScenesEnabled } from '../../../hooks/useScene';
import { glideToHash } from '../../../lib/smoothScroll';
import { cloudinarySrcSet, cloudinaryUrl } from '../../../lib/cloudinary';
import { ease } from '../../../lib/motion';
import { ENROLL, PRIVATE, SHEET } from '../coursesCopy';
import { courseHours, courseLanguages, courseSummary, formatHours, levelLabel, topicCount } from '../courseFormat';
import { STATS } from '../coursesCopy';
import EnrollButton from './EnrollButton';
import LanguageToggle from './LanguageToggle';

const COVER_WIDTHS = [640, 960, 1280, 1920];
// Escritorio: la portada ocupa la derecha y se funde hacia el texto (izquierda) y hacia abajo.
// Muchas portadas son capturas con texto: así el titular nunca queda encima de otras letras.
const VEIL = 'linear-gradient(to top, var(--color-canvas) 0%, transparent 45%)';
const COVER_MASK = 'lg:[mask-image:linear-gradient(to_right,transparent,black_40%)]';
const HALO = {
  background: 'radial-gradient(80% 70% at 20% 0%, color-mix(in oklab, var(--color-night-teal) 85%, transparent), transparent 70%)',
};

function Pill({ children, tone = 'ink' }) {
  return (
    <li className={`inline-flex items-center gap-1.5 rounded-full bg-canvas/60 px-3.5 py-1.5 text-footnote font-medium ring-1 ring-inset ring-line-strong ${tone === 'dawn' ? 'text-dawn' : 'text-ink'}`}>
      {children}
    </li>
  );
}

// Escena 1 · Portada. En lg+ la imagen ocupa el fondo y, al bajar, crece un 6 % y el velo se cierra
// (solo transform/opacity y solo con puntero fino). En móvil el texto llena la primera pantalla y la
// portada va debajo (también en tablet, sin anchura para texto e imagen a la vez): si asomara arriba, la imagen (que llega tras el JS y la API) sería el LCP.
// `notice`: aviso de curso privado bajo el botón (acceso por invitación, plaza reservada, solo lectura)
export default function CourseHero({ course, title, description, lang, onLang, bilingual, areaName, cta, ctaRef, notice = null }) {
  const ref = useRef(null);
  const scenes = useScenesEnabled();
  const fine = useMediaQuery('(pointer: fine)');
  const linked = scenes && fine;
  // La portada solo es el LCP en lg+ (de fondo); en móvil y tablet va bajo el texto, fuera de la primera pantalla
  const coverFirst = useMediaQuery('(min-width: 1024px)');
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const dim = useTransform(scrollYProgress, [0, 0.9], [0.25, 0.7]);

  const hours = courseHours(course);
  const topics = topicCount(course);
  const level = levelLabel(course.nivel);
  const langs = courseLanguages(course).map((l) => SHEET.languageNames[l]);
  const tags = (course.category ?? []).slice(0, 3);
  const titleSize = title.length > 48 ? 'text-title-1' : 'text-display';

  return (
    <section ref={ref} aria-labelledby="curso-titulo" className="relative isolate flex flex-col lg:min-h-[min(90svh,58rem)] lg:justify-end">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[40rem] lg:hidden" style={HALO} />

      <div className="order-1 mx-auto flex min-h-[calc(100svh-var(--spacing-header))] w-full max-w-site flex-col justify-center px-gutter pb-12 pt-8 lg:min-h-0 lg:pb-20 lg:pt-40 lg:[&>*]:max-w-[54%]">
        <nav aria-label="Ruta de navegación" className="text-callout text-ink-2">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link to="/cursos" className="-my-3 inline-block py-3 hover:text-ink">{SHEET.breadcrumb}</Link>
            </li>
            {areaName ? (
              <>
                <li aria-hidden="true" className="text-ink-3">/</li>
                <li>
                  <Link to={`/cursos?area=${course.area}`} className="-my-3 inline-block py-3 hover:text-ink">{areaName}</Link>
                </li>
              </>
            ) : null}
          </ol>
        </nav>

        {tags.length > 0 ? <p className="eyebrow mt-6 text-brand-300">{tags.join(' · ')}</p> : null}
        <h1 id="curso-titulo" lang={lang} className={`mt-4 font-bold text-ink ${titleSize}`}>{title}</h1>
        {description ? <p lang={lang} className="mt-6 max-w-2xl text-lg text-ink-2">{courseSummary(description)}</p> : null}

        <ul className="mt-8 flex flex-wrap gap-2" aria-label="Datos del curso">
          {course.accessMode === 'private' ? (
            <Pill tone="dawn">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              {PRIVATE.badge}
            </Pill>
          ) : null}
          {!course.isOpen && course.accessMode !== 'private' ? (
            <Pill tone="dawn">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {ENROLL.comingSoon}
            </Pill>
          ) : null}
          {hours ? <Pill>{formatHours(hours)}</Pill> : null}
          {topics > 0 ? <Pill>{`${topics} ${STATS.topics(topics)}`}</Pill> : null}
          {level ? <Pill>{`${SHEET.facts.level} ${level.toLowerCase()}`}</Pill> : null}
          {!bilingual && langs.length > 0 ? <Pill>{langs.join(' · ')}</Pill> : null}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <EnrollButton ref={ctaRef} {...cta} />
          {topics > 0 ? (
            <a
              href="#temario"
              onClick={(e) => {
                e.preventDefault();
                glideToHash('#temario');
              }}
              className="inline-flex h-14 items-center rounded-full px-6 font-semibold text-ink ring-1 ring-inset ring-line-strong hover:bg-white/[0.06]"
            >
              {SHEET.seeSyllabus}
            </a>
          ) : null}
          {bilingual ? <LanguageToggle value={lang} onChange={onLang} /> : null}
        </div>
        {notice}
      </div>

      {/* Portada: un único <img>. Fondo en lg+, tarjeta bajo el texto en móvil y tablet */}
      <figure className={`order-2 mx-gutter mb-8 overflow-hidden rounded-3xl bg-surface-2 lg:absolute lg:inset-y-0 lg:left-[46%] lg:right-0 lg:-z-10 lg:m-0 lg:rounded-none lg:bg-transparent ${COVER_MASK}`}>
        <motion.div
          initial={{ scale: 1.04 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: ease.outExpo }}
          className="relative aspect-[16/10] lg:absolute lg:inset-0 lg:aspect-auto"
        >
          {course.image ? (
            <motion.img
              src={cloudinaryUrl(course.image, 1280)}
              srcSet={cloudinarySrcSet(course.image, COVER_WIDTHS)}
              sizes="(min-width: 1024px) 60vw, 92vw"
              width={1600}
              height={1000}
              alt={SHEET.coverAlt(title)}
              // React 18 solo pasa el atributo en minúsculas (fetchPriority es de React 19)
              {...{ fetchpriority: coverFirst ? 'high' : 'auto' }}
              loading={coverFirst ? 'eager' : 'lazy'}
              decoding="async"
              style={linked ? { scale } : undefined}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-brand/60">
              <BookOpen className="h-12 w-12" aria-hidden="true" />
            </div>
          )}
        </motion.div>
        <div aria-hidden="true" className="absolute inset-0 hidden lg:block" style={{ background: VEIL }} />
        {/* La portada queda de fondo (25 % de velo) y se cierra al bajar */}
        <motion.div aria-hidden="true" className="absolute inset-0 hidden bg-canvas lg:block" style={{ opacity: linked ? dim : 0.25 }} />
      </figure>
    </section>
  );
}
