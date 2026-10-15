/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Titular de Reseñas: habla a quien viene a leer opiniones y a quien quiere dejar la suya.
import SplitText from '../ui/SplitText';
import { HEADLINE, SUBTITLE } from './reviewsCopy';

export default function ReviewsHero({ headline = HEADLINE, className = '' }) {
  return (
    <header className={className}>
      <p className="eyebrow">Reseñas</p>
      <SplitText as="h1" trigger="mount" delay={0.1} className="mt-5 block max-w-[16ch] text-contact font-bold text-ink">
        {headline.lead} <span className="text-brand-400">{headline.accent}</span>
      </SplitText>
      <p className="mt-6 max-w-lg text-lg text-ink-2">{SUBTITLE}</p>
    </header>
  );
}
