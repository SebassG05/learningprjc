/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import Reveal from './Reveal';
import SplitText from './SplitText';

// Cabecera de sección: eyebrow + titular revelado por palabras + entradilla opcional
const SectionHeading = ({ eyebrow, title, lead, align = 'center', className = '' }) => {
  const alignment = align === 'center' ? 'text-center items-center mx-auto' : 'text-left items-start';
  return (
    <div className={`flex flex-col gap-4 max-w-3xl ${alignment} ${className}`}>
      {eyebrow && <Reveal as="span" className="eyebrow">{eyebrow}</Reveal>}
      <SplitText as="h2" delay={0.06} className="block text-title-1 font-bold text-ink">
        {title}
      </SplitText>
      {lead && (
        <Reveal as="p" className="text-lg text-ink-2 max-w-2xl">
          {lead}
        </Reveal>
      )}
    </div>
  );
};

export default SectionHeading;
