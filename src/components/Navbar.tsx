import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import MobileMenu from './MobileMenu';
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
        {/* Mobile menu button - visible on small screens */}
        <div className="md:hidden">
          <MobileMenu />
        </div>

        {/* Desktop navigation - hidden on small screens */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            to="/"
            className="font-sans font-semibold text-primary transition-smooth hover:opacity-80"
          >
            {t('navigation.home')}
          </Link>
          <Link
            to="/order"
            className="font-sans font-semibold text-primary transition-smooth hover:opacity-80"
          >
            {t('navigation.orderCake')}
          </Link>
          <Link
            to="/gallery"
            className="font-sans font-semibold text-primary transition-smooth hover:opacity-80"
          >
            {t('navigation.gallery')}
          </Link>
          <Link
            to="/menu"
            className="font-sans font-semibold text-primary transition-smooth hover:opacity-80"
          >
            {t('navigation.menu')}
          </Link>
          <Link
            to="/about"
            className="font-sans font-semibold text-primary transition-smooth hover:opacity-80"
          >
            {t('navigation.aboutUs')}
          </Link>
          <Link
            to="/faq"
            className="font-sans font-semibold text-primary transition-smooth hover:opacity-80"
          >
            {t('navigation.faq')}
          </Link>
        </div>

        {/* Language toggle absolutely centered - hidden on mobile */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
          <LanguageToggle />
        </div>

        <Link to="/" className="flex items-center transition-smooth hover:opacity-80">
          <img 
            src={logoImage} 
            alt="Eli's Bakery Logo" 
            className="h-20 w-20 object-contain md:h-32 md:w-32"
          />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
