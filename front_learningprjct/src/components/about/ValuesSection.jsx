// Valores: una sola presentación, dentro de «Misión, Visión y Valores». En escritorio, con su constelación.
import Reveal from '../ui/Reveal';
import ValueItem from './ValueItem';
import ValuesConstellation from './ValuesConstellation';
import { VALUES, VALUES_TITLE } from './aboutCopy';
import { stagger } from '../../lib/motion';

export default function ValuesSection() {
  return (
    <div className="about-values grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-x-16">
      <div className="relative lg:col-span-5">
        <Reveal as="h3" className="text-title-2 font-bold text-ink">{VALUES_TITLE}</Reveal>
        <div aria-hidden="true" className="about-halo pointer-events-none absolute left-0 top-24 -z-10 hidden h-96 w-96 lg:block" />
        <ValuesConstellation className="mt-14 hidden w-full max-w-sm lg:block" />
      </div>
      <Reveal as="ul" group step={stagger.list} className="lg:col-span-7">
        {VALUES.map((value) => (
          <ValueItem key={value.title} {...value} />
        ))}
      </Reveal>
    </div>
  );
}
