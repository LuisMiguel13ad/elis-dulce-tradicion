import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import logoImage from '@/assets/TransparentLogo.png';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`fixed top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300 ${
      isScrolled 
        ? 'bg-background/80 border-border/50' 
        : 'bg-transparent border-transparent'
    }`}>
      <div className="container relative mx-auto flex h-28 items-center justify-between px-4">
        <div className="hidden items-center gap-8 md:flex">
          <Link
            to="/"
            className="font-sans font-semibold text-primary transition-smooth hover:opacity-80"
          >
            {t('Inicio', 'Home')}
          </Link>
          <Link
            to="/order"
            className="font-sans font-semibold text-primary transition-smooth hover:opacity-80"
          >
            {t('Ordenar Pastel', 'Order Cake')}
          </Link>
          <Link
            to="/gallery"
            className="font-sans font-semibold text-primary transition-smooth hover:opacity-80"
          >
            {t('Galería', 'Gallery')}
          </Link>
          <Link
            to="/menu"
            className="font-sans font-semibold text-primary transition-smooth hover:opacity-80"
          >
            {t('Menú', 'Menu')}
          </Link>
        </div>

        {/* Language toggle absolutely centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <LanguageToggle />
        </div>

        <Link to="/" className="flex items-center transition-smooth hover:opacity-80">
          <img 
            src={logoImage} 
            alt="Eli's Bakery Logo" 
            className="h-32 w-32 object-contain"
          />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
