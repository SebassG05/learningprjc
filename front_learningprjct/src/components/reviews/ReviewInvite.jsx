/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Sin sesión: invitación breve y la misma acción de siempre (abre el diálogo de acceso del header).
import { LogIn } from 'lucide-react';
import Button from '../ui/Button';
import { INVITE } from './reviewsCopy';

export default function ReviewInvite({ onAccess }) {
  return (
    <div className="flex flex-col items-start gap-5">
      <p className="eyebrow">{INVITE.eyebrow}</p>
      <h2 className="font-display text-title-2 font-bold text-ink">{INVITE.title}</h2>
      <p className="max-w-md text-base text-ink-2">{INVITE.body}</p>
      <Button size="lg" className="mt-2 w-full px-6 shadow-glow sm:w-auto sm:px-8" onClick={onAccess}>
        <LogIn className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>{INVITE.cta}</span>
      </Button>
    </div>
  );
}
