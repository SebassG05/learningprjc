/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import { ChartColumn, Megaphone, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import SettingsRow from '../ui/SettingsRow';
import Switch from '../ui/Switch';
import { PRIVACY } from './settingsCopy';

const ICONS = {
  necessary: ShieldCheck,
  functional: SlidersHorizontal,
  analytics: ChartColumn,
  marketing: Megaphone,
};

// Una categoría de cookies. Memorizada: al cambiar un interruptor solo se vuelve a
// pintar su fila (`cookie` y `onToggle` son estables).
const CookieCategoryRow = memo(function CookieCategoryRow({ cookie, checked, onToggle }) {
  const toggle = () => onToggle(cookie.id);

  return (
    <SettingsRow
      icon={ICONS[cookie.id]}
      title={cookie.name}
      badge={
        cookie.required && (
          <span className="rounded-full bg-brand/12 px-2 py-0.5 text-xs font-medium text-brand-300">
            {PRIVACY.always}
          </span>
        )
      }
      description={cookie.description}
      meta={`${PRIVACY.examples} ${cookie.examples}`}
      onActivate={cookie.required ? undefined : toggle}
      control={({ labelId, descriptionId }) => (
        <Switch
          checked={checked}
          locked={cookie.required}
          onCheckedChange={toggle}
          aria-labelledby={labelId}
          aria-describedby={descriptionId}
        />
      )}
    />
  );
});

export default CookieCategoryRow;
