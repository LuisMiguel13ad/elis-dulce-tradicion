import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import { Coffee } from 'lucide-react';

const Navbar = () => {
  const { t } = useLanguage();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 transition-smooth hover:opacity-80">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-glow">
            <Coffee className="h-6 w-6 text-secondary" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold leading-none text-gradient-gold">
              Eli's Bakery
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              Café & Panadería
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            to="/"
            className={`font-sans font-semibold transition-smooth hover:text-primary ${
              isActive('/') ? 'text-primary' : 'text-foreground'
            }`}
          >
            {t('Inicio', 'Home')}
          </Link>
          <Link
            to="/order"
            className={`font-sans font-semibold transition-smooth hover:text-primary ${
              isActive('/order') ? 'text-primary' : 'text-foreground'
            }`}
          >
            {t('Ordenar Pastel', 'Order Cake')}
          </Link>
          <Link
            to="/gallery"
            className={`font-sans font-semibold transition-smooth hover:text-primary ${
              isActive('/gallery') ? 'text-primary' : 'text-foreground'
            }`}
          >
            {t('Galería', 'Gallery')}
          </Link>
        </div>

        <LanguageToggle />
      </div>
    </nav>
  );
};

export default Navbar;
