import { useLanguage } from '@/contexts/LanguageContext';
import { Facebook, Instagram, MapPin, Phone, Clock, ArrowUp, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import NewsletterSignup from '@/components/newsletter/NewsletterSignup';
import logoImage from '@/assets/brand/logo.png';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-[#C6A649]/20 bg-gradient-to-b from-[#0a0a0a] to-[#111] text-white overflow-hidden">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#C6A649]/50 to-transparent blur-sm" />

      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-4 md:grid-cols-2">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="inline-block group">
              <div className="flex items-center gap-3">
                <img
                  src={logoImage}
                  alt={t('Logo de Eli\'s Bakery', 'Eli\'s Bakery Logo')}
                  className="h-14 w-14 object-contain drop-shadow-[0_0_15px_rgba(198,166,73,0.3)] transition-transform group-hover:scale-105"
                />
                <div className="flex flex-col">
                  <span className="font-display text-2xl font-bold leading-none text-[#C6A649] tracking-wide">
                    Eli's Bakery
                  </span>
                  <span className="text-xs font-medium text-white/60 tracking-[0.2em] uppercase">
                    Café & Panadería
                  </span>
                </div>
              </div>
            </Link>
            <p className="font-sans text-sm leading-relaxed text-white/70 max-w-xs">
              {t('home.familyTradition')}
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/elispasteleria"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-[#C6A649] transition-all hover:bg-[#C6A649] hover:text-black hover:scale-110 hover:shadow-[0_0_20px_rgba(198,166,73,0.4)]"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/elisbakery_cafe/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-[#C6A649] transition-all hover:bg-[#C6A649] hover:text-black hover:scale-110 hover:shadow-[0_0_20px_rgba(198,166,73,0.4)]"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-6 font-display text-lg font-bold text-[#C6A649] tracking-wide relative inline-block">
              {t('navigation.quickLinks')}
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-[#C6A649]/50 rounded-full"></span>
            </h3>
            <ul className="space-y-3 font-sans text-sm">
              {[
                { to: "/", label: t('navigation.home') },
                { to: "/order", label: t('navigation.orderCake') },
                { to: "/gallery", label: t('navigation.gallery') },
                { to: "/menu", label: t('navigation.menu') },
                { to: "/faq", label: t('navigation.faq') },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="flex items-center gap-2 text-white/70 transition-all hover:text-[#C6A649] hover:translate-x-1 group"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C6A649] opacity-0 transition-opacity group-hover:opacity-100" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-6 font-display text-lg font-bold text-[#C6A649] tracking-wide relative inline-block">
              {t('navigation.contact')}
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-[#C6A649]/50 rounded-full"></span>
            </h3>
            <ul className="space-y-4 font-sans text-sm text-white/70">
              <li className="flex items-start gap-3 group">
                <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#C6A649]/10 text-[#C6A649] transition-colors group-hover:bg-[#C6A649] group-hover:text-black">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="leading-relaxed group-hover:text-white transition-colors">324 W Marshall St,<br />Norristown, PA 19401</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#C6A649]/10 text-[#C6A649] transition-colors group-hover:bg-[#C6A649] group-hover:text-black">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="group-hover:text-white transition-colors">(610) 279-6200</span>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#C6A649]/10 text-[#C6A649] transition-colors group-hover:bg-[#C6A649] group-hover:text-black">
                  <Clock className="h-4 w-4" />
                </div>
                <span className="group-hover:text-white transition-colors">{t('home.hours')}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="mb-6 font-display text-lg font-bold text-[#C6A649] tracking-wide relative inline-block">
              Newsletter
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-[#C6A649]/50 rounded-full"></span>
            </h3>
            <p className="mb-4 text-sm text-white/70">
              {t('footer.newsletterDesc', 'Subscribe for news and special offers.')}
            </p>
            <div className="bg-white/5 rounded-xl border border-white/10 p-1 backdrop-blur-sm shadow-lg">
              <NewsletterSignup
                variant="compact"
                className="w-full"
                inputClassName="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#C6A649] focus:ring-1 focus:ring-[#C6A649]"
                buttonClassName="bg-[#C6A649] hover:bg-[#B5953F] text-black hover:text-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-center font-sans text-xs text-white/50 md:text-left">
              © {currentYear} Eli's Bakery Cafe. {t('home.allRightsReserved')}
            </p>

            <div className="flex flex-wrap gap-6 justify-center">
              {[
                { to: "/legal/privacy", label: t('navigation.privacy', 'Privacy Policy') },
                { to: "/legal/terms", label: t('navigation.terms', 'Terms of Service') },
                { to: "/legal/refund", label: t('Política de Reembolso', 'Refund Policy') },
                { to: "/login", label: t('Acceso Staff', 'Staff Login') }
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-xs text-white/50 hover:text-[#C6A649] transition-colors hover:underline decoration-[#C6A649]/50"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={scrollToTop}
              className="rounded-full bg-white/5 text-white/70 hover:bg-[#C6A649] hover:text-black hover:scale-110 transition-all border border-white/5"
              aria-label="Scroll to top"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
