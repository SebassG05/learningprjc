import React, { useState, useRef, useLayoutEffect } from 'react';
import GoogleAuthButton from './GoogleAuthButton.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useUser } from '../../context/UserContext.jsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

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

  const [isVisible, setIsVisible] = useState(open);
  React.useEffect(() => {
    if (open) setIsVisible(true);
  }, [open]);
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose && onClose();
    }, 350);
  };

  return (
    <AnimatePresence>
      {open || isVisible ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e2d23]/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          style={{ pointerEvents: open ? 'auto' : 'none' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: -60 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="relative flex w-full max-w-6xl min-h-[750px] overflow-hidden rounded-2xl"
            style={{ minHeight: 750 }}
          >
        {/* Left: Logo & frase */}
        <div className="hidden md:flex flex-col items-center justify-center text-green-300 p-20 w-1/2 border-r border-[#22332a] min-h-[750px]" style={{background:'#2D3C40'}}>
          <img src="/imgs/logo.png" alt="Logo" className="w-40 h-40 mb-8" />
          <p className="text-3xl font-extrabold text-center leading-tight">“CADA JUGADA CUENTA,<br/>CADA PASO IMPORTA”</p>
        </div>
        {/* Right: Tabs & Forms */}
        <div className="flex-1 pt-8 pb-20 px-20 flex flex-col justify-center relative min-w-[500px] min-h-[750px] bg-[#232e26]" style={{background: '#0D0D0D'}}>
          <button onClick={handleClose} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-green-400">&times;</button>
          <div className="relative flex justify-between mb-8">
            <button
              ref={tabRefs.login}
              className={`cursor-pointer flex-1 pb-3 text-center font-bold transition-colors duration-200 ${tab === 'login' ? 'text-green-300' : 'text-gray-400'}`}
              style={{ letterSpacing: 0.5 }}
              onClick={() => setTab('login')}
            >
              ¿YA TIENES TU CUENTA?
            </button>
            <button
              ref={tabRefs.register}
              className={`cursor-pointer flex-1 pb-3 text-center font-bold transition-colors duration-200 ${tab === 'register' ? 'text-green-300' : 'text-gray-400'}`}
              style={{ letterSpacing: 0.5 }}
              onClick={() => setTab('register')}
            >
              ¿ERES NUEVO CLIENTE?
            </button>
            {/* Animated tab bar */}
            <motion.div
              className="absolute bottom-0 h-1 rounded-full"
              style={{
                left: tabBarStyle.left,
                width: tabBarStyle.width,
                background: '#95D982',
                zIndex: 40,
              }}
              layout
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          </div>
          <div className="relative flex-1 flex flex-col justify-start min-h-[500px] mt-8">
            <AnimatePresence mode="wait" initial={false}>
              {tab === 'login' ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="flex flex-col gap-3 absolute w-full"
                  style={{ minHeight: 500 }}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setLoginError('');
                    setLoginLoading(true);
                    try {
                      const res = await fetch('/api/users/login', {
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
                  <label className="font-bold text-green-200">Correo electrónico</label>
                  <input
                    type="email"
                    placeholder="email"
                    className="border border-[#22332a] bg-[#1e2d23] text-green-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={loginData.email}
                    onChange={e => setLoginData(d => ({ ...d, email: e.target.value }))}
                    required
                  />
                  <label className="font-bold text-green-200">Contraseña</label>
                  <input
                    type="password"
                    placeholder="contraseña"
                    className="border border-[#22332a] bg-[#1e2d23] text-green-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={loginData.password}
                    onChange={e => setLoginData(d => ({ ...d, password: e.target.value }))}
                    required
                  />
                  <button type="submit" className="cursor-pointer mt-4 px-6 py-2 rounded-lg font-bold shadow-md text-white transition" style={{background:'#95D982', color:'#181f1b'}} disabled={loginLoading}>
                    {loginLoading ? 'Accediendo...' : 'Acceder'}
                  </button>
                  {loginError && <div className="text-red-400 font-semibold text-center mt-2">{loginError}</div>}
                  <div className="flex items-start justify-between mt-2 w-full">
                    <span
                      className="text-sm text-green-300 hover:underline cursor-pointer mt-2"
                      onClick={() => {
                        setIsVisible(false);
                        setTimeout(() => {
                          onClose && onClose();
                          navigate('/forgot-password');
                        }, 350);
                      }}
                    >¿Has olvidado tu contraseña?</span>
                    <div style={{ marginLeft: '0.5rem', marginTop: '-1rem' }}>
                      <GoogleAuthButton onSuccess={() => {
                        setIsVisible(false);
                        onClose && onClose();
                        setTimeout(() => {
                          navigate('/', { replace: true });
                        }, 10);
                      }} />
                    </div>
                  </div>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="flex flex-col gap-3 absolute w-full"
                  style={{ minHeight: 500 }}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setRegisterError('');
                    setRegisterSuccess('');
                    setRegisterLoading(true);
                    try {
                      const res = await fetch('/api/users/register', {
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
                    <label className="font-bold text-green-200 mb-0">Nombre</label>
                    <input
                      type="text"
                      placeholder="nombre"
                      className="border border-[#22332a] bg-[#1e2d23] text-green-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                      value={registerData.name}
                      onChange={e => setRegisterData(d => ({ ...d, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2 mt-3">
                    <label className="font-bold text-green-200 mb-0">Correo electrónico</label>
                    <input
                      type="email"
                      placeholder="email"
                      className="border border-[#22332a] bg-[#1e2d23] text-green-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                      value={registerData.email}
                      onChange={e => setRegisterData(d => ({ ...d, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2 mt-3">
                    <label className="font-bold text-green-200 mb-0">Contraseña</label>
                    <input
                      type="password"
                      placeholder="contraseña"
                      className="border border-[#22332a] bg-[#1e2d23] text-green-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                      value={registerData.password}
                      onChange={e => setRegisterData(d => ({ ...d, password: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2 mt-3">
                    <label className="font-bold text-green-200 mb-0">Repetir contraseña</label>
                    <input
                      type="password"
                      placeholder="repite la contraseña"
                      className="border border-[#22332a] bg-[#1e2d23] text-green-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                      value={registerData.confirmPassword}
                      onChange={e => setRegisterData(d => ({ ...d, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="cursor-pointer mt-4 px-6 py-2 rounded-lg font-bold shadow-md text-white transition disabled:opacity-60"
                    style={{background:'#95D982', color:'#181f1b'}}
                    disabled={registerLoading}
                  >
                    {registerLoading ? 'Registrando...' : 'Registrarse'}
                  </button>
                  {registerError && <div className="text-red-400 font-semibold text-center mt-2">{registerError}</div>}
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
      </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default AuthModal;
