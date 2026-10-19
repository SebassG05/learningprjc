/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import { UserX } from 'lucide-react';
import { initials } from '../shared/adminFormat';

const SIZE = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };

// Iniciales sobre fondo neutro; si el alumno ya no existe, un icono de usuario eliminado
const Avatar = memo(function Avatar({ name, email, deleted = false, size = 'md', className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full border font-semibold ${SIZE[size]} ${
        deleted ? 'border-dashed border-line-strong bg-transparent text-ink-3' : 'border-line bg-surface-3 text-ink'
      } ${className}`}
    >
      {deleted ? <UserX className="h-[45%] w-[45%]" /> : initials(name, email)}
    </span>
  );
});

export default Avatar;
