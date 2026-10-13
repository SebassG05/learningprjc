/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Extra "Tarjetas flotantes" del boceto, en HTML (texto real y legible) sobre el lienzo.
// Los textos salen de las ventajas que ya muestra la home; no se inventan datos.
import { motion, useReducedMotion, useTransform } from 'framer-motion';
import { Award, Download } from 'lucide-react';
import { duration, ease } from '../../lib/motion';

const cards = [
  { Icon: Award, title: 'Certificado profesional', desc: 'Diploma Evenor-Tech al aprobar', className: 'left-[44%] top-[74%]', depth: -70, delay: 1.1 },
  { Icon: Download, title: 'Material técnico', desc: 'Descargable y disponible online', className: 'right-[4%] top-[58%]', depth: -40, delay: 1.3 },
];

const Card = ({ card, progress, reduce }) => {
  const y = useTransform(progress, [0, 0.3], [0, card.depth]);
  const opacity = useTransform(progress, [0.08, 0.22], [1, 0]);
  return (
    <motion.div style={reduce ? undefined : { y, opacity }} className={`absolute ${card.className}`}>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: duration.reveal, ease: ease.outExpo, delay: card.delay }}
        className="flex items-center gap-3.5 rounded-2xl py-3 pl-3 pr-5 glass-panel"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <card.Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="flex flex-col">
          <span className="text-callout font-semibold text-ink">{card.title}</span>
          <span className="text-footnote text-ink-2">{card.desc}</span>
        </span>
      </motion.div>
    </motion.div>
  );
};

export default function FloatingCards({ progress }) {
  const reduce = useReducedMotion();
  return (
    <div className="absolute inset-0 hidden lg:block">
      {cards.map((card) => <Card key={card.title} card={card} progress={progress} reduce={reduce} />)}
    </div>
  );
}
