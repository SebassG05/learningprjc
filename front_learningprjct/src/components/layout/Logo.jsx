/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MotionLink = motion.create(Link);

// Logo "Evenor Tech | CAMPUS": se reutiliza en la barra y en el menú móvil
const Logo = ({ className = '', ...props }) => (
  <MotionLink to="/" className={`group flex shrink-0 origin-left items-center gap-3 ${className}`} aria-label="Evenor Tech Campus, inicio" {...props}>
    <span className="font-display text-logo font-bold text-brand transition-opacity duration-200 group-hover:opacity-80">
      Evenor Tech
    </span>
    {/* Espacio: no se pinta (flex) pero hace que el texto visible sea "Evenor Tech Campus", contenido en el aria-label */}
    {' '}
    <span className="h-5 w-px bg-line-strong" aria-hidden="true" />
    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-3">Campus</span>
  </MotionLink>
);

export default Logo;
