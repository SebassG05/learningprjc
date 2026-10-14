/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Canal directo: toda la fila es un único enlace (mailto:/tel:) y, al lado y fuera del enlace,
// un botón para copiar el dato. El aviso de "copiado" lo anuncia la región viva del contenedor.
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy } from 'lucide-react';
import { duration, ease } from '../../lib/motion';

export default function ContactChannel({ icon: Icon, label, value, href, copyLabel, onCopied }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopied?.(`${label} copiado: ${value}`);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      onCopied?.(`No se pudo copiar. ${label}: ${value}`);
    }
  };

  return (
    <li className="group/channel relative flex items-center gap-2 rounded-2xl transition-colors duration-200 ease-standard hover:bg-white/[0.04]">
      <a href={href} className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-3 sm:gap-4 sm:p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-400/10 text-brand-400 transition-colors duration-200 group-hover/channel:bg-brand-400/15">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm text-ink-3">{label}</span>
          <span className="block text-base font-semibold tracking-tight text-ink [overflow-wrap:anywhere] transition-colors duration-200 group-hover/channel:text-brand-300 sm:text-title-3">
            {value}
          </span>
        </span>
      </a>
      <button
        type="button"
        onClick={copy}
        className="mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-3 hover:bg-white/[0.08] hover:text-ink"
        aria-label={copyLabel}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? 'ok' : 'copy'}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: duration.fast, ease: ease.outExpo }}
            className="flex"
          >
            {copied ? <Check className="h-4 w-4 text-brand-400" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          </motion.span>
        </AnimatePresence>
      </button>
    </li>
  );
}
