import { useSyncExternalStore } from 'react';
import { useReducedMotion as useSystemReducedMotion } from 'framer-motion';
import { getMotionPreference, subscribeMotionPreference } from '../lib/motionPreference';

// Preferencia de Ajustes ('auto' | 'full' | 'reduced'), reactiva
export function useMotionPreference() {
  return useSyncExternalStore(subscribeMotionPreference, getMotionPreference, () => 'auto');
}

// Igual que el de framer-motion, pero también es true si en Ajustes se eligió «Reducidas».
// Úsalo en lugar del de framer-motion en toda la app.
export default function useReducedMotion() {
  const system = useSystemReducedMotion();
  return useMotionPreference() === 'reduced' || Boolean(system);
}
