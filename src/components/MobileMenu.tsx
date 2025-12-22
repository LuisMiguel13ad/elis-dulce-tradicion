import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
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
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-primary hover:bg-primary/10 transition-smooth"
          aria-label={t('Menú', 'Menu')}
        >
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background border-l border-border">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl font-bold text-primary">
              {t('Menú', 'Menu')}
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg hover:bg-muted transition-smooth"
              aria-label={t('Cerrar', 'Close')}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="flex-1">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-sans font-semibold transition-smooth ${
                      isActive(item.path)
                        ? 'bg-primary text-secondary'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {t(item.labelES, item.labelEN)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto pt-8 border-t border-border">
            <div className="px-4">
              <p className="text-sm text-muted-foreground mb-2">
                {t('Contacto', 'Contact')}
              </p>
              <a
                href="tel:+16109109067"
                className="block text-primary font-semibold hover:opacity-80 transition-smooth"
              >
                (610) 279-6200
              </a>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;

