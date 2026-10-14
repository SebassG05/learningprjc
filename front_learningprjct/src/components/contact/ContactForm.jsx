/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Formulario de Contacto: solo presentación. El envío, la validación propia y la llamada a la API
// siguen en pages/Contacto.jsx; aquí llegan `status` y `onSubmit` sin cambios.
// Mismos campos, mismos `name` y las mismas reglas (required / type="email"): useNativeValidation
// solo muestra esos fallos junto a cada campo en lugar de en el globo del navegador.
import { forwardRef, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, ArrowRight, Plus } from 'lucide-react';
import TextField from '../auth/TextField';
import SubmitButton from '../auth/SubmitButton';
import useNativeValidation from '../auth/useNativeValidation';
import Button from '../ui/Button';
import TextAreaField from './TextAreaField';
import SentSignal from './SentSignal';
import { PRIVACY_SUMMARY, TOPICS } from './contactInfo';
import { duration, ease, nudge, spring } from '../../lib/motion';

// Aviso general (validación o servidor): texto e icono, no solo color; anunciado al aparecer
function FormAlert({ message }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.div
          key={message}
          role="alert"
          initial={{ opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, x: nudge.x }}
          exit={{ opacity: 0, transition: { duration: duration.fast, ease: ease.exit } }}
          transition={nudge.transition}
          className="flex items-start gap-2.5 rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 break-words">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Motivos frecuentes: escriben el motivo en "Asunto", que sigue siendo editable
function TopicPicker({ value, onPick }) {
  return (
    <div role="group" aria-label="Motivos frecuentes" className="flex flex-wrap gap-2">
      {TOPICS.map((topic) => {
        const active = value === topic;
        return (
          <motion.button
            key={topic}
            type="button"
            aria-pressed={active}
            onClick={() => onPick(topic)}
            whileTap={{ scale: 0.96 }}
            transition={spring.snappy}
            className={`min-h-9 rounded-full border px-3.5 text-sm font-medium transition-colors duration-200 ease-standard ${
              active
                ? 'border-brand-400/60 bg-brand-400/15 text-brand-200'
                : 'border-line-strong text-ink-2 hover:border-white/25 hover:text-ink'
            }`}
          >
            {topic}
          </motion.button>
        );
      })}
    </div>
  );
}

function SentPanel({ message, onReset }) {
  const reduce = useReducedMotion();
  const headingRef = useRef(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: reduce ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.slow, ease: ease.outExpo }}
      className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center sm:p-10"
    >
      <SentSignal className="w-full max-w-xs" />
      <h3 ref={headingRef} tabIndex={-1} className="mt-6 text-title-3 font-bold text-ink outline-none">
        Mensaje enviado
      </h3>
      <p className="mt-3 max-w-sm text-base text-ink-2">{message}</p>
      <p className="mt-1 max-w-sm text-sm text-ink-3">Te responderemos en el correo que nos has indicado.</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button to="/cursos" variant="secondary">
          Ver cursos
        </Button>
        <Button type="button" variant="ghost" onClick={onReset}>
          Enviar otro mensaje
        </Button>
      </div>
    </motion.div>
  );
}

