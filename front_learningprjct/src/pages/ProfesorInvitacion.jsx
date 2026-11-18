/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Canje de una invitación de profesor: /profesor/invitacion#token=…
// El token viaja en el fragmento (no llega al servidor ni al Referer) y sale de la barra en cuanto se lee.
// Sin sesión: muestra el curso y abre el acceso; con sesión: botón para activar (con confirmación si el correo difiere).
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, GraduationCap, Loader } from 'lucide-react';
import AuthModal from '../components/auth/LazyAuthModal';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/admin/ui/ConfirmDialog';
import { dudasCopy } from '../components/dudas/dudasCopy';
import { clearStoredToken, emailCoincide, takeTokenFromUrl } from '../components/dudas/inviteToken';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import usePageMeta from '../hooks/usePageMeta';
import { previewTeacherInvite, redeemTeacherInvite } from '../lib/dudasApi';

const c = dudasCopy('es').profesor.invitacion;

const errorCode = (err) => {
  if (err?.body?.code) return err.body.code;
  if (err?.status === 404) return 'invalid';
  if (err?.status === 429) return 'rate';
  return 'network';
};

export default function ProfesorInvitacion() {
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const { showToast } = useToast();
  usePageMeta(c.pagina);

  const [token] = useState(() => takeTokenFromUrl(window.location, window.history));
  const [preview, setPreview] = useState({ status: token ? 'loading' : 'error', code: 'invalid' });
  const [redeem, setRedeem] = useState({ status: 'idle' });
  const [loginOpen, setLoginOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const redeeming = useRef(false);

  // Sin referrer mientras la página está montada
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'no-referrer';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  // La vista previa no necesita sesión (el token va en el cuerpo)
  useEffect(() => {
    if (!token) return undefined;
    const ctrl = new AbortController();
    previewTeacherInvite(token, ctrl.signal)
      .then((p) => setPreview({ status: 'ready', ...p }))
      .catch((err) => err?.name !== 'AbortError' && setPreview({ status: 'error', code: errorCode(err) }));
    return () => ctrl.abort();
  }, [token, attempt]);

  const canjear = () => {
    if (redeeming.current) return;
    redeeming.current = true;
    setConfirmOpen(false);
    setRedeem({ status: 'loading' });
    redeemTeacherInvite(token)
      .then((r) => {
        clearStoredToken();
        showToast(c.listo, 'success');
        navigate(`/curso/${r.courseId}`, { replace: true });
      })
      .catch((err) => {
        redeeming.current = false;
        if (err?.status === 401) {
          setRedeem({ status: 'idle' });
          setLoginOpen(true);
          return;
        }
        const code = errorCode(err);
        if (code !== 'network' && code !== 'rate') clearStoredToken();
        setRedeem({ status: 'error', code });
      });
  };

  const activar = () => {
    if (user.email && !emailCoincide(preview.emailMasked, user.email)) setConfirmOpen(true);
    else canjear();
  };

  const retry = () => {
    redeeming.current = false;
    setRedeem({ status: 'idle' });
    setPreview({ status: 'loading' });
    setAttempt((n) => n + 1);
  };

  if (redeem.status === 'error') return <InviteMessage code={redeem.code} onRetry={retry} />;
  if (redeem.status === 'loading') return <InviteBusy label={c.activando} />;
  if (preview.status === 'loading' || loading) return <InviteBusy label={c.comprobando} />;
  if (preview.status === 'error') return <InviteMessage code={preview.code} onRetry={retry} />;

  return (
    <Shell>
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
        <GraduationCap className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="eyebrow mt-2 text-brand-300">{c.eyebrow}</p>
      <h1 className="max-w-2xl text-title-1 font-bold text-ink">{c.titulo(preview.courseTitle)}</h1>
      <p className="max-w-md text-lg text-ink-2">{c.lead(preview.emailMasked)}</p>
      <div className="mt-4">
        {user ? (
          <Button size="lg" onClick={activar}>{c.activar}</Button>
        ) : (
          <Button size="lg" onClick={() => setLoginOpen(true)}>{c.entrar}</Button>
        )}
      </div>
      <AuthModal open={loginOpen} onClose={() => setLoginOpen(false)} redirectTo={null} />
      <ConfirmDialog
        open={confirmOpen}
        title={c.confirmTitulo(user?.email)}
        description={c.confirmDesc}
        confirmLabel={c.confirmar}
        cancelLabel={c.cancelar}
        onConfirm={canjear}
        onCancel={() => setConfirmOpen(false)}
      />
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="mx-auto flex min-h-[calc(100svh-var(--spacing-header))] w-full max-w-site flex-col items-center justify-center gap-4 px-gutter py-24 text-center">
      {children}
    </div>
  );
}

function InviteBusy({ label }) {
  return (
    <Shell>
      <p role="status" className="flex items-center gap-3 text-callout text-ink-2">
        <Loader className="h-5 w-5 animate-spin text-brand motion-reduce:animate-none" aria-hidden="true" />
        {label}
      </p>
    </Shell>
  );
}

function InviteMessage({ code, onRetry }) {
  const copy = c.errores[code] ?? c.errores.invalid;
  const reintentable = code === 'network' || code === 'rate';
  return (
    <Shell>
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-dawn/10 text-dawn">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className="text-title-2 font-bold text-ink">{copy.titulo}</h1>
      <p role="alert" className="max-w-md text-callout text-ink-2">{copy.lead}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {reintentable ? <Button variant="secondary" onClick={onRetry}>{c.reintentar}</Button> : null}
        <Button to="/cursos" variant="ghost">{c.alCatalogo}</Button>
      </div>
    </Shell>
  );
}
