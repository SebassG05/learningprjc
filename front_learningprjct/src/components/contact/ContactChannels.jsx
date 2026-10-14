/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Contacto directo con jerarquía: email y teléfono grandes (lo más útil para un alumno) y
// LinkedIn como enlace secundario. Una sola región viva anuncia las copias al portapapeles.
import { useState } from 'react';
import { ArrowUpRight, Linkedin, Mail, Phone } from 'lucide-react';
import ContactChannel from './ContactChannel';
import { EMAIL, LINKEDIN, PHONE } from './contactInfo';

export default function ContactChannels({ className = '' }) {
  const [announcement, setAnnouncement] = useState('');

  return (
    <section aria-labelledby="contact-direct" className={className}>
      <h2 id="contact-direct" className="mb-2 font-sans text-sm font-medium text-ink-3">
        Contacto directo
      </h2>
      <ul className="-mx-3 flex flex-col gap-1 sm:-mx-4">
        <ContactChannel
          icon={Mail}
          label="Email"
          value={EMAIL.value}
          href={EMAIL.href}
          copyLabel="Copiar email"
          onCopied={setAnnouncement}
        />
        <ContactChannel
          icon={Phone}
          label="Teléfono"
          value={PHONE.value}
          href={PHONE.href}
          copyLabel="Copiar teléfono"
          onCopied={setAnnouncement}
        />
      </ul>

      <a
        href={LINKEDIN.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-3 inline-flex min-h-11 items-center gap-3 rounded-full pr-3 text-sm font-medium text-ink-2 hover:text-ink"
      >
        <Linkedin className="h-4 w-4 text-ink-3 group-hover:text-brand-400" aria-hidden="true" />
        {LINKEDIN.label}
        <ArrowUpRight
          className="h-4 w-4 text-ink-3 transition-transform duration-200 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
        <span className="sr-only">(se abre en otra pestaña)</span>
      </a>

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}
