/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import { Mail } from 'lucide-react';
import { focusRing } from '../ui/tones';
import { courseName, studentName } from '../shared/adminFormat';
import { COPY } from './reservasCopy';

// Abre el correo del administrador con el destinatario y el asunto ya puestos
const ContactButton = memo(function ContactButton({ user, course, compact = false }) {
  if (!user?.email) return <span className="text-sm text-ink-3">{COPY.noEmail}</span>;
  const href = `mailto:${user.email}?subject=${encodeURIComponent(COPY.contactSubject(courseName(course)))}`;
  return (
    <a
      href={href}
      aria-label={COPY.contactLabel(studentName(user))}
      className={`inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-line-strong bg-white/[0.04] text-sm font-semibold text-ink transition-colors duration-150 hover:bg-white/[0.08] active:scale-[0.97] ${focusRing} ${
        compact ? 'w-11 justify-center' : 'px-4'
      }`}
    >
      <Mail className="h-4 w-4" aria-hidden="true" />
      {compact ? null : COPY.contact}
    </a>
  );
});

export default ContactButton;
