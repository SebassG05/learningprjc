/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import Button from '../../ui/Button';

/**
 * Estado vacío o de error: un mensaje claro y, si procede, una acción.
 * `tone="error"` lo anuncia como alerta.
 */
export default function EmptyState({ icon: Icon, title, description, action, tone = 'empty', className = '' }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : undefined}
      className={`flex flex-col items-center rounded-3xl border border-dashed border-line-strong px-6 py-14 text-center ${className}`}
    >
      {Icon ? (
        <span className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${tone === 'error' ? 'bg-danger/10 text-danger' : 'bg-white/[0.05] text-ink-2'}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      ) : null}
      <p className="text-title-3 font-semibold text-ink">{title}</p>
      {description ? <p className="mt-2 max-w-md text-callout text-ink-2">{description}</p> : null}
      {action ? (
        <Button variant={action.variant ?? 'secondary'} size="md" onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
