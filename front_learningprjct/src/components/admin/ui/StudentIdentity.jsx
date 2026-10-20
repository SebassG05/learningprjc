/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import Avatar from './Avatar';
import { studentName } from '../shared/adminFormat';

// Avatar + nombre + email. Si la cuenta ya no existe: «Alumno eliminado» y una explicación breve.
const StudentIdentity = memo(function StudentIdentity({ user, size = 'md', hideEmail = false }) {
  const deleted = !user;
  const name = studentName(user);
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Avatar name={user?.name} email={user?.email} deleted={deleted} size={size} />
      <span className="min-w-0">
        <span className={`block truncate font-semibold ${deleted ? 'text-ink-2 italic' : 'text-ink'}`}>{name}</span>
        {hideEmail ? null : (
          <span className="block truncate text-footnote text-ink-3">
            {deleted ? 'La cuenta ya no existe' : user.name ? user.email : null}
          </span>
        )}
      </span>
    </span>
  );
});

export default StudentIdentity;
