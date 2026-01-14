import PageBackground from './PageBackground';
import Header from './Header';
import Footer from './Footer';

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
    </PageBackground>
  );
};

export default Layout;