const ContactForm = forwardRef(function ContactForm({ status, onSubmit, onReset, className = '' }, formRef) {
  const { errors: nativeErrors, onSubmit: submit, onInput, reset } = useNativeValidation(onSubmit);
  const subjectRef = useRef(null);
  const [topic, setTopic] = useState('');
  // Teléfono y centro son opcionales: plegados para que el formulario pida lo justo.
  // Siguen dentro del <form> (mismos campos y mismo payload); solo se ocultan a la vista.
  const [showOptional, setShowOptional] = useState(false);

  // Errores nativos (al vuelo) + los de validateContactForm (p. ej. un campo con solo espacios)
  const errors = { ...status.validationErrors, ...nativeErrors };
  const sent = status.submitted;

  useEffect(() => {
    if (sent) {
      setTopic('');
      setShowOptional(false);
      reset();
    }
  }, [sent, reset]);

  // Errores de validateContactForm: el foco va al primer campo señalado, como con los nativos
  useEffect(() => {
    const names = Object.keys(status.validationErrors || {});
    if (!names.length || !formRef?.current) return;
    const first = [...formRef.current.elements].find((el) => names.includes(el.name));
    first?.focus();
  }, [status.validationErrors, formRef]);

  const pickTopic = (value) => {
    const el = subjectRef.current;
    if (!el) return;
    el.value = value;
    setTopic(value);
    onInput({ target: el });
  };

  return (
    <section aria-labelledby="contact-form-title" className={`relative glass-panel rounded-3xl ${className}`}>
      <div className={`p-5 sm:p-8 ${sent ? 'invisible' : ''}`}>
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="contact-form-title" className="text-title-3 font-bold text-ink">
            Escríbenos
          </h2>
          <p className="text-sm text-ink-3">Todos los campos son obligatorios salvo los opcionales.</p>
        </div>

        <form ref={formRef} onSubmit={submit} onInput={onInput} noValidate className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="name"
              name="name"
              label="Nombre completo"
              required
              autoComplete="name"
              error={errors.name}
            />
            <TextField
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="nombre@correo.com"
              required
              autoComplete="email"
              inputMode="email"
              autoCapitalize="off"
              spellCheck={false}
              error={errors.email}
            />
          </div>

          <div className="flex flex-col gap-3">
            <TextField
              ref={subjectRef}
              id="subject"
              name="subject"
              label="Asunto"
              placeholder="Elige un motivo o escribe el tuyo"
              required
              onChange={(e) => setTopic(e.target.value)}
              error={errors.subject}
            />
            <TopicPicker value={topic} onPick={pickTopic} />
          </div>

          <TextAreaField
            id="message"
            name="message"
            label="Mensaje"
            rows={4}
            placeholder="Cuéntanos tu duda: qué curso, qué ha pasado y qué necesitas."
            required
            error={errors.message}
          />

          <div>
            <button
              type="button"
              aria-expanded={showOptional}
              aria-controls="contact-optional"
              onClick={() => setShowOptional((v) => !v)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-medium text-ink-2 hover:text-ink"
            >
              <Plus
                className={`h-4 w-4 text-brand-400 transition-transform duration-200 ease-out-expo ${showOptional ? 'rotate-45' : ''}`}
                aria-hidden="true"
              />
              {showOptional ? 'Ocultar teléfono y centro' : 'Añadir teléfono o centro (opcional)'}
            </button>
            <div id="contact-optional" hidden={!showOptional} className="mt-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  id="phone"
                  name="phone"
                  type="tel"
                  label="Teléfono (opcional)"
                  placeholder="+34 600 000 000"
                  autoComplete="tel"
                  inputMode="tel"
                />
                <TextField
                  id="company"
                  name="company"
                  label="Centro o empresa (opcional)"
                  autoComplete="organization"
                />
              </div>
            </div>
          </div>

          <FormAlert message={status.error} />

          <div className="flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="flex flex-col gap-1.5 sm:max-w-sm">
              <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1">
                <input
                  type="checkbox"
                  name="privacy"
                  required
                  aria-invalid={errors.privacy ? true : undefined}
                  aria-describedby={errors.privacy ? 'privacy-error' : undefined}
                  className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-brand-400"
                />
                <span className="text-sm text-ink-2">
                  He leído y acepto la{' '}
                  <Link to="/privacidad" className="font-medium text-brand-400 underline-offset-4 hover:underline">
                    información básica de protección de datos
                  </Link>
                  .
                </span>
              </label>
              {errors.privacy && (
                <p id="privacy-error" className="flex items-start gap-1.5 text-sm text-danger">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{errors.privacy}</span>
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:w-64">
              <SubmitButton loading={status.loading} loadingText="Enviando…">
                <span className="inline-flex items-center gap-2">
                  Enviar mensaje
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </span>
              </SubmitButton>
            </div>
          </div>
          <p className="text-sm text-ink-3">Te responderemos por email a la dirección que nos indiques.</p>

          <dl className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-[auto_1fr] sm:gap-y-1.5 rounded-2xl bg-white/[0.03] p-4 text-xs text-ink-3">
            {PRIVACY_SUMMARY.map(([term, text]) => (
              <div key={term} className="contents">
                <dt className="mt-2 font-semibold text-ink-2 first:mt-0 sm:mt-0">{term}</dt>
                <dd>{text}</dd>
              </div>
            ))}
            <div className="contents">
              <dt className="mt-2 font-semibold text-ink-2 sm:mt-0">Información adicional</dt>
              <dd>
                <Link to="/privacidad" className="text-brand-400 underline-offset-4 hover:underline">
                  Consulte la política de privacidad
                </Link>
              </dd>
            </div>
          </dl>
        </form>
      </div>

      <AnimatePresence>{sent && <SentPanel key="sent" message={status.successMessage} onReset={onReset} />}</AnimatePresence>
    </section>
  );
});

export default ContactForm;
