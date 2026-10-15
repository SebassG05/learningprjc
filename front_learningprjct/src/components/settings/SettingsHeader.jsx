/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import { fadeUpSoft } from '../../lib/motion';
import { HEADER } from './settingsCopy';

// Cabecera de Ajustes: título de la página y, si hay sesión, la cuenta del alumno
// (inicial, nombre y email tal como llegan, igual que en el menú del usuario).
export default function SettingsHeader({ user }) {
  const initial = user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase();

  return (
    <motion.div variants={fadeUpSoft} className="relative isolate">
      <div aria-hidden="true" className="settings-halo pointer-events-none absolute -left-48 -top-48 -z-10 h-112 w-176" />

      <h1 className="text-title-2 text-ink">{HEADER.title}</h1>
      <p className="mt-2 text-base text-ink-2">{HEADER.subtitle}</p>

      {user && (
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <span
              aria-hidden="true"
              className="flex size-13 shrink-0 items-center justify-center rounded-full bg-brand text-xl font-semibold text-on-brand"
            >
              {initial}
            </span>
            <div className="min-w-0 [overflow-wrap:anywhere]">
              <p className="text-lg font-semibold text-ink">{user.name || HEADER.fallbackName}</p>
              {user.email && <p className="text-sm text-ink-2">{user.email}</p>}
            </div>
          </div>
          <Button to="/cursos" variant="secondary" className="w-full sm:w-auto">
            {HEADER.courses}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}
