/**
 * Refund Policy Page
 * Cancellation and refund policy
 */

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const RefundPolicy = () => {
  const { t, language } = useLanguage();

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
              {t('Garantía', 'Guarantee')}
            </span>
            <h1 className="mb-8 font-display text-5xl md:text-7xl font-black tracking-tight">
              {isSpanish ? 'Política de' : 'Refund'} <span className="text-[#C6A649] drop-shadow-[0_0_15px_rgba(198,166,73,0.3)]">{isSpanish ? 'Reembolsos' : 'Policy'}</span>
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
                  <span className="text-[#C6A649]">01.</span> {isSpanish ? 'Visión General' : '1. Overview'}
                </h2>
                <p>
                  {isSpanish
                    ? 'Esta Política de Reembolsos describe los términos y condiciones bajo los cuales Eli\'s Bakery Cafe procesa cancelaciones y reembolsos. Al realizar un pedido, usted acepta esta política.'
                    : 'This Refund Policy describes the terms and conditions under which Eli\'s Bakery Cafe processes cancellations and refunds. By placing an order, you agree to this policy.'}
                </p>
              </section>

              <section className="space-y-8">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <span className="text-[#C6A649]">02.</span> {isSpanish ? 'Política de Cancelación' : '2. Cancellation Policy'}
                </h2>
                <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
                    <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-green-500 rounded-full" />
                      {isSpanish ? 'Más de 48 horas de anticipación' : 'More than 48 hours in advance'}
                    </h4>
                    <p className="text-sm">
                      {isSpanish
                        ? 'Reembolso completo del monto pagado. El reembolso se procesará dentro de 5-10 días hábiles.'
                        : 'Full refund of the amount paid. Refund will be processed within 5-10 business days.'}
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
                    <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-yellow-500 rounded-full" />
                      {isSpanish ? '24-48 horas de anticipación' : '24-48 hours in advance'}
                    </h4>
                    <p className="text-sm">
                      {isSpanish
                        ? 'Reembolso del 50% del monto pagado. El reembolso se procesará dentro de 5-10 días hábiles.'
                        : '50% refund of the amount paid. Refund will be processed within 5-10 business days.'}
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
                    <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-red-500 rounded-full" />
                      {isSpanish ? 'Menos de 24 horas de anticipación' : 'Less than 24 hours in advance'}
                    </h4>
                    <p className="text-sm">
                      {isSpanish
                        ? 'No se otorga reembolso, a menos que sea por razones de emergencia médica.'
                        : 'No refund will be issued, unless due to medical emergency.'}
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <span className="text-[#C6A649]">03.</span> {isSpanish ? 'Pedidos en Proceso' : '3. Orders in Process'}
                </h2>
                <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <p>
                    {isSpanish
                      ? 'Una vez que un pedido está en proceso de preparación (estado "en proceso"), no se pueden realizar cancelaciones.'
                      : 'Once an order is in preparation (status "in progress"), cancellations cannot be made.'}
                  </p>
                </div>
              </section>

              <section className="space-y-6 pt-10 border-t border-white/10 text-center">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-8">{isSpanish ? 'Información de Contacto' : 'Contact Information'}</h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <p className="text-[#C6A649] text-xs font-black uppercase mb-1 tracking-widest">Email</p>
                    <p className="text-white font-bold">admin@elisbakery.com</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <p className="text-[#C6A649] text-xs font-black uppercase mb-1 tracking-widest">{isSpanish ? 'Teléfono' : 'Phone'}</p>
                    <p className="text-white font-bold">(610) 279-6200</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
