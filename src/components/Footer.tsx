import { useLanguage } from '@/contexts/LanguageContext';
import { Facebook, Instagram, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import NewsletterSignup from '@/components/newsletter/NewsletterSignup';
import logoImage from '@/assets/TransparentLogo.png';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <img 
                src={logoImage} 
                alt="Eli's Bakery Logo" 
                className="h-12 w-12 object-contain"
              />
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
              {t('home.familyTradition')}
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-display text-lg font-bold text-primary">
              {t('navigation.quickLinks')}
            </h3>
            <ul className="space-y-2 font-sans text-sm">
              <li>
                <Link to="/" className="text-background/80 transition-smooth hover:text-primary">
                  {t('navigation.home')}
                </Link>
              </li>
              <li>
                <Link to="/order" className="text-background/80 transition-smooth hover:text-primary">
                  {t('navigation.orderCake')}
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-background/80 transition-smooth hover:text-primary">
                  {t('navigation.gallery')}
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-background/80 transition-smooth hover:text-primary">
                  {t('navigation.menu')}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-background/80 transition-smooth hover:text-primary">
                  {t('navigation.faq')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-display text-lg font-bold text-primary">
              {t('navigation.contact')}
            </h3>
            <ul className="space-y-2 font-sans text-sm text-background/80">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span>324 W Marshall St, Norristown, PA 19401</span>
              </li>
              <li>(610) 279-6200</li>
              <li>{t('home.hours')}</li>
            </ul>
            <div className="mt-4 flex gap-3">
              <a
                href="https://www.facebook.com/elispasteleria"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary transition-smooth hover:bg-primary hover:text-secondary"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/elisbakery_cafe/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary transition-smooth hover:bg-primary hover:text-secondary"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-background/20 pt-8">
          <div className="mb-6">
            <NewsletterSignup variant="compact" className="max-w-md mx-auto" />
          </div>
          <div className="flex flex-col items-center justify-center gap-4 text-center font-sans text-sm text-background/70 sm:flex-row">
            <p>
              © {currentYear} Eli&apos;s Bakery Cafe. {t('home.allRightsReserved')}
            </p>
            <div className="hidden h-4 w-[1px] bg-background/20 sm:block" />
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/legal/privacy" className="hover:text-primary hover:underline">
                {t('navigation.privacy', 'Privacy Policy')}
              </Link>
              <Link to="/legal/terms" className="hover:text-primary hover:underline">
                {t('navigation.terms', 'Terms of Service')}
              </Link>
              <Link to="/legal/refund" className="hover:text-primary hover:underline">
                {t('Refund Policy', 'Refund Policy')}
              </Link>
              <Link to="/legal/cookie-policy" className="hover:text-primary hover:underline">
                {t('Cookie Policy', 'Cookie Policy')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
