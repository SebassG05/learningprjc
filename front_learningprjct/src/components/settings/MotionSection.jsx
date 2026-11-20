import { useReducedMotion as useSystemReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import SegmentedControl from '../admin/ui/SegmentedControl';
import SettingsRow from '../ui/SettingsRow';
import SettingsSection from '../ui/SettingsSection';
import { useMotionPreference } from '../../hooks/useReducedMotion';
import { setMotionPreference } from '../../lib/motionPreference';
import { MOTION } from './settingsCopy';

// Visualización: preferencia de animaciones (automáticas / completas / reducidas), guardada en
// este navegador al momento, sin botón de guardar (ver lib/motionPreference.js)
export default function MotionSection() {
  const value = useMotionPreference();
  const system = useSystemReducedMotion();
  const option = MOTION.options.find((o) => o.value === value) ?? MOTION.options[0];

  return (
    <SettingsSection title={MOTION.title}>
      <SettingsRow
        icon={Sparkles}
        title={MOTION.row}
        description={option.description}
        meta={system ? MOTION.systemNote : undefined}
        layout="stack"
        control={
          <SegmentedControl
            label={MOTION.row}
            layoutId="motion-pref"
            fill
            value={value}
            onChange={setMotionPreference}
            options={MOTION.options}
          />
        }
      />
    </SettingsSection>
  );
}
