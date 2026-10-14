/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Botón principal del formulario: mismo tamaño en reposo y cargando (w-full, h-14), sin saltos.
import { Loader2 } from 'lucide-react';
import Button from '../ui/Button';

export default function SubmitButton({ loading, loadingText, children }) {
  return (
    <Button type="submit" size="lg" className="w-full" disabled={loading} aria-busy={loading || undefined}>
      {loading && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
      <span>{loading ? loadingText : children}</span>
    </Button>
  );
}
