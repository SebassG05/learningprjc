/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Lock, Trophy } from 'lucide-react';

// Test final de certificación: se desbloquea al aprobar los tests de todos los temas
export default function TestFinalCard({ cursoId, temas, completedTests, className = '' }) {
  const navigate = useNavigate();
  const todosAprobados = temas.length > 0 && temas.every((t) => completedTests?.includes(t._id));
  const aprobado = Boolean(completedTests?.includes('test-final-certificacion'));

  const abrir = () => {
    if (!todosAprobados) return;
    navigate(`/curso/${cursoId}/tema-estudio`, {
      state: {
        tema: { _id: 'test-final-certificacion', titulo: 'Test Final de Certificación', numeroTema: temas.length + 1 },
        material: { titulo: 'Test Final de Certificación' },
        startPhase: 2,
        temaId: 'test-final-certificacion',
      },
    });
  };

  return (
    <div className={`rounded-3xl border border-amber-400/25 bg-surface p-6 shadow-card transition-colors hover:border-amber-400/40 sm:p-8 ${className}`}>
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-sm font-bold text-on-brand">
          {temas.length + 1}
        </span>
        <div className="flex-1">
          <h3 className="mb-2 font-sans text-xl font-semibold text-ink">Test Final de Certificación</h3>
          <p className="text-sm leading-relaxed text-ink-2">
            Evaluación final integradora sobre todos los contenidos del curso. Cubre los {temas.length} módulos del curso para obtener la certificación.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-amber-300">Test de Certificación</h4>
        <button
          type="button"
          onClick={abrir}
          aria-disabled={!todosAprobados || undefined}
          className={`group flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors duration-200 ${
            !todosAprobados
              ? 'cursor-not-allowed border-transparent bg-white/[0.02] opacity-50'
              : aprobado
                ? 'cursor-pointer border-yellow-400/50 bg-yellow-400/10'
                : 'cursor-pointer border-transparent bg-surface/50 hover:border-yellow-400/40 hover:bg-surface'
          }`}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className={`flex-shrink-0 ${todosAprobados ? 'text-yellow-400' : 'text-gray-600'}`}>
              {!todosAprobados ? <Lock className="h-5 w-5" /> : aprobado ? <Trophy className="h-5 w-5" /> : <ClipboardCheck className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`truncate font-medium ${todosAprobados ? 'text-ink' : 'text-gray-500'}`}>
                Test Final de Certificación
                {aprobado && <span className="ml-2 rounded-full bg-yellow-400/20 px-2 py-0.5 text-xs text-yellow-400">Aprobado ✓</span>}
                {!todosAprobados && <span className="ml-2 rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400">🔒 Bloqueado</span>}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {todosAprobados
                  ? '40 preguntas • 90 minutos • Nota mínima: 70%'
                  : `Aprueba los tests de los ${temas.length} módulos para desbloquear el test final`}
              </p>
            </div>
          </div>
          {todosAprobados && !aprobado && (
            <div className="ml-3 flex-shrink-0 rounded-full bg-amber-400 px-3 py-1.5 text-sm font-medium text-on-brand opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100">
              Iniciar Test
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
