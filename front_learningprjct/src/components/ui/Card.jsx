/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { motion } from 'framer-motion';
import { spring } from '../../lib/motion';

const tones = {
  default: 'bg-surface border border-line shadow-card',
  raised: 'bg-surface-2 border border-line shadow-raised',
  glass: 'material border border-line shadow-raised',
};

// Tarjeta base. `interactive` añade elevación en hover y respuesta al pulsar.
const Card = ({ tone = 'default', interactive = false, className = '', children, ...props }) => {
  const motionProps = interactive
    ? { whileHover: { y: -4 }, whileTap: { scale: 0.985 }, transition: spring.snappy }
    : {};
  return (
    <motion.div
      className={`rounded-3xl ${tones[tone]} ${interactive ? 'transition-[border-color,box-shadow] duration-300 hover:border-line-strong hover:shadow-raised' : ''} ${className}`}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
