import PageBackground from './PageBackground';
import Header from './Header';
import Footer from './Footer';
import CookieBanner from '../cookies/CookieBanner';

const Layout = ({ children }) => {
  return (
    <PageBackground>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
      <CookieBanner />
    </PageBackground>
  );
};

export default Layout;