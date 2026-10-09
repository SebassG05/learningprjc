/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { spring } from '../../lib/motion';

const MotionLink = motion.create(Link);

const base =
  'relative inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap select-none ' +
  'transition-[background-color,border-color,color,box-shadow] duration-200 ease-standard ' +
  'disabled:opacity-50 disabled:pointer-events-none';

const variants = {
  primary: 'bg-brand-400 text-on-brand hover:bg-brand-300 shadow-[0_8px_24px_-10px_rgb(161_219_135/0.6)]',
  secondary: 'bg-white/[0.06] text-ink border border-line-strong hover:bg-white/[0.1]',
  ghost: 'text-ink-2 hover:text-ink hover:bg-white/[0.06]',
  link: 'text-brand-400 hover:text-brand-300 underline-offset-4 hover:underline',
};

const sizes = {
  sm: 'h-9 px-4 text-sm rounded-full',
  md: 'h-11 px-6 text-[0.9375rem] rounded-full',
  lg: 'h-14 px-8 text-base rounded-full',
};

const buttonClass = (variant = 'primary', size = 'md') =>
  `${base} ${variants[variant]} ${variant === 'link' ? '' : sizes[size]}`;

// Botón base. Con `to` se comporta como enlace del router.
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className = '', to, children, ...props },
  ref
) {
  const Comp = to ? MotionLink : motion.button;
  return (
    <Comp
      ref={ref}
      to={to}
      whileTap={{ scale: 0.97 }}
      transition={spring.snappy}
      className={`${buttonClass(variant, size)} ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
});

export default Button;
