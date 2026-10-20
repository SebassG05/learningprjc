/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Skeleton from '../ui/Skeleton';
import StudentIdentity from '../ui/StudentIdentity';
import { focusRing } from '../ui/tones';
import { courseName, studentName } from '../shared/adminFormat';
import ContactButton from './ContactButton';
import EnrollmentStatusBadge from './EnrollmentStatusBadge';
import { addMonths, dayKey, monthWeeks, parseDay } from './reservasQuery';
import { COPY } from './reservasCopy';

const monthFmt = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });
const dayFmt = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long' });
const longFmt = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const navBtn = `flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-2 transition-colors duration-150 hover:bg-white/[0.06] hover:text-ink active:scale-[0.97] ${focusRing}`;

/**
 * Calendario mensual de inscripciones con agenda del día elegido.
 * Teclado (patrón grid): flechas ±1 día / ±1 semana, Inicio/Fin de la semana, AvPág/RePág de mes;
 * solo un día es tabulable a la vez. Cada día anuncia cuántas inscripciones tiene.
 */
export default function EnrollmentCalendar({ first, onMonthChange, byDay, selected, onSelect, status, total, truncated }) {
  const weeks = useMemo(() => monthWeeks(first), [first]);
  const todayKey = dayKey(new Date());
  const inMonth = (key) => key.startsWith(dayKey(first).slice(0, 7));
  const defaultFocus = selected && inMonth(selected) ? selected : inMonth(todayKey) ? todayKey : dayKey(first);
  const [focusKey, setFocusKey] = useState(defaultFocus);
  const gridRef = useRef(null);
  const wantFocus = useRef(false);

  // Al cambiar de mes (con las flechas o los botones) el día enfocable se recoloca
  useEffect(() => {
    setFocusKey((k) => (inMonth(k) ? k : defaultFocus));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [first]);

  // Si el día está en otro mes, se espera a que ese mes se pinte (la URL cambia de forma asíncrona)
  useEffect(() => {
    if (!wantFocus.current) return;
    const el = gridRef.current?.querySelector(`[data-day="${focusKey}"]`);
    if (!el) return;
    wantFocus.current = false;
    el.focus();
  }, [focusKey, weeks]);

  const moveTo = (date) => {
    const key = dayKey(date);
    wantFocus.current = true;
    if (!inMonth(key)) onMonthChange(new Date(date.getFullYear(), date.getMonth(), 1));
    setFocusKey(key);
  };

  const onKeyDown = (e) => {
    const d = parseDay(focusKey);
    const dow = (d.getDay() + 6) % 7;
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -dow, End: 6 - dow }[e.key];
    if (step !== undefined) {
      e.preventDefault();
      moveTo(new Date(d.getFullYear(), d.getMonth(), d.getDate() + step));
    } else if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      const m = e.key === 'PageUp' ? -1 : 1;
      const target = new Date(d.getFullYear(), d.getMonth() + m, 1);
      const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
      moveTo(new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), last)));
    }
  };

  const agenda = selected ? byDay[selected] ?? [] : null;
  const loading = status === 'loading';

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:items-start">
      <section aria-label="Calendario de inscripciones" className={`min-w-0 rounded-2xl border border-line bg-surface p-1.5 transition-opacity duration-200 sm:p-4 ${status === 'refreshing' ? 'opacity-60' : ''}`}>
        <div className="mb-3 flex items-center gap-1 px-1.5 pt-1.5 sm:gap-2 sm:p-0">
          <h2 className="mr-auto text-title-3 font-semibold text-ink" aria-live="polite">{cap(monthFmt.format(first))}</h2>
          <button type="button" onClick={() => onMonthChange(new Date(new Date().getFullYear(), new Date().getMonth(), 1))} className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold text-ink-2 hover:bg-white/[0.06] hover:text-ink ${focusRing}`}>
            {COPY.calendar.today}
          </button>
          <button type="button" onClick={() => onMonthChange(addMonths(first, -1))} aria-label={COPY.calendar.prev} className={navBtn}>
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => onMonthChange(addMonths(first, 1))} aria-label={COPY.calendar.next} className={navBtn}>
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <table ref={gridRef} role="grid" aria-label={cap(monthFmt.format(first))} aria-busy={loading || undefined} className="w-full table-fixed border-separate border-spacing-0.5 sm:border-spacing-1" onKeyDown={onKeyDown}>
          <thead>
            <tr>
              {COPY.calendar.weekdays.map(([abbr, full]) => (
                <th key={full} scope="col" className="pb-1 text-center text-footnote font-medium text-ink-3">
                  <abbr title={full} className="no-underline">{abbr}</abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, w) => (
              <tr key={w}>
                {week.map((date, i) => {
                  if (!date) return <td key={i} aria-hidden="true" />;
                  const key = dayKey(date);
                  const list = byDay[key] ?? [];
                  const n = list.length;
                  const isSel = key === selected;
                  const isToday = key === todayKey;
                  return (
                    <td key={key} className="p-0 align-top">
                      <button
                        type="button"
                        data-day={key}
                        tabIndex={key === focusKey ? 0 : -1}
                        aria-pressed={isSel}
                        aria-label={COPY.calendar.dayLabel(longFmt.format(date), n)}
                        aria-current={isToday ? 'date' : undefined}
                        onClick={() => {
                          setFocusKey(key);
                          onSelect(isSel ? '' : key);
                        }}
                        className={`flex min-h-12 w-full flex-col items-stretch gap-1 rounded-xl p-1.5 text-left transition-colors duration-150 md:min-h-24 md:p-2 ${focusRing} ${
                          isSel ? 'bg-surface-3 ring-1 ring-inset ring-brand/60' : n ? 'bg-surface-2 hover:bg-surface-3' : 'hover:bg-white/[0.04]'
                        }`}
                      >
                        <span className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <span className={`text-sm tabular-nums ${isToday ? 'flex h-6 w-6 items-center justify-center rounded-full bg-brand font-semibold text-on-brand' : n ? 'font-semibold text-ink' : 'text-ink-3'}`}>
                            {date.getDate()}
                          </span>
                          {n ? (
                            <>
                              {/* Móvil: un punto (no cabe la cifra en 7 columnas); desde 640 px, la cifra */}
                              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand sm:hidden" />
                              <span aria-hidden="true" className="hidden rounded-full bg-brand/15 px-1.5 text-xs font-semibold tabular-nums text-brand-300 sm:inline">{n}</span>
                            </>
                          ) : null}
                        </span>
                        {loading ? (
                          <Skeleton className="hidden h-3 w-3/4 md:block" />
                        ) : (
                          <span aria-hidden="true" className="hidden min-w-0 flex-col gap-0.5 md:flex">
                            {list.slice(0, 2).map((x) => (
                              <span key={x._id} className="truncate text-xs text-ink-2">{studentName(x.userId)}</span>
                            ))}
                            {n > 2 ? <span className="text-xs text-ink-3">{COPY.calendar.more(n - 2)}</span> : null}
                          </span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 px-1 text-footnote text-ink-3">{loading ? ' ' : COPY.calendar.monthTotal(total)}</p>
        {truncated ? <p className="mt-1 px-1 text-footnote text-dawn">{COPY.calendar.truncated}</p> : null}
      </section>

      <section aria-live="polite" className="min-w-0 rounded-2xl border border-line bg-surface p-4">
        {agenda === null ? (
          <p className="py-6 text-center text-callout text-ink-2">{COPY.calendar.pickDay}</p>
        ) : (
          <>
            <h2 className="text-title-3 font-semibold text-ink">{COPY.calendar.agendaTitle(dayFmt.format(parseDay(selected)))}</h2>
            {agenda.length === 0 ? (
              <p className="mt-3 text-callout text-ink-2">{COPY.calendar.agendaEmpty}</p>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {agenda.map((x) => (
                  <li key={x._id} className="flex items-start gap-3 py-3">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <StudentIdentity user={x.userId} size="sm" />
                      <p className={`truncate text-sm ${x.courseId ? 'text-ink-2' : 'italic text-ink-3'}`}>{courseName(x.courseId)}</p>
                      <EnrollmentStatusBadge status={x.status} size="sm" />
                    </div>
                    <ContactButton user={x.userId} course={x.courseId} compact />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
}
