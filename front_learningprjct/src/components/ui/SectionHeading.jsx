/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import Reveal from './Reveal';

// Cabecera de sección: eyebrow + titular + entradilla opcional
const SectionHeading = ({ eyebrow, title, lead, align = 'center', className = '' }) => {
  const alignment = align === 'center' ? 'text-center items-center mx-auto' : 'text-left items-start';
  return (
    <Reveal group className={`flex flex-col gap-4 max-w-3xl ${alignment} ${className}`}>
      {eyebrow && <Reveal.Item as="span" className="eyebrow">{eyebrow}</Reveal.Item>}
      <Reveal.Item as="h2" className="text-title-1 font-bold text-ink">
        {title}
      </Reveal.Item>
      {lead && (
        <Reveal.Item as="p" className="text-lg text-ink-2 max-w-2xl">
          {lead}
        </Reveal.Item>
      )}
    </Reveal>
  );
};

export default SectionHeading;
