/**
 * Terms of Service Page
 * Legal terms and conditions for using Eli's Bakery Cafe services
 */

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TermsOfService = () => {
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
              {t('Condiciones', 'Terms')}
            </span>
            <h1 className="mb-8 font-display text-5xl md:text-7xl font-black tracking-tight">
              {isSpanish ? 'Términos de' : 'Terms of'} <span className="text-[#C6A649] drop-shadow-[0_0_15px_rgba(198,166,73,0.3)]">{isSpanish ? 'Servicio' : 'Service'}</span>
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
                  <span className="text-[#C6A649]">01.</span> {isSpanish ? 'Información de la Empresa' : '1. Business Information'}
                </h2>
                <div className="space-y-4">
                  <p>
                    {isSpanish
                      ? 'Eli\'s Bakery Cafe ("nosotros", "nuestro", "la empresa") opera este sitio web y proporciona servicios de pastelería y panadería.'
                      : 'Eli\'s Bakery Cafe ("we", "our", "the company") operates this website and provides bakery and pastry services.'}
                  </p>
                  <div className="grid gap-6 sm:grid-cols-2 mt-6">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-[#C6A649] text-xs font-black uppercase mb-1 tracking-widest">{isSpanish ? 'Dirección' : 'Address'}</p>
                      <p className="text-white font-bold">824 W Main St, Norristown, PA 19401</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-[#C6A649] text-xs font-black uppercase mb-1 tracking-widest">Email</p>
                      <p className="text-white font-bold">elisbakerycafe@gmail.com</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <span className="text-[#C6A649]">02.</span> {isSpanish ? 'Aceptación de los Términos' : '2. Acceptance of Terms'}
                </h2>
                <p>
                  {isSpanish
                    ? 'Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos Términos de Servicio y a todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestros servicios.'
                    : 'By accessing and using this website, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you must not use our services.'}
                </p>
              </section>

              <section className="space-y-8">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <span className="text-[#C6A649]">03.</span> {isSpanish ? 'Términos de Pedidos' : '3. Order Terms'}
                </h2>

                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      {isSpanish ? '3.1 Depósitos y Pagos' : '3.1 Deposits and Payments'}
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex gap-4">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#C6A649] mt-2.5 shrink-0" />
                        <span>{isSpanish ? 'Todos los pedidos requieren pago completo al momento de la orden.' : 'All orders require full payment at the time of ordering.'}</span>
                      </li>
                      <li className="flex gap-4">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#C6A649] mt-2.5 shrink-0" />
                        <span>{isSpanish ? 'Pagos habilitados vía Square.' : 'Payments enabled via Square.'}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      {isSpanish ? '3.2 Cancelaciones' : '3.2 Cancellations'}
                    </h3>
                    <div className="grid gap-4">
                      <div className="flex justify-between p-4 border-b border-white/5">
                        <span className="text-gray-400 font-bold">{isSpanish ? '+ 48 Horas' : '+ 48 Hours'}</span>
                        <span className="text-[#C6A649] font-black">{isSpanish ? 'Reembolso Completo' : 'Full Refund'}</span>
                      </div>
                      <div className="flex justify-between p-4 border-b border-white/5">
                        <span className="text-gray-400 font-bold">24 - 48 Horas</span>
                        <span className="text-amber-500 font-black">50% {isSpanish ? 'Reembolso' : 'Refund'}</span>
                      </div>
                      <div className="flex justify-between p-4">
                        <span className="text-gray-400 font-bold">{isSpanish ? '- 24 Horas' : '< 24 Hours'}</span>
                        <span className="text-red-500 font-black">{isSpanish ? 'Sin Reembolso' : 'No Refund'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <span className="text-[#C6A649]">04.</span> {isSpanish ? 'Términos de Entrega' : '4. Delivery Terms'}
                </h2>
                <p>
                  {isSpanish
                    ? 'Los tiempos de entrega son estimados. Debe estar presente para recibir el producto. No somos responsables por daños posteriores a la entrega.'
                    : 'Delivery times are estimates. You must be present to receive the product. We are not responsible for damages after delivery.'}
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <span className="text-[#C6A649]">05.</span> {isSpanish ? 'Alérgenos' : '5. Allergens'}
                </h2>
                <div className="bg-amber-500/10 border-l-4 border-amber-500 p-8 rounded-r-2xl">
                  <p className="font-bold text-white mb-4 uppercase tracking-widest text-[#C6A649]">{isSpanish ? 'ADVERTENCIA IMPORTANTE:' : 'IMPORTANT WARNING:'}</p>
                  <p className="text-sm">
                    {isSpanish
                      ? 'Nuestros productos pueden contener trigo, huevos, leche, soja, nueces y maní. Aunque evitamos la contaminación cruzada, no podemos garantizar un entorno 100% libre de alérgenos.'
                      : 'Our products may contain wheat, eggs, milk, soy, nuts, and peanuts. While we avoid cross-contamination, we cannot guarantee a 100% allergen-free environment.'}
                  </p>
                </div>
              </section>

              <section className="space-y-6 pt-10 border-t border-white/10 text-center">
                <p className="text-sm text-gray-500 italic">
                  {isSpanish
                    ? 'Para más información, contáctenos directamente al (610) 639-5299.'
                    : 'For more information, contact us directly at (610) 639-5299.'}
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

export default TermsOfService;
