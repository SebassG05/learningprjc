/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import React, { useState, useRef, useId } from 'react';
import GoogleAuthButton from './GoogleAuthButton.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useUser } from '../../context/UserContext.jsx';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { duration, ease, nudge } from '../../lib/motion';
import AuthDialog from './AuthDialog';
import TextField from './TextField';
import PasswordField from './PasswordField';
import SubmitButton from './SubmitButton';
import AuthDivider from './AuthDivider';
import { PasswordMatchAnnouncer, PasswordMatchHint } from './PasswordMatchHint';
import useNativeValidation from './useNativeValidation';
import AuthTabs from './AuthTabs';
import { panelId, tabId } from './tabIds';
import AutoHeight from './AutoHeight';

const LOGO = 'https://res.cloudinary.com/dd9pjmuy9/image/upload/v1770629257/Gemini_Generated_Image_ufiqyxufiqyxufiq-removebg-preview_lohtpf.png';

// Cambio de texto con la pestaña: fundido cruzado corto (sin desplazamiento con reduced motion)
function Swap({ id, children }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={id}
        className="block"
        initial={{ opacity: 0, y: reduce ? 0 : 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduce ? 0 : -4 }}
        transition={{ duration: duration.fast, ease: ease.outExpo }}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}

// Error devuelto por el servidor: encima del botón, con icono y texto (no solo color)
function ServerAlert({ message }) {
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

const AuthModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { login: setUserLogin } = useUser();
  const { showToast } = useToast();
  const [tab, setTab] = useState('login');
  // Registro
  const [registerData, setRegisterData] = useState({ email: '', password: '', confirmPassword: '', name: '' });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [, setRegisterSuccess] = useState('');

  // Login
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [, setLoginSuccess] = useState('');

  // Limpiar mensajes al abrir modal
  React.useEffect(() => {
    if (open) {
      setLoginError('');
      setLoginSuccess('');
      setRegisterError('');
      setRegisterSuccess('');
    }
  }, [open]);

  // Visible = el diálogo se ve. Al cerrar con × o Escape se anima la salida y después se avisa al
  // padre (antes: 350 ms fijos). Los cierres por éxito u olvido mantienen su secuencia original.
  const [isVisible, setIsVisible] = useState(open);
  React.useEffect(() => {
    setIsVisible(open);
  }, [open]);
  const dismissed = useRef(false);
  const handleClose = () => {
    dismissed.current = true;
    setIsVisible(false);
  };
  const handleExited = () => {
    if (!dismissed.current) return;
    dismissed.current = false;
    onClose && onClose();
  };
  const titleId = useId();
  const tabsId = useId();
  const reduce = useReducedMotion();
  // Paneles: fundido cruzado con un desplazamiento corto en el sentido del cambio
  const panelMotion = (dir) => ({
    initial: { opacity: 0, x: reduce ? 0 : 12 * dir },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reduce ? 0 : -12 * dir },
    transition: { duration: duration.fast, ease: ease.outExpo },
  });
  const firstFieldRef = useRef(null);

  // Handlers originales, sin cambios
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';
      const res = await fetch(`${apiUrl}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || (data.errors && data.errors[0]?.msg) || 'Error al iniciar sesión');
      } else {
        setUserLogin(data.user, data.token);
        setLoginSuccess('');
        showToast('¡Bienvenido! Has iniciado sesión correctamente.', 'info');
        // Cierra el modal y elimina el overlay inmediatamente y sin retardo
        setIsVisible(false);
        onClose && onClose();
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 10);
      }
    } catch (err) {
      setLoginError('Error de red');
    } finally {
      setLoginLoading(false);
    }

  };
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setRegisterLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';
      const res = await fetch(`${apiUrl}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          confirmPassword: registerData.confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRegisterError(data.error || (data.errors && data.errors[0]?.msg) || 'Error al registrar');
      } else {
        setUserLogin(data.user, data.token);
        setRegisterSuccess('');
        showToast('¡Registro exitoso! Ya puedes disfrutar del campus.', 'success');
        setIsVisible(false);
        onClose && onClose();
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 10);
        setRegisterData({ email: '', password: '', confirmPassword: '', name: '' });
      }
    } catch (err) {
      setRegisterError('Error de red');
    } finally {
      setRegisterLoading(false);
    }

  };
  const handleForgotPassword = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose && onClose();
      navigate('/forgot-password');
    }, 350);

  };
  const handleGoogleSuccess = () => {
    setIsVisible(false);
    onClose && onClose();
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 10);

  };

  const login = useNativeValidation(handleLoginSubmit);
  const register = useNativeValidation(handleRegisterSubmit);
  const [confirmBlurs, setConfirmBlurs] = useState(0);

  return (
    <AuthDialog
      open={isVisible}
      onRequestClose={handleClose}
      onExited={handleExited}
      labelledBy={titleId}
      initialFocusRef={firstFieldRef}
    >
        <div className="relative flex flex-col px-5 pb-8 pt-6 sm:px-10 sm:pb-10 sm:pt-8">
          <button
            onClick={handleClose}
            aria-label="Cerrar"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-white/[0.08] hover:text-ink"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          <div className="flex items-center gap-3 pr-12">
            <img src={LOGO} alt="" className="h-10 w-10 shrink-0 object-contain" />
            <p className="text-footnote text-ink-3">
              El cambio comienza con la <span className="text-brand">formación</span>.
            </p>
          </div>
          <h2 id={titleId} className="relative mt-6 text-title-2 font-bold text-ink">
            <Swap id={tab}>{tab === 'login' ? 'Bienvenido de nuevo' : 'Empieza tu formación'}</Swap>
          </h2>
          <p className="relative mt-2 text-sm text-ink-2">
            <Swap id={tab}>{tab === 'login' ? 'Accede para seguir con tus cursos.' : 'Empieza a formarte hoy. Solo te llevará un minuto.'}</Swap>
          </p>
          <div className="mt-6">
            <AuthTabs value={tab} onChange={setTab} idPrefix={tabsId} />
          </div>
          <AutoHeight className="mt-6">
            <AnimatePresence mode="popLayout" initial={false}>
              {tab === 'login' ? (
                <motion.form
                  key="login"
                  id={panelId(tabsId, 'login')}
                  role="tabpanel"
                  aria-labelledby={tabId(tabsId, 'login')}
                  noValidate
                  {...panelMotion(-1)}
                  className="flex flex-col gap-5"
                  aria-busy={loginLoading || undefined}
                  onSubmit={login.onSubmit}
                  onInput={login.onInput}
                >
                  <TextField
                    ref={firstFieldRef}
                    id="login-email"
                    label="Correo electrónico"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="off"
                    spellCheck={false}
                    placeholder="tu@email.com"
                    value={loginData.email}
                    onChange={e => setLoginData(d => ({ ...d, email: e.target.value }))}
                    readOnly={loginLoading}
                    required
                    error={login.errors.email}
                  />
                  <PasswordField
                    id="login-password"
                    label="Contraseña"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Contraseña"
                    value={loginData.password}
                    onChange={e => setLoginData(d => ({ ...d, password: e.target.value }))}
                    readOnly={loginLoading}
                    required
                    error={login.errors.password}
                    labelAction={(
                      <button
                        type="button"
                        className="-my-3 inline-flex min-h-11 items-center rounded-md text-sm text-brand transition-colors hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
                        onClick={handleForgotPassword}
                      >¿Has olvidado tu contraseña?</button>
                    )}
                  />
                  <ServerAlert message={loginError} />
                  <SubmitButton loading={loginLoading} loadingText="Accediendo...">Acceder</SubmitButton>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  id={panelId(tabsId, 'register')}
                  role="tabpanel"
                  aria-labelledby={tabId(tabsId, 'register')}
                  noValidate
                  {...panelMotion(1)}
                  className="flex flex-col gap-5"
                  aria-busy={registerLoading || undefined}
                  onSubmit={register.onSubmit}
                  onInput={register.onInput}
                >
                  <TextField
                    ref={firstFieldRef}
                    id="register-name"
                    label="Nombre"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Nombre"
                    value={registerData.name}
                    onChange={e => setRegisterData(d => ({ ...d, name: e.target.value }))}
                    readOnly={registerLoading}
                    required
                    error={register.errors.name}
                  />
                  <TextField
                    id="register-email"
                    label="Correo electrónico"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="off"
                    spellCheck={false}
                    placeholder="tu@email.com"
                    value={registerData.email}
                    onChange={e => setRegisterData(d => ({ ...d, email: e.target.value }))}
                    readOnly={registerLoading}
                    required
                    error={register.errors.email}
                  />
                  <PasswordField
                    id="register-password"
                    label="Contraseña"
                    name="password"
                    autoComplete="new-password"
                    placeholder="Contraseña"
                    value={registerData.password}
                    onChange={e => setRegisterData(d => ({ ...d, password: e.target.value }))}
                    readOnly={registerLoading}
                    required
                    error={register.errors.password}
                  />
                  <PasswordField
                    id="register-confirm"
                    label="Repetir contraseña"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Repite la contraseña"
                    value={registerData.confirmPassword}
                    onChange={e => setRegisterData(d => ({ ...d, confirmPassword: e.target.value }))}
                    onBlur={() => setConfirmBlurs(n => n + 1)}
                    readOnly={registerLoading}
                    required
                    error={register.errors.confirmPassword}
                    hint={<PasswordMatchHint password={registerData.password} confirm={registerData.confirmPassword} />}
                  />
                  <PasswordMatchAnnouncer password={registerData.password} confirm={registerData.confirmPassword} flushKey={confirmBlurs} />
                  <ServerAlert message={registerError} />
                  <SubmitButton loading={registerLoading} loadingText="Registrando...">Registrarse</SubmitButton>
                </motion.form>
              )}
            </AnimatePresence>
          </AutoHeight>
          <div className="mt-6 flex flex-col gap-6">
            <AuthDivider />
            <GoogleAuthButton onSuccess={handleGoogleSuccess} />
          </div>
        </div>
    </AuthDialog>
  );
};

export default AuthModal;
