import { useLanguage } from '@/contexts/LanguageContext';
import { Coffee, Facebook, Instagram, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80">
                <Coffee className="h-6 w-6 text-secondary" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold leading-none text-primary">
                  Eli's Bakery
                </span>
                <span className="text-xs font-semibold text-background/70">
                  Café & Panadería
                </span>
              </div>
            </div>
            <p className="font-sans text-sm text-background/80">
              {t(
                'Tradición familiar desde 1995. Sabores que celebran la vida.',
                'Family tradition since 1995. Flavors that celebrate life.'
              )}
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-display text-lg font-bold text-primary">
              {t('Enlaces Rápidos', 'Quick Links')}
            </h3>
            <ul className="space-y-2 font-sans text-sm">
              <li>
                <Link to="/" className="text-background/80 transition-smooth hover:text-primary">
                  {t('Inicio', 'Home')}
                </Link>
              </li>
              <li>
                <Link to="/order" className="text-background/80 transition-smooth hover:text-primary">
                  {t('Ordenar Pastel', 'Order Cake')}
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-background/80 transition-smooth hover:text-primary">
                  {t('Galería', 'Gallery')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-display text-lg font-bold text-primary">
              {t('Contacto', 'Contact')}
            </h3>
            <ul className="space-y-2 font-sans text-sm text-background/80">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>846 Street Rd., Bensalem, PA</span>
              </li>
              <li>610-910-9067</li>
              <li>{t('Lunes – Domingo: 9am – 8pm', 'Monday – Sunday: 9am – 8pm')}</li>
            </ul>
            <div className="mt-4 flex gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary transition-smooth hover:bg-primary hover:text-secondary"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary transition-smooth hover:bg-primary hover:text-secondary"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-background/20 pt-8 text-center">
          <p className="font-sans text-sm text-background/70">
            © {currentYear} Eli&apos;s Bakery Cafe. {t('Todos los derechos reservados.', 'All rights reserved.')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
