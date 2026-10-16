/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Un valor: icono, nombre y una línea. Jerarquía por tipografía y espacio, sin tarjeta.
import Reveal from '../ui/Reveal';

export default function ValueItem({ icon: Icon, title, desc }) {
  return (
    <Reveal.Item as="li" className="about-value group/value grid grid-cols-[auto_1fr] items-start gap-x-5 border-b border-line py-6 first:border-t sm:gap-x-6 sm:py-7">
      <span className="about-value-icon relative grid h-11 w-11 place-items-center rounded-full border border-line-strong bg-glass text-brand-300">
        <Icon className="h-5 w-5" aria-hidden="true" />
        <span aria-hidden="true" className="about-value-star absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-brand-200 lg:hidden" />
      </span>
      <div>
        <p className="text-lg font-semibold text-ink">{title}</p>
        <p className="mt-1 max-w-[52ch] text-base text-gray-300">{desc}</p>
      </div>
    </Reveal.Item>
  );
}
