// Sobre Nosotros: quiénes somos, misión, visión y valores, el equipo, testimonios y una salida clara.
// La página solo compone escenas; textos y datos viven en components/about/aboutCopy.js.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/auth/LazyAuthModal';
import AboutBackdrop from '../components/about/AboutBackdrop';
import AboutHero from '../components/about/AboutHero';
import AboutEssence from '../components/about/AboutEssence';
import AboutTeam from '../components/about/AboutTeam';
import AboutTestimonials from '../components/about/AboutTestimonials';
import AboutClosing from '../components/about/AboutClosing';
import { PAGE_DESCRIPTION, PAGE_TITLE } from '../components/about/aboutCopy';
import { useUser } from '../context/UserContext';
import usePageMeta from '../hooks/usePageMeta';

const shell = 'mx-auto w-full max-w-site px-gutter';

export default function SobreNosotros() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showLogin, setShowLogin] = useState(false);

  usePageMeta(PAGE_TITLE, PAGE_DESCRIPTION);

  // La misma acción que «Comenzar ahora» en la home
  const handleStart = () => {
    if (user) navigate('/cursos');
    else setShowLogin(true);
  };

  return (
    <div className="relative isolate">
      <AboutBackdrop />
      {showLogin && <AuthModal open={showLogin} onClose={() => setShowLogin(false)} />}

      <div className={shell}>
        {/* El hero llena la primera pantalla: lo que entra animado queda bajo el pliegue y no retrasa el LCP */}
        <AboutHero className="flex min-h-[calc(100svh-var(--spacing-header))] flex-col justify-center pb-24 pt-12 lg:min-h-[calc(100svh-var(--spacing-header-lg))]" />
        <AboutEssence />
        <AboutTeam className="about-deferred mt-32 sm:mt-44" />
        <AboutTestimonials className="about-deferred mt-32 sm:mt-44" />
      </div>

      <AboutClosing onStart={handleStart} className="about-deferred mt-32 sm:mt-44" />
    </div>
  );
}
