/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { Linkedin, Instagram, Mail, X, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const linkClass = 'text-sm text-ink-2 transition-colors duration-150 hover:text-ink';

const Column = ({ title, children }) => (
  <div>
    <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">{title}</h4>
    <nav className="flex flex-col gap-3">{children}</nav>
  </div>
);

const social = [
  { href: 'https://www.instagram.com/evenortech/', label: 'Instagram', Icon: Instagram, external: true },
  { href: '#', label: 'Linkedin', Icon: Linkedin },
  { href: 'http://x.com/evenor_tech', label: 'X', Icon: X, external: true },
  { href: 'mailto:info@evenor-tech.com', label: 'Email', Icon: Mail },
];

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-line bg-canvas">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 py-16 md:grid-cols-12">
          {/* Marca */}
          <div className="col-span-2 md:col-span-5">
            <span className="font-display text-3xl font-bold tracking-tight text-ink">
              Campus<span className="text-brand">.</span>
            </span>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-2">
              Plataforma de e-learning moderna y flexible. Formando profesionales con tecnología y pasión para el futuro digital.
            </p>
            <div className="mt-6 flex gap-2">
              {social.map(({ href, label, Icon, external }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-2 transition-colors duration-150 hover:border-line-strong hover:bg-white/[0.06] hover:text-ink"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <Column title="Enlaces">
              <Link to="/" className={linkClass}>Inicio</Link>
              <Link to="/sobre" className={linkClass}>Sobre Nosotros</Link>
              <Link to="/cursos" className={linkClass}>Cursos</Link>
            </Column>
          </div>

          <div className="md:col-span-2">
            <Column title="Soporte">
              <Link to="/contacto" className={linkClass}>Contacto</Link>
              <Link to="/reseñas" className={linkClass}>Reseñas</Link>
            </Column>
          </div>

          <div className="col-span-2 md:col-span-3">
            <Column title="Contacto">
              <a href="mailto:info@evenor-tech.com" className={`${linkClass} inline-flex items-center gap-2`}>
                <Mail className="h-4 w-4 text-brand" /> info@evenor-tech.com
              </a>
              <a href="tel:+34954151096" className={`${linkClass} inline-flex items-center gap-2`}>
                <Phone className="h-4 w-4 text-brand" /> +34 954 151 096
              </a>
            </Column>
          </div>
        </div>

        {/* Copyright y políticas */}
        <div className="flex flex-col gap-4 border-t border-line py-6 text-xs text-ink-3 md:flex-row md:items-center md:justify-between">
          <p>
            © 2026 Campus. Todos los derechos reservados. Desarrollado por <span className="text-ink-2">Evenor-Tech</span>.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/aviso-legal" className="transition-colors hover:text-ink">Aviso Legal</Link>
            <Link to="/politica-cookies" className="transition-colors hover:text-ink">Política de Cookies</Link>
            <Link to="/privacidad" className="transition-colors hover:text-ink">Privacidad</Link>
            <Link to="/terminos" className="transition-colors hover:text-ink">Términos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
