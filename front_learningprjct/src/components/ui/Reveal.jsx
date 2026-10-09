/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { motion } from 'framer-motion';
import { fadeUp, inView, stagger } from '../../lib/motion';

// Entrada al entrar en el viewport. Con `group`, escalona a los hijos <Reveal.Item>.
const Reveal = ({ as = 'div', group = false, step = 0.07, delay = 0, className = '', children, ...props }) => {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      variants={group ? stagger(step, delay) : fadeUp}
      {...props}
    >
      {children}
    </Comp>
  );
};

const Item = ({ as = 'div', className = '', children, ...props }) => {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={fadeUp} {...props}>
      {children}
    </Comp>
  );
};

Reveal.Item = Item;

export default Reveal;
