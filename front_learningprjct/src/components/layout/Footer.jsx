/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { Linkedin, Instagram, Mail, X, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CAMPUS_EMAIL, CAMPUS_EMAIL_HREF, SOCIAL_URLS } from '../../lib/site';

const NEW_TAB = '(se abre en otra pestaña)';

const navGroups = [
  {
    title: 'Enlaces',
    links: [
      { to: '/', label: 'Inicio' },
      { to: '/sobre', label: 'Sobre Nosotros' },
      { to: '/cursos', label: 'Cursos' },
    ],
  },
  {
    title: 'Soporte',
    links: [
      { to: '/contacto', label: 'Contacto' },
      { to: '/reseñas', label: 'Reseñas' },
    ],
  },
];

const contact = [
  { href: CAMPUS_EMAIL_HREF, label: CAMPUS_EMAIL, Icon: Mail },
  { href: 'tel:+34954151096', label: '+34 954 151 096', Icon: Phone },
];

const social = [
  { href: SOCIAL_URLS.instagram, label: 'Instagram', Icon: Instagram, external: true },
  { href: SOCIAL_URLS.linkedin, label: 'LinkedIn', Icon: Linkedin, external: true },
  { href: SOCIAL_URLS.x, label: 'X', Icon: X, external: true },
  { href: CAMPUS_EMAIL_HREF, label: 'Email', Icon: Mail },
];

const legalLinks = [
  { to: '/aviso-legal', label: 'Aviso Legal' },
  { to: '/politica-cookies', label: 'Política de Cookies' },
  { to: '/privacidad', label: 'Privacidad' },
  { to: '/terminos', label: 'Términos de Uso' },
];

// Filas de 44 px en táctil; más compactas con puntero fino
const linkClass = 'inline-flex min-h-11 items-center text-callout text-ink-2 hover:text-ink sm:min-h-9';
const titleClass = 'font-sans text-footnote font-semibold uppercase tracking-widest text-ink-3';

const FooterColumn = ({ title, label = title, children }) => (
  <nav aria-label={label}>
    <h2 className={titleClass}>{title}</h2>
    <ul className="mt-3 sm:mt-4">{children}</ul>
  </nav>
);

const SocialLink = ({ href, label, Icon, external }) => (
  <li>
    <a
      href={href}
      aria-label={external ? `${label} ${NEW_TAB}` : label}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="flex size-11 items-center justify-center rounded-full border border-line bg-surface/40 text-ink-2 hover:border-line-strong hover:bg-surface-2 hover:text-ink active:scale-95"
    >
      <Icon aria-hidden="true" className="size-[1.125rem]" />
    </a>
  </li>
);

const FooterBottom = () => (
  // A la derecha queda hueco para el botón flotante de subir mientras invade el contenido (por debajo de lg cae sobre él)
  <div className="flex flex-col gap-3 border-t border-line py-6 pr-12 text-footnote text-ink-3 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:pr-0">
    <p>
      © 2026 Campus. Todos los derechos reservados. Desarrollado por <span className="text-ink-2">Evenor-Tech</span>.
    </p>
    <nav aria-label="Legal">
      <ul className="flex flex-wrap gap-x-5">
        {legalLinks.map(({ to, label }) => (
          <li key={to}>
            <Link to={to} className="inline-flex min-h-11 items-center hover:text-ink lg:min-h-0">{label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  </div>
);

const Footer = () => {
  return (
    <footer className="relative mt-auto isolate">
      {/* El pie no corta el fondo: arranca transparente (en el inicio se ve el amanecer del globo) y funde al lienzo.
          Un halo tenue recoge la luz del horizonte; el contenido empieza ya sobre fondo sólido */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="h-40 bg-linear-to-b from-canvas/0 via-canvas/80 via-60% to-canvas sm:h-48" />
        <div className="absolute inset-x-0 top-40 bottom-0 bg-canvas sm:top-48" />
        <div className="absolute inset-x-0 top-40 h-32 -translate-y-1/2 bg-radial from-brand-500/10 to-transparent to-70% sm:top-48" />
      </div>

      <div className="mx-auto w-full max-w-site px-gutter pt-28 sm:pt-32">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 pt-12 pb-14 sm:pt-16 sm:pb-16 md:grid-cols-12 md:gap-y-14">
          <div className="col-span-2 md:col-span-12 lg:col-span-5">
            <p className="font-display text-3xl font-bold tracking-tight text-ink">
              Campus<span className="text-brand">.</span>
            </p>
            <p className="mt-4 max-w-sm text-callout text-ink-2">
              Plataforma de e-learning moderna y flexible. Formando profesionales con tecnología y pasión para el futuro digital.
            </p>
            <ul aria-label="Redes sociales" className="mt-6 flex gap-2">
              {social.map((item) => <SocialLink key={item.label} {...item} />)}
            </ul>
          </div>

          {navGroups.map(({ title, links }) => (
            <div key={title} className="md:col-span-4 lg:col-span-2">
              <FooterColumn title={title}>
                {links.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className={linkClass}>{label}</Link>
                  </li>
                ))}
              </FooterColumn>
            </div>
          ))}

          <div className="col-span-2 md:col-span-4 lg:col-span-3">
            <h2 className={titleClass}>Contacto</h2>
            <address className="mt-3 not-italic sm:mt-4">
              <ul>
                {contact.map(({ href, label, Icon }) => (
                  <li key={href}>
                    <a href={href} className={`${linkClass} gap-2.5`}>
                      <Icon aria-hidden="true" className="size-4 shrink-0 text-brand" /> {label}
                    </a>
                  </li>
                ))}
              </ul>
            </address>
          </div>
        </div>

        <FooterBottom />
      </div>
    </footer>
  );
};

export default Footer;
