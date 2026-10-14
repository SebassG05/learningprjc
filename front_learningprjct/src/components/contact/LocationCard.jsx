/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Ubicación: fachada ligera (mapa de puntos en SVG) que solo carga el iframe de Google al pedirlo.
// Misma caja 16:10 antes y después, para que no haya saltos de layout.
import { useState } from 'react';
import { ArrowUpRight, Map as MapIcon } from 'lucide-react';
import SevillaMap from './SevillaMap';
import { ADDRESS } from './contactInfo';

export default function LocationCard({ className = '' }) {
  const [showMap, setShowMap] = useState(false);

  return (
    <section aria-labelledby="contact-location" className={`grid overflow-hidden rounded-3xl border border-line bg-surface/60 backdrop-blur-md md:grid-cols-[1.5fr_1fr] ${className}`}>
      <div className="relative aspect-[16/10] bg-night-deep/80">
        {showMap ? (
          <iframe
            src={ADDRESS.embedUrl}
            title="Mapa de Evenor-Tech en Google Maps"
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <>
            <SevillaMap className="absolute inset-0 h-full w-full" />
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className="absolute right-3 top-3 inline-flex h-11 items-center gap-2 rounded-full border border-line-strong bg-canvas/80 px-4 text-sm font-medium text-ink backdrop-blur-sm hover:border-white/25 hover:bg-surface-3"
            >
              <MapIcon className="h-4 w-4" aria-hidden="true" />
              Ver mapa interactivo
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col justify-between gap-4 p-5 sm:p-6">
        <div>
          <h2 id="contact-location" className="font-sans text-sm font-medium text-ink-3">
            Dónde estamos
          </h2>
          <address className="mt-1 text-base not-italic text-ink">
            {ADDRESS.street}
            <br />
            {ADDRESS.city}
          </address>
        </div>
        <a
          href={ADDRESS.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-11 items-center gap-1.5 self-start rounded-full text-sm font-semibold text-brand-400 hover:text-brand-300"
        >
          Abrir en Maps
          <ArrowUpRight
            className="h-4 w-4 transition-transform duration-200 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
          <span className="sr-only">(se abre en otra pestaña)</span>
        </a>
      </div>
    </section>
  );
}
