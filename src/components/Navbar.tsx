import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import MobileMenu from './MobileMenu';
import logoImage from '@/assets/brand/logo.png';
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

  const navLinks = [
    { to: "/", label: t('navigation.home') },
    { to: "/order", label: t('navigation.orderCake') },
    { to: "/gallery", label: t('navigation.gallery') },
    { to: "/menu", label: t('navigation.menu') },
    { to: "/about", label: t('navigation.aboutUs') },
    { to: "/faq", label: t('navigation.faq') },
  ];

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-500 ${isScrolled
      ? 'bg-black/80 border-b border-white/10 backdrop-blur-xl'
      : 'bg-transparent border-b border-transparent'
      }`}>
      <div className="container relative mx-auto flex h-28 items-center justify-between px-4">
        {/* Mobile menu button - visible on small screens */}
        <div className="md:hidden">
          <MobileMenu />
        </div>

        {/* Desktop navigation - hidden on small screens */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative font-sans text-sm font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:text-[#C6A649] ${isActive(link.to) ? 'text-[#C6A649]' : 'text-white/70'
                }`}
            >
              {link.label}
              {isActive(link.to) && (
                <span className="absolute -bottom-2 left-0 h-0.5 w-full bg-gradient-to-r from-transparent via-[#C6A649] to-transparent shadow-[0_0_10px_rgba(198,166,73,0.5)]" />
              )}
            </Link>
          ))}
        </div>

        {/* Right Side: Language & Logo */}
        <div className="flex items-center gap-6">
          {/* Language Toggle - Desktop only */}
          <div className="hidden md:block relative z-20">
            <LanguageToggle />
          </div>

          <Link to="/" className="flex items-center transition-smooth hover:opacity-80">
            <img
              src={logoImage}
              alt={t('Logo de Eli\'s Bakery', 'Eli\'s Bakery Logo')}
              className="h-20 w-20 object-contain md:h-32 md:w-32 drop-shadow-[0_0_15px_rgba(198,166,73,0.2)]"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
