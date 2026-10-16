// Misión y visión como piezas de lectura: la primera frase a tamaño de titular, el resto en párrafo a la izquierda.
import { Compass, Telescope } from 'lucide-react';
import Reveal from '../ui/Reveal';
import { MISSION, VISION } from './aboutCopy';

const BLOCKS = [
  { ...MISSION, icon: Compass },
  { ...VISION, icon: Telescope },
];

export default function MissionVision() {
  return (
    <Reveal group className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-x-20 xl:gap-x-28">
      {BLOCKS.map(({ title, lead, body, icon: Icon }) => (
        <Reveal.Item as="article" key={title} className="relative border-t border-line-strong pt-8">
          <div aria-hidden="true" className="about-halo pointer-events-none absolute -left-16 -top-16 -z-10 h-72 w-96" />
          <h3 className="flex items-center gap-3 text-callout font-semibold text-brand-300">
            <Icon className="h-5 w-5" aria-hidden="true" />
            {title}
          </h3>
          <p className="mt-6 max-w-[40ch] text-pretty text-title-3 font-medium text-ink">{lead}</p>
          <p className="mt-6 max-w-[62ch] text-pretty text-base text-gray-300">{body}</p>
        </Reveal.Item>
      ))}
    </Reveal>
  );
}
