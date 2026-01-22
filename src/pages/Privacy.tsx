import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const Privacy = () => {
  const { t } = useLanguage();

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
              {t('Legal', 'Legal')}
            </span>
            <h1 className="mb-8 font-display text-5xl md:text-7xl font-black tracking-tight">
              {t('Política de', 'Privacy')} <span className="text-[#C6A649] drop-shadow-[0_0_15px_rgba(198,166,73,0.3)]">{t('Privacidad', 'Policy')}</span>
            </h1>
            <div className="mx-auto mb-10 h-1.5 w-32 rounded-full bg-gradient-to-r from-transparent via-[#C6A649] to-transparent shadow-[0_0_10px_rgba(198,166,73,0.5)]" />
            <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">
              {t(
                'Última actualización: 19 de Noviembre, 2025',
                'Last updated: November 19, 2025'
              )}
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-br from-[#C6A649]/10 to-transparent rounded-[2.5rem] blur-xl opacity-30 transition duration-500" />
            <div className="relative rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-10 md:p-14 shadow-2xl space-y-12 font-sans text-gray-300 leading-relaxed text-lg">

              <section className="space-y-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <span className="text-[#C6A649]">01.</span> {t('Introducción', 'Introduction')}
                </h2>
                <p>
                  {t(
                    'Bienvenido a Eli\'s Dulce Tradición. Respetamos su privacidad y nos comprometemos a proteger su información personal. Esta política de privacidad explica cómo recopilamos, usamos y protegemos sus datos cuando visita nuestro sitio web y realiza pedidos.',
                    'Welcome to Eli\'s Dulce Tradición. We respect your privacy and are committed to protecting your personal information. This privacy policy explains how we collect, use, and protect your data when you visit our website and place orders.'
                  )}
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <span className="text-[#C6A649]">02.</span> {t('Información que Recopilamos', 'Information We Collect')}
                </h2>
                <p>
                  {t(
                    'Podemos recopilar los siguientes tipos de información:',
                    'We may collect the following types of information:'
                  )}
                </p>
                <ul className="space-y-4 pl-6">
                  <li className="flex gap-4">
                    <span className="h-2 w-2 rounded-full bg-[#C6A649] mt-3 shrink-0" />
                    <span><strong>{t('Información Personal:', 'Personal Information:')}</strong> {t('Nombre, dirección de correo electrónico, número de teléfono y dirección de entrega.', 'Name, email address, phone number, and delivery address.')}</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="h-2 w-2 rounded-full bg-[#C6A649] mt-3 shrink-0" />
                    <span><strong>{t('Información de Pedidos:', 'Order Information:')}</strong> {t('Detalles de los productos que compra, preferencias y notas especiales.', 'Details of the products you purchase, preferences, and special notes.')}</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="h-2 w-2 rounded-full bg-[#C6A649] mt-3 shrink-0" />
                    <span><strong>{t('Información de Pago:', 'Payment Information:')}</strong> {t('Los pagos se procesan de forma segura a través de Square. No almacenamos los datos completos de su tarjeta de crédito en nuestros servidores.', 'Payments are processed securely through Square. We do not store your full credit card details on our servers.')}</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <span className="text-[#C6A649]">03.</span> {t('Cómo Usamos su Información', 'How We Use Your Information')}
                </h2>
                <ul className="space-y-4 pl-6">
                  <li className="flex gap-4">
                    <span className="h-2 w-2 rounded-full bg-[#C6A649] mt-3 shrink-0" />
                    <span>{t('Para procesar y entregar sus pedidos.', 'To process and deliver your orders.')}</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="h-2 w-2 rounded-full bg-[#C6A649] mt-3 shrink-0" />
                    <span>{t('Para comunicarnos con usted sobre el estado de su pedido.', 'To communicate with you about the status of your order.')}</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="h-2 w-2 rounded-full bg-[#C6A649] mt-3 shrink-0" />
                    <span>{t('Para mejorar nuestros productos y servicios.', 'To improve our products and services.')}</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="h-2 w-2 rounded-full bg-[#C6A649] mt-3 shrink-0" />
                    <span>{t('Para cumplir con obligaciones legales.', 'To comply with legal obligations.')}</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <span className="text-[#C6A649]">04.</span> {t('Compartir Información', 'Sharing Information')}
                </h2>
                <p>
                  {t(
                    'No vendemos ni alquilamos su información personal a terceros. Compartimos información solo con proveedores de servicios necesarios para operar nuestro negocio (como procesadores de pagos y servicios de entrega).',
                    'We do not sell or rent your personal information to third parties. We share information only with service providers necessary to operate our business (such as payment processors and delivery services).'
                  )}
                </p>
              </section>

              <section className="space-y-6 pt-10 border-t border-white/10">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">{t('Contacto', 'Contact')}</h2>
                <p>
                  {t(
                    'Si tiene preguntas sobre esta política, contáctenos en:',
                    'If you have questions about this policy, contact us at:'
                  )}
                </p>
                <div className="bg-white/5 p-8 rounded-2xl border border-white/5 space-y-2">
                  <p className="font-bold text-white text-xl">Eli's Dulce Tradición</p>
                  <p>324 W Marshall St, Norristown, PA 19401</p>
                  <p className="text-[#C6A649] font-bold text-lg">(610) 279-6200</p>
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

export default Privacy;



