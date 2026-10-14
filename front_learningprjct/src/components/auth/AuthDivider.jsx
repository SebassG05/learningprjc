// Separador "o" entre el acceso con correo y el de Google
export default function AuthDivider() {
  return (
    <div className="flex items-center gap-4" aria-hidden="true">
      <span className="h-px flex-1 bg-line-strong" />
      <span className="text-sm text-ink-2">o</span>
      <span className="h-px flex-1 bg-line-strong" />
    </div>
  );
}
