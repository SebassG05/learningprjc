/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import useFocusTrap from '../../hooks/useFocusTrap';
import { duration, ease, spring, stagger } from '../../lib/motion';
import { accountLinks, isActivePath } from './navigation';
import Logo from './Logo';

// Menú a pantalla completa (por debajo de xl): mismos enlaces que la cabecera de escritorio,
// en letra grande, y debajo las acciones de cuenta. Foco atrapado, Escape cierra.
const MobileMenu = ({ id, isOpen, links, account, onClose }) => {
  const { pathname } = useLocation();
  const panelRef = useRef(null);
  const reduce = useReducedMotion();
  useFocusTrap(panelRef, isOpen, onClose);

  // Bloquea el scroll de la página mientras está abierto
  useEffect(() => {
    if (!isOpen) return undefined;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => { root.style.overflow = prev; };
  }, [isOpen]);

  // Cierra al cambiar de ruta (atrás/adelante del navegador)
  useEffect(() => { onClose(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cada enlace sube desde detrás de su máscara, escalonado
  const item = (i) => (reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: duration.fast } } }
    : {
      initial: { y: '110%' },
      animate: { y: '0%', transition: { ...spring.gentle, delay: 0.06 + i * stagger.list } },
      exit: { y: '110%', transition: { duration: duration.fast, ease: ease.exit } },
    });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="menu-movil"
          id={id}
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: duration.base, ease: ease.outExpo } }}
          exit={{ opacity: 0, transition: { duration: duration.base, ease: ease.exit } }}
          className="fixed inset-0 z-[60] flex flex-col overflow-y-auto overscroll-contain material-thick xl:hidden"
          data-lenis-prevent
        >
          <div className="mx-auto flex h-header w-full max-w-site shrink-0 items-center justify-between px-gutter lg:h-header-lg">
            <Logo onClick={onClose} />
            <button
              type="button"
              className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink-2 transition-colors duration-200 hover:bg-glass-strong hover:text-ink"
              aria-label="Cerrar menú"
              onClick={onClose}
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="mx-auto flex w-full max-w-site flex-1 flex-col justify-between gap-10 px-gutter pb-10 pt-6">
            <nav aria-label="Principal">
              <ul className="flex flex-col">
                {links.map((link, i) => {
                  const active = isActivePath(pathname, link.to);
                  return (
                    <li key={link.to} className="overflow-hidden">
                      <motion.div {...item(i)}>
                        <Link
                          to={link.to}
                          onClick={onClose}
                          aria-current={active ? 'page' : undefined}
                          className={`flex min-h-14 items-center gap-3 py-1 font-display text-title-1 font-bold transition-colors duration-200 ${active ? 'text-ink' : 'text-ink-2 hover:text-ink'}`}
                        >
                          {link.label}
                          {active && <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />}
                        </Link>
                      </motion.div>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              animate={{ opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.outExpo, delay: 0.06 + links.length * stagger.list } }}
              className="border-t border-line pt-6"
            >
              {account ?? (
                <ul className="flex flex-col gap-3 sm:flex-row">
                  {accountLinks.map((a, i) => (
                    <li key={a.to} className="sm:flex-1">
                      <Link
                        to={a.to}
                        onClick={onClose}
                        className={`flex h-14 items-center justify-center gap-2 rounded-full px-6 text-button-lg font-semibold transition-colors duration-200 ${i === 0 ? 'border border-line-strong bg-glass text-ink hover:bg-glass-strong' : 'bg-brand text-on-brand shadow-glow hover:bg-brand-300'}`}
                      >
                        {a.label}
                        {i === 1 && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
