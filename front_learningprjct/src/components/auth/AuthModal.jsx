import React, { useState, useRef, useLayoutEffect, useId } from 'react';
import GoogleAuthButton from './GoogleAuthButton.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useUser } from '../../context/UserContext.jsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../ui/Button';
import { inputClass } from '../ui/Field';
import { duration, ease, spring } from '../../lib/motion';
import AuthDialog from './AuthDialog';

const AuthModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { login: setUserLogin } = useUser();
  const { showToast } = useToast();
  const [tab, setTab] = useState('login');
  // Registro
  const [registerData, setRegisterData] = useState({ email: '', password: '', confirmPassword: '', name: '' });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

    // Login
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  const tabRefs = {
    login: useRef(null),
    register: useRef(null),
  };
  const [tabBarStyle, setTabBarStyle] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const ref = tabRefs[tab].current;
    if (ref) {
      setTabBarStyle({
        left: ref.offsetLeft,
        width: ref.offsetWidth,
      });
    }
  }, [tab]);


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
  const firstFieldRef = useRef(null);

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
          <h2 id={titleId} className="pr-10 text-title-2 font-bold text-ink">
            {tab === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </h2>
          <p className="mt-2 text-sm text-ink-2">
            {tab === 'login' ? '¿Ya tienes tu cuenta? Accede para continuar.' : '¿Eres nuevo cliente? Regístrate en un minuto.'}
          </p>
          {/* Control segmentado */}
          <div className="relative mt-6 flex rounded-full bg-surface-3/70 p-1" role="tablist">
            <motion.div
              className="absolute inset-y-1 rounded-full bg-white/[0.1] ring-1 ring-inset ring-white/10"
              initial={false}
              animate={{ x: tabBarStyle.left }}
              style={{ left: 0, width: tabBarStyle.width }}
              transition={spring.glide}
              aria-hidden="true"
            />
            <button
              ref={tabRefs.login}
              role="tab"
              aria-selected={tab === 'login'}
              className={`relative z-10 flex-1 rounded-full py-2 text-sm font-semibold transition-colors duration-200 ${tab === 'login' ? 'text-ink' : 'text-ink-3 hover:text-ink-2'}`}
              onClick={() => setTab('login')}
            >
              Iniciar sesión
            </button>
            <button
              ref={tabRefs.register}
              role="tab"
              aria-selected={tab === 'register'}
              className={`relative z-10 flex-1 rounded-full py-2 text-sm font-semibold transition-colors duration-200 ${tab === 'register' ? 'text-ink' : 'text-ink-3 hover:text-ink-2'}`}
              onClick={() => setTab('register')}
            >
              Registrarse
            </button>
          </div>
          <div className="relative mt-6">
            <AnimatePresence mode="wait" initial={false}>
              {tab === 'login' ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: duration.fast, ease: ease.outExpo }}
                  className="flex flex-col gap-4"
                  onSubmit={async (e) => {
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
                  }}
                >
                  <div className="flex flex-col gap-2">
                    <label htmlFor="login-email" className="text-sm font-medium text-ink-2">Correo electrónico</label>
                    <input
                      id="login-email"
                      ref={firstFieldRef}
                      type="email"
                      autoComplete="email"
                      placeholder="tu@email.com"
                      className={inputClass}
                      value={loginData.email}
                      onChange={e => setLoginData(d => ({ ...d, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between">
                      <label htmlFor="login-password" className="text-sm font-medium text-ink-2">Contraseña</label>
                      <button
                        type="button"
                        className="text-sm text-brand transition-colors hover:text-brand-300"
                        onClick={() => {
                        setIsVisible(false);
                        setTimeout(() => {
                          onClose && onClose();
                          navigate('/forgot-password');
                        }, 350);
                      }}
                      >¿Has olvidado tu contraseña?</button>
                    </div>
                    <input
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="Contraseña"
                      className={inputClass}
                      value={loginData.password}
                      onChange={e => setLoginData(d => ({ ...d, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" size="lg" className="mt-2 w-full" disabled={loginLoading}>
                    {loginLoading ? 'Accediendo...' : 'Acceder'}
                  </Button>
                  {loginError && <div role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-red-300">{loginError}</div>}
                  <div className="flex items-center gap-3 text-xs text-ink-3" aria-hidden="true">
                    <span className="h-px flex-1 bg-line" />o<span className="h-px flex-1 bg-line" />
                  </div>
                  <GoogleAuthButton onSuccess={() => {
                        setIsVisible(false);
                        onClose && onClose();
                        setTimeout(() => {
                          navigate('/', { replace: true });
                        }, 10);
                      }} />
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: duration.fast, ease: ease.outExpo }}
                  className="flex flex-col gap-4"
                  onSubmit={async (e) => {
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
                  }}
                >
                  <div className="flex flex-col gap-2">
                    <label htmlFor="register-name" className="text-sm font-medium text-ink-2">Nombre</label>
                    <input
                      id="register-name"
                      ref={firstFieldRef}
                      type="text"
                      autoComplete="name"
                      placeholder="Nombre"
                      className={inputClass}
                      value={registerData.name}
                      onChange={e => setRegisterData(d => ({ ...d, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="register-email" className="text-sm font-medium text-ink-2">Correo electrónico</label>
                    <input
                      id="register-email"
                      type="email"
                      autoComplete="email"
                      placeholder="tu@email.com"
                      className={inputClass}
                      value={registerData.email}
                      onChange={e => setRegisterData(d => ({ ...d, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="register-password" className="text-sm font-medium text-ink-2">Contraseña</label>
                      <input
                        id="register-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Contraseña"
                        className={inputClass}
                        value={registerData.password}
                        onChange={e => setRegisterData(d => ({ ...d, password: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="register-confirm" className="text-sm font-medium text-ink-2">Repetir contraseña</label>
                      <input
                        id="register-confirm"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Repite la contraseña"
                        className={inputClass}
                        value={registerData.confirmPassword}
                        onChange={e => setRegisterData(d => ({ ...d, confirmPassword: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" size="lg" className="mt-2 w-full" disabled={registerLoading}>
                    {registerLoading ? 'Registrando...' : 'Registrarse'}
                  </Button>
                  {registerError && <div role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-red-300">{registerError}</div>}
                  <div className="flex items-center gap-3 text-xs text-ink-3" aria-hidden="true">
                    <span className="h-px flex-1 bg-line" />o<span className="h-px flex-1 bg-line" />
                  </div>
                  {/* Google Auth Button debajo del registro */}
                  <GoogleAuthButton onSuccess={() => {
                    setIsVisible(false);
                    onClose && onClose();
                    setTimeout(() => {
                      navigate('/', { replace: true });
                    }, 10);
                  }} />
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
    </AuthDialog>
  );
};

export default AuthModal;
