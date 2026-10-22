/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Canje de una invitación a un curso privado: /curso/:id/invitacion?token=…
// Sin sesión: muestra a qué curso le invitan y abre el acceso; al entrar (o registrarse) canjea sola.
// Con sesión: canjea al llegar y lleva a la ficha del curso, que ya muestra su plaza.
// El token sale de la barra de direcciones en cuanto se lee (no queda en el historial ni en capturas).
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AlertCircle, Loader, Mail } from 'lucide-react';
import AuthModal from '../components/auth/LazyAuthModal';
import Button from '../components/ui/Button';
import { INVITE } from '../components/courses/coursesCopy';
import { pendingInvite } from '../components/courses/invite/pendingInvite';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import usePageMeta from '../hooks/usePageMeta';
import { previewInvite, redeemInvite } from '../lib/coursesApi';

const errorCode = (err) => err?.body?.code ?? (err?.status === 404 ? 'invalid' : 'network');

export default function CursoInvitacion() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const { showToast } = useToast();
  usePageMeta(INVITE.pageTitle);

  const [token] = useState(() => pendingInvite().take(id, params.get('token')));
  const [preview, setPreview] = useState({ status: token ? 'loading' : 'error', code: 'invalid' });
  const [redeem, setRedeem] = useState({ status: 'idle' });
  const [loginOpen, setLoginOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const started = useRef(false);

  // Fuera de la URL en cuanto se ha leído
  useEffect(() => {
    if (params.get('token')) navigate(pathname, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- solo al llegar

  // Sin sesión: qué curso es y si la invitación sigue valiendo
  useEffect(() => {
    if (!token || user) return undefined;
    const ctrl = new AbortController();
    previewInvite(token, ctrl.signal)
      .then((p) => setPreview(p.valid ? { status: 'ready', ...p } : { status: 'error', code: p.code, ...p }))
      .catch((err) => err.name !== 'AbortError' && setPreview({ status: 'error', code: 'network' }));
    return () => ctrl.abort();
  }, [token, user, attempt]);

  // Con sesión: canjear (una vez por intento)
  useEffect(() => {
    if (loading || !user || !token || started.current) return;
    started.current = true;
    setRedeem({ status: 'loading' });
    redeemInvite(token)
      .then((r) => {
        pendingInvite().clear();
        showToast(r.status === 'already-member' ? INVITE.alreadyMember : INVITE.joined, 'success');
        navigate(`/curso/${r.courseId}/inscripcion`, { replace: true });
      })
      .catch((err) => {
        const code = errorCode(err);
        if (code !== 'network') pendingInvite().clear();
        setRedeem({ status: 'error', code });
      });
  }, [loading, navigate, showToast, token, user, attempt]);

  const retry = () => {
    started.current = false;
    setRedeem({ status: 'idle' });
    setPreview((p) => ({ ...p, status: 'loading' }));
    setAttempt((n) => n + 1);
  };

  if (redeem.status === 'error') return <InviteMessage code={redeem.code} courseId={id} onRetry={retry} />;
  if (user || loading || redeem.status === 'loading') return <InviteBusy label={user ? INVITE.joining : INVITE.checking} />;
  if (preview.status === 'loading') return <InviteBusy label={INVITE.checking} />;
  if (preview.status === 'error') return <InviteMessage code={preview.code} courseId={id} onRetry={retry} />;

  return (
    <Shell>
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
        <Mail className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="eyebrow mt-2 text-brand-300">{INVITE.eyebrow}</p>
      <h1 className="max-w-2xl text-title-1 font-bold text-ink">{INVITE.title(preview.courseTitle)}</h1>
      <p className="max-w-md text-lg text-ink-2">{INVITE.lead(preview.cohortName)}</p>
      <div className="mt-4">
        <Button size="lg" onClick={() => setLoginOpen(true)}>{INVITE.login}</Button>
      </div>
      <AuthModal open={loginOpen} onClose={() => setLoginOpen(false)} redirectTo={null} />
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

function InviteMessage({ code, courseId, onRetry }) {
  const copy = INVITE.errors[code] ?? INVITE.errors.invalid;
  return (
    <Shell>
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-dawn/10 text-dawn">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className="text-title-2 font-bold text-ink">{copy.title}</h1>
      <p role="alert" className="max-w-md text-callout text-ink-2">{copy.lead}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {code === 'network' ? <Button variant="secondary" onClick={onRetry}>{INVITE.retry}</Button> : null}
        <Button to={`/curso/${courseId}/inscripcion`} variant="secondary">{INVITE.toCourse}</Button>
        <Button to="/cursos" variant="ghost">{INVITE.toCatalog}</Button>
      </div>
    </Shell>
  );
}
