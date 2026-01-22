/**
 * Privacy Policy Page
 * GDPR and CCPA compliant privacy policy
 */

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
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
              {t('Cumplimiento', 'Compliance')}
            </span>
            <h1 className="mb-8 font-display text-5xl md:text-7xl font-black tracking-tight">
              {isSpanish ? 'Política de' : 'Privacy'} <span className="text-[#C6A649] drop-shadow-[0_0_15px_rgba(198,166,73,0.3)]">{isSpanish ? 'Privacidad' : 'Policy'}</span>
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
                  <span className="text-[#C6A649]">01.</span> {isSpanish ? 'Introducción' : '1. Introduction'}
                </h2>
                <div className="space-y-4">
                  <p>
                    {isSpanish
                      ? 'Eli\'s Bakery Cafe ("nosotros", "nuestro", "la empresa") se compromete a proteger su privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información personal cuando utiliza nuestro sitio web y servicios.'
                      : 'Eli\'s Bakery Cafe ("we", "our", "the company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our website and services.'}
                  </p>
                  <p className="bg-[#C6A649]/10 border-l-4 border-[#C6A649] p-4 text-white font-medium">
                    {isSpanish
                      ? 'Al utilizar nuestros servicios, usted acepta las prácticas descritas en esta política.'
                      : 'By using our services, you agree to the practices described in this policy.'}
                  </p>
                </div>
              </section>

              <section className="space-y-8">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <span className="text-[#C6A649]">02.</span> {isSpanish ? 'Información que Recopilamos' : '2. Information We Collect'}
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-[#C6A649] rounded-full" />
                      {isSpanish ? '2.1 Información que Usted Nos Proporciona' : '2.1 Information You Provide to Us'}
                    </h3>
                    <ul className="space-y-4 pl-6">
                      <li className="flex gap-4">
                        <span className="h-2 w-2 rounded-full bg-[#C6A649] mt-3 shrink-0" />
                        <span><strong>{isSpanish ? 'Información de Cuenta:' : 'Account Information:'}</strong> {isSpanish ? 'Nombre, dirección de correo electrónico, número de teléfono, dirección postal cuando crea una cuenta.' : 'Name, email address, phone number, postal address when you create an account.'}</span>
                      </li>
                      <li className="flex gap-4">
                        <span className="h-2 w-2 rounded-full bg-[#C6A649] mt-3 shrink-0" />
                        <span><strong>{isSpanish ? 'Información de Pedidos:' : 'Order Information:'}</strong> {isSpanish ? 'Detalles de sus pedidos, incluyendo preferencias de pastel, direcciones de entrega, y fechas.' : 'Details of your orders, including cake preferences, delivery addresses, and dates.'}</span>
                      </li>
                      <li className="flex gap-4">
                        <span className="h-2 w-2 rounded-full bg-[#C6A649] mt-3 shrink-0" />
                        <span><strong>{isSpanish ? 'Información de Pago:' : 'Payment Information:'}</strong> {isSpanish ? 'Información de tarjeta de crédito procesada de forma segura a través de Square. No almacenamos números de tarjeta completos.' : 'Credit card information processed securely through Square. We do not store complete card numbers.'}</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-[#C6A649] rounded-full" />
                      {isSpanish ? '2.2 Información Recopilada Automáticamente' : '2.2 Automatically Collected Information'}
                    </h3>
                    <ul className="space-y-4 pl-6">
                      <li className="flex gap-4">
                        <span className="h-2 w-2 rounded-full bg-[#C6A649] mt-3 shrink-0" />
                        <span><strong>{isSpanish ? 'Datos de Uso:' : 'Usage Data:'}</strong> {isSpanish ? 'Información sobre cómo utiliza nuestro sitio web, incluyendo páginas visitadas, tiempo en el sitio, y acciones realizadas.' : 'Information about how you use our website, including pages visited, time on site, and actions taken.'}</span>
                      </li>
                      <li className="flex gap-4">
                        <span className="h-2 w-2 rounded-full bg-[#C6A649] mt-3 shrink-0" />
                        <span><strong>{isSpanish ? 'Datos del Dispositivo:' : 'Device Data:'}</strong> {isSpanish ? 'Tipo de dispositivo, sistema operativo, navegador, dirección IP, y identificadores de dispositivo.' : 'Device type, operating system, browser, IP address, and device identifiers.'}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <span className="text-[#C6A649]">03.</span> {isSpanish ? 'Uso de la Información' : '3. How We Use Information'}
                </h2>
                <ul className="grid gap-4 md:grid-cols-2">
                  {[
                    isSpanish ? 'Procesar y completar pedidos' : 'Process and fulfill orders',
                    isSpanish ? 'Soporte al cliente' : 'Customer support',
                    isSpanish ? 'Mejorar servicios' : 'Improve services',
                    isSpanish ? 'Marketing (con consentimiento)' : 'Marketing (with consent)',
                    isSpanish ? 'Prevención de fraudes' : 'Fraud prevention',
                    isSpanish ? 'Cumplimiento legal' : 'Legal compliance'
                  ].map((item, idx) => (
                    <li key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-[#C6A649]" />
                      <span className="text-sm font-bold uppercase tracking-wider">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <span className="text-[#C6A649]">04.</span> {isSpanish ? 'Compartir Información' : '4. Information Sharing'}
                </h2>
                <div className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-6">
                  <p className="font-bold text-white italic underline decoration-[#C6A649]/50 underline-offset-4">
                    {isSpanish ? 'No vendemos su información personal.' : 'We do not sell your personal information.'}
                  </p>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-[#C6A649] font-black text-xs uppercase tracking-widest">Square</p>
                      <p className="text-sm">{isSpanish ? 'Procesamiento de pagos' : 'Payment processing'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[#C6A649] font-black text-xs uppercase tracking-widest">Supabase</p>
                      <p className="text-sm">{isSpanish ? 'Almacenamiento y autenticación' : 'Data storage & auth'}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <span className="text-[#C6A649]">05.</span> {isSpanish ? 'Seguridad de Datos' : '5. Data Security'}
                </h2>
                <p>
                  {isSpanish
                    ? 'Implementamos medidas de seguridad técnicas y físicas. Utilizamos cifrado SSL/TLS para la transmisión de datos y acceso restringido de nivel empresarial.'
                    : 'We implement technical and physical security measures. We use SSL/TLS encryption for data transmission and enterprise-level restricted access.'}
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <span className="text-[#C6A649]">06.</span> {isSpanish ? 'Sus Derechos' : '6. Your Rights'}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    isSpanish ? 'Derecho de Acceso' : 'Right to Access',
                    isSpanish ? 'Rectificación' : 'Rectification',
                    isSpanish ? 'Eliminación' : 'Deletion',
                    isSpanish ? 'Oposición' : 'Object'
                  ].map((right, i) => (
                    <div key={i} className="p-4 border border-white/5 rounded-xl bg-white/5 flex items-center justify-between">
                      <span className="font-bold text-white">{right}</span>
                      <div className="h-1.5 w-1.5 rounded-full bg-[#C6A649] shadow-[0_0_8px_#C6A649]" />
                    </div>
                  ))}
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 flex gap-4 mt-8">
                  <div className="text-blue-500 shrink-0 mt-1">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-white mb-1">{isSpanish ? 'Cómo Ejercer sus Derechos:' : 'How to Exercise Your Rights:'}</p>
                    <p>{isSpanish ? 'Contáctenos en elisbakerycafe@gmail.com. Responderemos dentro de 30 días.' : 'Contact us at elisbakerycafe@gmail.com. We will respond within 30 days.'}</p>
                  </div>
                </div>
              </section>

              <section className="space-y-6 pt-10 border-t border-white/10">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">{isSpanish ? 'Información de Contacto' : 'Contact Information'}</h2>
                <div className="bg-[#C6A649]/5 p-8 rounded-2xl border border-[#C6A649]/10 space-y-4">
                  <p className="font-bold text-white text-xl">Eli's Bakery Cafe</p>
                  <div className="grid gap-4 sm:grid-cols-2 text-sm">
                    <p>824 W Main St, Norristown, PA 19401</p>
                    <p className="text-[#C6A649] font-bold">(610) 639-5299</p>
                    <p className="text-[#C6A649]">elisbakerycafe@gmail.com</p>
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

export default PrivacyPolicy;
