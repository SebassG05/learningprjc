/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { Children, Fragment, isValidElement } from 'react';
import { motion, useReducedMotion, useTransform } from 'framer-motion';
import { duration, ease, inView, stagger } from '../../lib/motion';

// Convierte el contenido (texto y spans con estilo) en una lista de palabras conservando el estilo de cada una.
function toWords(children) {
  const words = [];
  Children.forEach(children, (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      String(child).split(/(\s+)/).forEach((w) => { if (w.trim()) words.push({ text: w }); else if (w) words.push({ space: true }); });
    } else if (isValidElement(child)) {
      const inner = typeof child.props.children === 'string' ? child.props.children : '';
      inner.split(/(\s+)/).forEach((w) => {
        if (w.trim()) words.push({ text: w, className: child.props.className });
        else if (w) words.push({ space: true });
      });
    }
  });
  return words;
}

const wordVariants = {
  hidden: { y: '105%', opacity: 0 },
  show: { y: '0%', opacity: 1, transition: { duration: duration.reveal, ease: ease.outExpo } },
};

/**
 * Titular que se revela por palabras.
 * - Por defecto entra al aparecer en pantalla (`trigger="inView"`) o al montarse (`trigger="mount"`).
 * - Con `progress` (motion value 0→1) cada palabra se ilumina ligada al scroll (`from`→`to`).
 * El texto completo queda en un span sr-only; las palabras animadas van con aria-hidden.
 */
const SplitText = ({ as = 'span', children, className = '', trigger = 'inView', delay = 0, progress, from = 0, to = 1 }) => {
  const reduce = useReducedMotion();
  const words = toWords(children);
  const label = words.map((w) => (w.space ? ' ' : w.text)).join('');
  const Comp = motion[as];

  if (progress) {
    const count = words.filter((w) => !w.space).length;
    let i = -1;
    return (
      <Comp className={className}>
        <span className="sr-only">{label}</span>
        {words.map((w, k) => {
          if (w.space) return <Fragment key={k}> </Fragment>;
          i += 1;
          const start = from + ((to - from) * i) / count;
          return <ScrubWord key={k} progress={progress} start={start} end={start + (to - from) / count} word={w} />;
        })}
      </Comp>
    );
  }

  if (reduce) {
    return (
      <Comp className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: duration.slow, ease: ease.outExpo }}>
        {children}
      </Comp>
    );
  }

  const play = trigger === 'mount' ? { animate: 'show' } : { whileInView: 'show', viewport: inView };
  return (
    <Comp
      className={className}
      initial="hidden"
      {...play}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger.words, delayChildren: delay } } }}
    >
      <span className="sr-only">{label}</span>
      {words.map((w, k) =>
        w.space ? (
          <Fragment key={k}> </Fragment>
        ) : (
          <span key={k} aria-hidden="true" className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
            <motion.span variants={wordVariants} className={`inline-block will-change-transform ${w.className || ''}`}>
              {w.text}
            </motion.span>
          </span>
        )
      )}
    </Comp>
  );
};

// Palabra que pasa de atenuada a plena según el progreso del scroll
const ScrubWord = ({ progress, start, end, word }) => {
  const opacity = useTransform(progress, [start, end], [0.18, 1]);
  return (
    <motion.span aria-hidden="true" style={{ opacity }} className={`inline-block ${word.className || ''}`}>
      {word.text}
    </motion.span>
  );
};

export default SplitText;
