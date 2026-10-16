/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// «Misión, Visión y Valores»: misión y visión, la libélula como pausa y, al final, los valores.
import ParallaxImage from '../ui/ParallaxImage';
import SplitText from '../ui/SplitText';
import { useScenesEnabled } from '../../hooks/useScene';
import MissionVision from './MissionVision';
import ValuesSection from './ValuesSection';
import { ESSENCE_TITLE, PHOTO } from './aboutCopy';

// Cloudinary sirve AVIF/WebP (f_auto) al ancho pedido
const cloudinary = (w) => PHOTO.src.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`);
const SRC_SET = [640, 1024, 1600, 2400].map((w) => `${cloudinary(w)} ${w}w`).join(', ');

export default function AboutEssence({ className = '' }) {
  const scenes = useScenesEnabled();
  return (
    <section className={className}>
      <SplitText as="h2" className="block max-w-[14ch] text-balance text-title-1 font-bold text-ink">
        {ESSENCE_TITLE}
      </SplitText>

      <div className="mt-14 sm:mt-20">
        <MissionVision />
      </div>

      {/* La foto queda bajo el pliegue: el LCP es el titular, que se pinta sin esperar a ninguna imagen */}
      <ParallaxImage
        src={cloudinary(1600)}
        srcSet={SRC_SET}
        sizes="(min-width: 1440px) 1280px, calc(100vw - 2.5rem)"
        alt={PHOTO.alt}
        strength={scenes ? 10 : 0}
        className="mt-24 aspect-[4/5] rounded-3xl border border-line shadow-raised sm:mt-32 sm:aspect-[16/9] lg:aspect-[21/9]"
      >
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-night-deep/90 via-night-deep/50 to-transparent p-6 pt-24 sm:p-10 sm:pt-32">
          <p className="text-title-3 font-bold text-ink sm:text-title-2">{PHOTO.title}</p>
          <p className="mt-2 max-w-xl text-base text-gray-200">{PHOTO.caption}</p>
        </div>
      </ParallaxImage>

      <div className="mt-24 sm:mt-32">
        <ValuesSection />
      </div>
    </section>
  );
}
