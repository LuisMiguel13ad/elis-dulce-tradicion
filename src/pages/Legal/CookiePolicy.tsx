/**
 * Cookie Policy Page
 * Information about cookie usage and tracking
 */

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CookiePolicy = () => {
  const { language, t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const isSpanish = language === 'es';

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#C6A649]/30">
      <Navbar />

      <main className="pt-48 pb-32 overflow-hidden relative">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#C6A649]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 max-w-4xl">
          <div className="mb-20 text-center">
            <span className="inline-block px-4 py-1 rounded-full border border-[#C6A649]/30 bg-[#C6A649]/10 text-[#C6A649] text-sm font-bold tracking-[0.2em] uppercase mb-8 shadow-[0_0_20px_rgba(198,166,73,0.15)]">
              Cookies
            </span>
            <h1 className="mb-8 font-display text-5xl md:text-7xl font-black tracking-tight">
              {isSpanish ? 'Política de' : 'Cookie'} <span className="text-[#C6A649] drop-shadow-[0_0_15px_rgba(198,166,73,0.3)]">{isSpanish ? 'Cookies' : 'Policy'}</span>
            </h1>
            <div className="mx-auto mb-10 h-1.5 w-32 rounded-full bg-gradient-to-r from-transparent via-[#C6A649] to-transparent shadow-[0_0_10px_rgba(198,166,73,0.5)]" />
            <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">
              {isSpanish
                ? 'Última actualización: 9 de diciembre de 2024'
                : 'Last Updated: December 9, 2024'}
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-br from-[#C6A649]/10 to-transparent rounded-[2.5rem] blur-xl opacity-30 transition duration-500" />
            <div className="relative rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-10 md:p-14 shadow-2xl space-y-16 font-sans text-gray-300 leading-relaxed text-lg">

              <section className="space-y-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <span className="text-[#C6A649]">01.</span> {isSpanish ? '¿Qué son las Cookies?' : '1. What Are Cookies?'}
                </h2>
                <p>
                  {isSpanish
                    ? 'Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web. Las cookies nos ayudan a mejorar su experiencia al recordar sus preferencias y comprender cómo utiliza nuestro sitio.'
                    : 'Cookies are small text files that are stored on your device when you visit a website. Cookies help us improve your experience by remembering your preferences and understanding how you use our site.'}
                </p>
              </section>

              <section className="space-y-8">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <span className="text-[#C6A649]">02.</span> {isSpanish ? 'Tipos de Cookies' : '2. Types of Cookies'}
                </h2>
                <div className="grid gap-6">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="font-bold text-white mb-2">{isSpanish ? 'Cookies Esenciales' : 'Essential Cookies'}</h3>
                    <p className="text-sm">Necesarias para el funcionamiento básico del sitio y seguridad.</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="font-bold text-white mb-2">{isSpanish ? 'Cookies Analíticas' : 'Analytics Cookies'}</h3>
                    <p className="text-sm">Nos ayudan a entender cómo interactúa con el sitio (Google Analytics).</p>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <span className="text-[#C6A649]">03.</span> {isSpanish ? 'Gestión de Cookies' : '3. Managing Cookies'}
                </h2>
                <p>
                  {isSpanish
                    ? 'Puede gestionar sus preferencias a través de la configuración de su navegador o nuestro panel de privacidad.'
                    : 'You can manage your preferences through your browser settings or our privacy panel.'}
                </p>
                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                  {['Chrome', 'Firefox', 'Safari', 'Edge'].map(browser => (
                    <div key={browser} className="p-4 rounded-xl border border-white/5 bg-white/5 flex items-center justify-between">
                      <span className="font-bold text-white">{browser}</span>
                      <div className="h-1 w-1 rounded-full bg-[#C6A649]" />
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-6 pt-10 border-t border-white/10 text-center">
                <p className="text-sm text-gray-500 italic">
                  Eli's Bakery Cafe © 2024
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePolicy;
