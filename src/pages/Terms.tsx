import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const Terms = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-display text-4xl font-bold mb-8 text-primary">
            {t('Términos y Condiciones', 'Terms of Service')}
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none font-sans">
            <p className="text-muted-foreground mb-6">
              {t(
                'Última actualización: 19 de Noviembre, 2025',
                'Last updated: November 19, 2025'
              )}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{t('1. Aceptación de Términos', '1. Acceptance of Terms')}</h2>
              <p>
                {t(
                  'Al acceder y utilizar el sitio web de Eli\'s Dulce Tradición y realizar pedidos, usted acepta cumplir con estos términos y condiciones.',
                  'By accessing and using the Eli\'s Dulce Tradición website and placing orders, you agree to be bound by these terms and conditions.'
                )}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{t('2. Pedidos y Cancelaciones', '2. Orders and Cancellations')}</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>{t('Anticipación:', 'Lead Time:')}</strong> {t('Requerimos al menos 24 horas de anticipación para la mayoría de los pedidos.', 'We require at least 24 hours notice for most orders.')}
                </li>
                <li>
                  <strong>{t('Cancelaciones:', 'Cancellations:')}</strong> {t('Las cancelaciones deben realizarse con al menos 24 horas de anticipación para recibir un reembolso completo.', 'Cancellations must be made at least 24 hours in advance to receive a full refund.')}
                </li>
                <li>
                  <strong>{t('Personalización:', 'Customization:')}</strong> {t('Haremos todo lo posible para cumplir con las solicitudes de diseño, pero el resultado final puede variar ligeramente.', 'We will do our best to accommodate design requests, but the final result may vary slightly.')}
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{t('3. Recogida y Entrega', '3. Pickup and Delivery')}</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>{t('Recogida:', 'Pickup:')}</strong> {t('Es responsabilidad del cliente recoger el pedido en el horario seleccionado. Los pedidos no recogidos no son reembolsables.', 'It is the customer\'s responsibility to pick up the order at the selected time. Unclaimed orders are non-refundable.')}
                </li>
                <li>
                  <strong>{t('Entrega:', 'Delivery:')}</strong> {t('Ofrecemos entrega en un radio limitado. Asegúrese de proporcionar una dirección correcta y un número de teléfono válido.', 'We offer delivery within a limited radius. Please ensure you provide a correct address and a valid phone number.')}
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{t('4. Alérgenos', '4. Allergens')}</h2>
              <p>
                {t(
                  'Nuestros productos pueden contener o entrar en contacto con leche, trigo, nueces, soja y otros alérgenos. Si tiene una alergia grave, por favor contáctenos antes de realizar el pedido.',
                  'Our products may contain or come into contact with milk, wheat, nuts, soy, and other allergens. If you have a severe allergy, please contact us before ordering.'
                )}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{t('5. Pagos', '5. Payments')}</h2>
              <p>
                {t(
                  'Todos los precios están en dólares estadounidenses (USD). Nos reservamos el derecho de cambiar los precios en cualquier momento sin previo aviso. El pago completo se requiere al momento de realizar el pedido.',
                  'All prices are in US Dollars (USD). We reserve the right to change prices at any time without prior notice. Full payment is required at the time of ordering.'
                )}
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;



