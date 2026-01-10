import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';

import LanguageToggle from './LanguageToggle';
import { useState } from 'react';

const MobileMenu = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/', labelES: 'Inicio', labelEN: 'Home' },
    { path: '/order', labelES: 'Ordenar Pastel', labelEN: 'Order Cake' },
    { path: '/gallery', labelES: 'Galería', labelEN: 'Gallery' },
    { path: '/menu', labelES: 'Menú', labelEN: 'Menu' },
    { path: '/about', labelES: 'Sobre Nosotros', labelEN: 'About Us' },
    { path: '/faq', labelES: 'FAQ', labelEN: 'FAQ' },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-[#C6A649] bg-[#C6A649]/10 border border-[#C6A649]/20 transition-all hover:bg-[#C6A649]/20"
          aria-label={t('Menú', 'Menu')}
        >
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-black border-l border-white/10 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/4 -right-20 w-64 h-64 bg-[#C6A649]/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 -left-20 w-48 h-48 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />

        <div className="flex flex-col h-full relative z-10">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-display text-2xl font-black text-white uppercase tracking-tighter">
              {t('Menú', 'Menu')} <span className="text-[#C6A649]">.</span>
            </h2>
            <div className="flex items-center gap-6">
              <LanguageToggle />
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                aria-label={t('Cerrar', 'Close')}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <nav className="flex-1">
            <ul className="space-y-4">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={`block px-6 py-4 rounded-2xl font-sans font-bold uppercase tracking-[0.2em] text-sm transition-all duration-300 ${isActive(item.path)
                      ? 'bg-white/10 border border-[#C6A649]/30 text-[#C6A649] shadow-[0_0_20px_rgba(198,166,73,0.1)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {t(item.labelES, item.labelEN)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto pt-8 border-t border-white/10">
            <div className="px-2">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C6A649] mb-4">
                {t('Contacto', 'Contact')}
              </p>
              <a
                href="tel:+16102796200"
                className="block text-xl font-black text-white tracking-tight hover:text-[#C6A649] transition-all"
              >
                (610) 279-6200
              </a>
              <p className="mt-2 text-xs text-gray-500 font-medium">324 W Marshall St, Norristown</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;

