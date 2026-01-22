import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const Terms = () => {
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
              {t('Términos y', 'Terms of')} <span className="text-[#C6A649] drop-shadow-[0_0_15px_rgba(198,166,73,0.3)]">{t('Condiciones', 'Service')}</span>
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
                  <span className="text-[#C6A649]">01.</span> {t('Aceptación de Términos', 'Acceptance of Terms')}
                </h2>
                <p>
                  {t(
                    'Al acceder y utilizar el sitio web de Eli\'s Dulce Tradición y realizar pedidos, usted acepta cumplir con estos términos y condiciones.',
                    'By accessing and using the Eli\'s Dulce Tradición website and placing orders, you agree to be bound by these terms and conditions.'
                  )}
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <span className="text-[#C6A649]">02.</span> {t('Pedidos y Cancelaciones', 'Orders and Cancellations')}
                </h2>
                <ul className="space-y-4 pl-6">
                  <li className="flex gap-4">
                    <span className="h-2 w-2 rounded-full bg-[#C6A649] mt-3 shrink-0" />
                    <span><strong>{t('Anticipación:', 'Lead Time:')}</strong> {t('Requerimos al menos 24 horas de anticipación para la mayoría de los pedidos.', 'We require at least 24 hours notice for most orders.')}</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="h-2 w-2 rounded-full bg-[#C6A649] mt-3 shrink-0" />
                    <span><strong>{t('Cancelaciones:', 'Cancellations:')}</strong> {t('Las cancelaciones deben realizarse con al menos 24 horas de anticipación para recibir un reembolso completo.', 'Cancellations must be made at least 24 hours in advance to receive a full refund.')}</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="h-2 w-2 rounded-full bg-[#C6A649] mt-3 shrink-0" />
                    <span><strong>{t('Personalización:', 'Customization:')}</strong> {t('Haremos todo lo posible para cumplir con las solicitudes de diseño, pero el resultado final puede variar ligeramente.', 'We will do our best to accommodate design requests, but the final result may vary slightly.')}</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <span className="text-[#C6A649]">03.</span> {t('Recogida y Entrega', 'Pickup and Delivery')}
                </h2>
                <ul className="space-y-4 pl-6">
                  <li className="flex gap-4">
                    <span className="h-2 w-2 rounded-full bg-[#C6A649] mt-3 shrink-0" />
                    <span><strong>{t('Recogida:', 'Pickup:')}</strong> {t('Es responsabilidad del cliente recoger el pedido en el horario seleccionado. Los pedidos no recogidos no son reembolsables.', 'It is the customer\'s responsibility to pick up the order at the selected time. Unclaimed orders are non-refundable.')}</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="h-2 w-2 rounded-full bg-[#C6A649] mt-3 shrink-0" />
                    <span><strong>{t('Entrega:', 'Delivery:')}</strong> {t('Ofrecemos entrega en un radio limitado. Asegúrese de proporcionar una dirección correcta y un número de teléfono válido.', 'We offer delivery within a limited radius. Please ensure you provide a correct address and a valid phone number.')}</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <span className="text-[#C6A649]">04.</span> {t('Alérgenos', 'Allergens')}
                </h2>
                <p>
                  {t(
                    'Nuestros productos pueden contener o entrar en contacto con leche, trigo, nueces, soja y otros alérgenos. Si tiene una alergia grave, por favor contáctenos antes de realizar el pedido.',
                    'Our products may contain or come into contact with milk, wheat, nuts, soy, and other allergens. If you have a severe allergy, please contact us before ordering.'
                  )}
                </p>
              </section>

              <section className="space-y-6 pt-10 border-t border-white/10">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <span className="text-[#C6A649]">05.</span> {t('Pagos', 'Payments')}
                </h2>
                <p>
                  {t(
                    'Todos los precios están en dólares estadounidenses (USD). Nos reservamos el derecho de cambiar los precios en cualquier momento sin previo aviso. El pago completo se requiere al momento de realizar el pedido.',
                    'All prices are in US Dollars (USD). We reserve the right to change prices at any time without prior notice. Full payment is required at the time of ordering.'
                  )}
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

export default Terms;



