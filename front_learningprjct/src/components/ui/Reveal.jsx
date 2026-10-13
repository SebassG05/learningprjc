/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { motion } from 'framer-motion';
import { fadeUp, fadeUpSoft, inView, stagger, staggerGroup } from '../../lib/motion';

// Entrada al entrar en el viewport. Con `group`, escalona a los hijos <Reveal.Item>.
// `soft` usa la entrada contenida de las pantallas de trabajo.
const Reveal = ({ as = 'div', group = false, soft = false, step = stagger.cards, delay = 0, className = '', children, ...props }) => {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      variants={group ? staggerGroup(soft ? stagger.list : step, delay) : (soft ? fadeUpSoft : fadeUp)}
      {...props}
    >
      {children}
    </Comp>
  );
};

const Item = ({ as = 'div', soft = false, className = '', children, ...props }) => {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={soft ? fadeUpSoft : fadeUp} {...props}>
      {children}
    </Comp>
  );
};

Reveal.Item = Item;

export default Reveal;
