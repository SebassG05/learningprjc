import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-[#2a2a2a] border-b border-[#444444] py-4">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-[#a1db87]">
            Tu Logo
          </Link>
          <div className="flex gap-6">
            <Link to="/" className="text-white hover:text-[#a1db87] transition-colors">
              Inicio
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;