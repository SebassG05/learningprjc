/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Reveal from '../../ui/Reveal';
import useTestInfo from '../useTestInfo';
import CicloTimeline from './CicloTimeline';
import TemaEscena from './TemaEscena';
import TemarioModal from './TemarioModal';
import { copy } from './temasCopy';
import { etapa, markSeen, readSeen } from './temasProgress';
import { temarioFilename } from './temarioPdf';

const sceneId = (tema) => `tema-${tema.numeroTema}`;

/**
 * Temario del curso como recorrido narrativo: una escena a pantalla completa por tema, unidas por la
 * línea del ciclo del carbono. Sustituye a MaterialEstudio cuando los temas traen el temario nuevo
 * (vídeo o índice) y mantiene su progreso: materiales estudiados, test de cada tema y test final.
 */
export default function TemasCiclo({ cursoId, temas, completedMaterials, setCompletedMaterials, completedTests, idioma = 'es' }) {
  const t = copy(idioma);
  const navigate = useNavigate();
  const testInfo = useTestInfo(cursoId, temas);
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState(() => readSeen(cursoId));
  const [temario, setTemario] = useState(null); // { tema, material, index } del visor abierto
  const scenes = useRef([]);

  // Tema actual: el que ocupa la franja central de la pantalla (sin escuchar el scroll)
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number(entry.target.dataset.index));
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    scenes.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [temas]);

  const onSeen = useCallback((temaId) => setSeen(markSeen(cursoId, temaId)), [cursoId]);
  const toggleCompleted = (materialId) => setCompletedMaterials((prev) => ({ ...prev, [materialId]: !prev[materialId] }));
  const openTest = (tema) =>
    navigate(`/curso/${cursoId}/tema-estudio`, {
      state: { tema, material: { titulo: idioma === 'en' ? 'Evaluation Test' : 'Test de Evaluación' }, startPhase: 2, temaId: tema._id },
    });
  const closeTemario = useCallback(() => setTemario(null), []);
  const notAllowed = useCallback(() => navigate(`/curso/${cursoId}/inscripcion`, { replace: true }), [cursoId, navigate]);

  return (
    <section aria-labelledby="temario-titulo" className="relative mb-16">
      <Reveal group className="max-w-3xl border-t border-line pt-14 sm:pt-20">
        <Reveal.Item as="p" className="eyebrow">{t.eyebrow}</Reveal.Item>
        <Reveal.Item as="h2" id="temario-titulo" className="mt-4 text-balance text-title-1 font-bold text-ink">{t.heading}</Reveal.Item>
        <Reveal.Item as="p" className="mt-5 text-pretty text-lg leading-relaxed text-ink-2">{t.lead}</Reveal.Item>
      </Reveal>

      <div className="mt-10 lg:mt-6 lg:grid lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-14 xl:grid-cols-[15rem_minmax(0,1fr)] xl:gap-20">
        <CicloTimeline temas={temas} active={active} seen={seen} sceneId={sceneId} idioma={idioma} t={t} />

        <ol className="min-w-0">
          {temas.map((tema, i) => (
            <TemaEscena
              key={tema._id}
              ref={(el) => { scenes.current[i] = el; }}
              tema={tema}
              index={i}
              sceneId={sceneId(tema)}
              cursoId={cursoId}
              idioma={idioma}
              t={t}
              isSeen={seen.has(String(tema._id))}
              onSeen={onSeen}
              completed={Boolean(completedMaterials[(tema.materiales ?? []).find((m) => m.tipo === 'pdf')?._id ?? tema.materiales?.[0]?._id])}
              onToggleCompleted={toggleCompleted}
              testInfo={testInfo[tema._id]}
              testPassed={Boolean(completedTests?.includes(tema._id))}
              onOpenTest={openTest}
              onOpenTemario={(tm, material) => setTemario({ tema: tm, material, index: i })}
            />
          ))}
        </ol>
      </div>

      <TemarioModal
        open={Boolean(temario)}
        cursoId={cursoId}
        materialId={temario?.material._id}
        numero={temario?.tema.numeroTema}
        titulo={temario ? (idioma === 'en' && temario.tema.tituloEn) || temario.tema.titulo : ''}
        filename={temario ? temarioFilename(temario.tema.numeroTema, temario.tema.titulo) : ''}
        accent={temario ? etapa(temario.index).accent : undefined}
        onClose={closeTemario}
        onNotAllowed={notAllowed}
        t={t}
      />
    </section>
  );
}
