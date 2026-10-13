import PageBackground from './PageBackground';
import Header from './Header';
import CookieBanner from '../cookies/CookieBanner';

const Layout = ({ children }) => {
  return (
    <PageBackground>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-brand"
      >
        Saltar al contenido
      </a>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main id="contenido" className="flex-grow">
          {children}
        </main>
      </div>
      <CookieBanner />
    </PageBackground>
  );
};

export default Layout;