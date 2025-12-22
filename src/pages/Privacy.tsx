import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const Privacy = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-display text-4xl font-bold mb-8 text-primary">
            {t('Política de Privacidad', 'Privacy Policy')}
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none font-sans">
            <p className="text-muted-foreground mb-6">
              {t(
                'Última actualización: 19 de Noviembre, 2025',
                'Last updated: November 19, 2025'
              )}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{t('1. Introducción', '1. Introduction')}</h2>
              <p>
                {t(
                  'Bienvenido a Eli\'s Dulce Tradición. Respetamos su privacidad y nos comprometemos a proteger su información personal. Esta política de privacidad explica cómo recopilamos, usamos y protegemos sus datos cuando visita nuestro sitio web y realiza pedidos.',
                  'Welcome to Eli\'s Dulce Tradición. We respect your privacy and are committed to protecting your personal information. This privacy policy explains how we collect, use, and protect your data when you visit our website and place orders.'
                )}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{t('2. Información que Recopilamos', '2. Information We Collect')}</h2>
              <p className="mb-4">
                {t(
                  'Podemos recopilar los siguientes tipos de información:',
                  'We may collect the following types of information:'
                )}
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>{t('Información Personal:', 'Personal Information:')}</strong> {t('Nombre, dirección de correo electrónico, número de teléfono y dirección de entrega.', 'Name, email address, phone number, and delivery address.')}
                </li>
                <li>
                  <strong>{t('Información de Pedidos:', 'Order Information:')}</strong> {t('Detalles de los productos que compra, preferencias y notas especiales.', 'Details of the products you purchase, preferences, and special notes.')}
                </li>
                <li>
                  <strong>{t('Información de Pago:', 'Payment Information:')}</strong> {t('Los pagos se procesan de forma segura a través de Square. No almacenamos los datos completos de su tarjeta de crédito en nuestros servidores.', 'Payments are processed securely through Square. We do not store your full credit card details on our servers.')}
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{t('3. Cómo Usamos su Información', '3. How We Use Your Information')}</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('Para procesar y entregar sus pedidos.', 'To process and deliver your orders.')}</li>
                <li>{t('Para comunicarnos con usted sobre el estado de su pedido.', 'To communicate with you about the status of your order.')}</li>
                <li>{t('Para mejorar nuestros productos y servicios.', 'To improve our products and services.')}</li>
                <li>{t('Para cumplir con obligaciones legales.', 'To comply with legal obligations.')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{t('4. Compartir Información', '4. Sharing Information')}</h2>
              <p>
                {t(
                  'No vendemos ni alquilamos su información personal a terceros. Compartimos información solo con proveedores de servicios necesarios para operar nuestro negocio (como procesadores de pagos y servicios de entrega).',
                  'We do not sell or rent your personal information to third parties. We share information only with service providers necessary to operate our business (such as payment processors and delivery services).'
                )}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{t('5. Contacto', '5. Contact')}</h2>
              <p>
                {t(
                  'Si tiene preguntas sobre esta política, contáctenos en:',
                  'If you have questions about this policy, contact us at:'
                )}
              </p>
              <p className="mt-2">
                <strong>Eli's Dulce Tradición</strong><br />
                324 W Marshall St, Norristown, PA 19401<br />
                (610) 279-6200
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;



