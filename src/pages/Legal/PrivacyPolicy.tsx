/**
 * Privacy Policy Page
 * GDPR and CCPA compliant privacy policy
 */

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const PrivacyPolicy = () => {
  const { t, language } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const isSpanish = language === 'es';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-display">
                {isSpanish ? 'Política de Privacidad' : 'Privacy Policy'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isSpanish
                  ? 'Última actualización: 9 de diciembre de 2024'
                  : 'Last Updated: December 9, 2024'}
              </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-300px)] pr-4">
                <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                  {/* Introduction */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '1. Introducción' : '1. Introduction'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Eli\'s Bakery Cafe ("nosotros", "nuestro", "la empresa") se compromete a proteger su privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información personal cuando utiliza nuestro sitio web y servicios.'
                        : 'Eli\'s Bakery Cafe ("we", "our", "the company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our website and services.'}
                    </p>
                    <p className="mt-2">
                      <strong>
                        {isSpanish
                          ? 'Al utilizar nuestros servicios, usted acepta las prácticas descritas en esta política.'
                          : 'By using our services, you agree to the practices described in this policy.'}
                      </strong>
                    </p>
                  </section>

                  {/* Information We Collect */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '2. Información que Recopilamos' : '2. Information We Collect'}
                    </h2>
                    
                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '2.1 Información que Usted Nos Proporciona' : '2.1 Information You Provide to Us'}
                    </h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <strong>{isSpanish ? 'Información de Cuenta:' : 'Account Information:'}</strong>{' '}
                        {isSpanish
                          ? 'Nombre, dirección de correo electrónico, número de teléfono, dirección postal cuando crea una cuenta.'
                          : 'Name, email address, phone number, postal address when you create an account.'}
                      </li>
                      <li>
                        <strong>{isSpanish ? 'Información de Pedidos:' : 'Order Information:'}</strong>{' '}
                        {isSpanish
                          ? 'Detalles de sus pedidos, incluyendo preferencias de pastel, direcciones de entrega, y fechas.'
                          : 'Details of your orders, including cake preferences, delivery addresses, and dates.'}
                      </li>
                      <li>
                        <strong>{isSpanish ? 'Información de Pago:' : 'Payment Information:'}</strong>{' '}
                        {isSpanish
                          ? 'Información de tarjeta de crédito procesada de forma segura a través de Square. No almacenamos números de tarjeta completos.'
                          : 'Credit card information processed securely through Square. We do not store complete card numbers.'}
                      </li>
                      <li>
                        <strong>{isSpanish ? 'Imágenes:' : 'Images:'}</strong>{' '}
                        {isSpanish
                          ? 'Imágenes de referencia que carga para sus pedidos de pasteles personalizados.'
                          : 'Reference images you upload for your custom cake orders.'}
                      </li>
                      <li>
                        <strong>{isSpanish ? 'Comunicaciones:' : 'Communications:'}</strong>{' '}
                        {isSpanish
                          ? 'Cualquier comunicación que tenga con nosotros, incluyendo consultas de servicio al cliente.'
                          : 'Any communications you have with us, including customer service inquiries.'}
                      </li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '2.2 Información Recopilada Automáticamente' : '2.2 Automatically Collected Information'}
                    </h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <strong>{isSpanish ? 'Datos de Uso:' : 'Usage Data:'}</strong>{' '}
                        {isSpanish
                          ? 'Información sobre cómo utiliza nuestro sitio web, incluyendo páginas visitadas, tiempo en el sitio, y acciones realizadas.'
                          : 'Information about how you use our website, including pages visited, time on site, and actions taken.'}
                      </li>
                      <li>
                        <strong>{isSpanish ? 'Datos del Dispositivo:' : 'Device Data:'}</strong>{' '}
                        {isSpanish
                          ? 'Tipo de dispositivo, sistema operativo, navegador, dirección IP, y identificadores de dispositivo.'
                          : 'Device type, operating system, browser, IP address, and device identifiers.'}
                      </li>
                      <li>
                        <strong>{isSpanish ? 'Cookies y Tecnologías Similares:' : 'Cookies and Similar Technologies:'}</strong>{' '}
                        {isSpanish
                          ? 'Utilizamos cookies y tecnologías similares para mejorar su experiencia. Consulte nuestra Política de Cookies para más detalles.'
                          : 'We use cookies and similar technologies to enhance your experience. See our Cookie Policy for more details.'}
                      </li>
                    </ul>
                  </section>

                  {/* How We Use Information */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '3. Cómo Utilizamos su Información' : '3. How We Use Your Information'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Utilizamos la información recopilada para los siguientes propósitos:'
                        : 'We use the collected information for the following purposes:'}
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>
                        {isSpanish
                          ? 'Procesar y completar sus pedidos'
                          : 'Process and fulfill your orders'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Comunicarnos con usted sobre sus pedidos, incluyendo confirmaciones, actualizaciones de estado, y notificaciones de entrega'
                          : 'Communicate with you about your orders, including confirmations, status updates, and delivery notifications'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Proporcionar servicio al cliente y soporte'
                          : 'Provide customer service and support'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Mejorar nuestros productos y servicios'
                          : 'Improve our products and services'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Enviar comunicaciones de marketing (solo con su consentimiento)'
                          : 'Send marketing communications (only with your consent)'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Detectar y prevenir fraudes y abusos'
                          : 'Detect and prevent fraud and abuse'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Cumplir con obligaciones legales'
                          : 'Comply with legal obligations'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Analizar el uso del sitio web para mejorar la experiencia del usuario'
                          : 'Analyze website usage to improve user experience'}
                      </li>
                    </ul>
                  </section>

                  {/* Information Sharing */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '4. Compartir Información' : '4. Information Sharing'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'No vendemos su información personal. Compartimos su información solo en las siguientes circunstancias:'
                        : 'We do not sell your personal information. We share your information only in the following circumstances:'}
                    </p>

                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '4.1 Proveedores de Servicios' : '4.1 Service Providers'}
                    </h3>
                    <p>
                      {isSpanish
                        ? 'Compartimos información con terceros que nos ayudan a operar nuestro negocio, incluyendo:'
                        : 'We share information with third parties who help us operate our business, including:'}
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>
                        <strong>Square:</strong>{' '}
                        {isSpanish
                          ? 'Procesamiento de pagos'
                          : 'Payment processing'}
                      </li>
                      <li>
                        <strong>Supabase:</strong>{' '}
                        {isSpanish
                          ? 'Almacenamiento de datos y autenticación'
                          : 'Data storage and authentication'}
                      </li>
                      <li>
                        <strong>Resend/SendGrid:</strong>{' '}
                        {isSpanish
                          ? 'Envío de correos electrónicos'
                          : 'Email delivery'}
                      </li>
                      <li>
                        <strong>Google Maps:</strong>{' '}
                        {isSpanish
                          ? 'Verificación de direcciones'
                          : 'Address verification'}
                      </li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '4.2 Requisitos Legales' : '4.2 Legal Requirements'}
                    </h3>
                    <p>
                      {isSpanish
                        ? 'Podemos divulgar su información si es requerido por ley, orden judicial, o proceso legal, o para proteger nuestros derechos, propiedad o seguridad.'
                        : 'We may disclose your information if required by law, court order, or legal process, or to protect our rights, property, or safety.'}
                    </p>

                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '4.3 Transferencias de Negocio' : '4.3 Business Transfers'}
                    </h3>
                    <p>
                      {isSpanish
                        ? 'En caso de fusión, adquisición, o venta de activos, su información puede ser transferida como parte de esa transacción.'
                        : 'In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.'}
                    </p>
                  </section>

                  {/* Data Security */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '5. Seguridad de Datos' : '5. Data Security'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción. Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro.'
                        : 'We implement technical, administrative, and physical security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.'}
                    </p>
                    <p className="mt-2">
                      {isSpanish
                        ? 'Medidas de seguridad incluyen:'
                        : 'Security measures include:'}
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>
                        {isSpanish
                          ? 'Cifrado SSL/TLS para transmisión de datos'
                          : 'SSL/TLS encryption for data transmission'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Autenticación segura mediante Supabase'
                          : 'Secure authentication through Supabase'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Almacenamiento seguro en bases de datos protegidas'
                          : 'Secure storage in protected databases'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Acceso restringido a información personal'
                          : 'Restricted access to personal information'}
                      </li>
                    </ul>
                  </section>

                  {/* Your Rights (GDPR/CCPA) */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '6. Sus Derechos' : '6. Your Rights'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Dependiendo de su ubicación, puede tener los siguientes derechos:'
                        : 'Depending on your location, you may have the following rights:'}
                    </p>

                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '6.1 Derecho de Acceso' : '6.1 Right to Access'}
                    </h3>
                    <p>
                      {isSpanish
                        ? 'Tiene derecho a solicitar una copia de la información personal que tenemos sobre usted.'
                        : 'You have the right to request a copy of the personal information we have about you.'}
                    </p>

                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '6.2 Derecho de Rectificación' : '6.2 Right to Rectification'}
                    </h3>
                    <p>
                      {isSpanish
                        ? 'Tiene derecho a corregir información inexacta o incompleta.'
                        : 'You have the right to correct inaccurate or incomplete information.'}
                    </p>

                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '6.3 Derecho de Eliminación' : '6.3 Right to Deletion'}
                    </h3>
                    <p>
                      {isSpanish
                        ? 'Tiene derecho a solicitar la eliminación de su información personal, sujeto a ciertas excepciones legales.'
                        : 'You have the right to request deletion of your personal information, subject to certain legal exceptions.'}
                    </p>

                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '6.4 Derecho de Oposición' : '6.4 Right to Object'}
                    </h3>
                    <p>
                      {isSpanish
                        ? 'Tiene derecho a oponerse al procesamiento de su información personal para ciertos propósitos, como marketing directo.'
                        : 'You have the right to object to the processing of your personal information for certain purposes, such as direct marketing.'}
                    </p>

                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '6.5 Derecho de Portabilidad' : '6.5 Right to Data Portability'}
                    </h3>
                    <p>
                      {isSpanish
                        ? 'Tiene derecho a recibir su información personal en un formato estructurado y comúnmente utilizado.'
                        : 'You have the right to receive your personal information in a structured and commonly used format.'}
                    </p>

                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '6.6 Derecho de Retirar Consentimiento' : '6.6 Right to Withdraw Consent'}
                    </h3>
                    <p>
                      {isSpanish
                        ? 'Si el procesamiento se basa en su consentimiento, tiene derecho a retirar su consentimiento en cualquier momento.'
                        : 'If processing is based on your consent, you have the right to withdraw your consent at any time.'}
                    </p>

                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                      <p className="font-semibold mb-2">
                        {isSpanish ? 'Cómo Ejercer sus Derechos:' : 'How to Exercise Your Rights:'}
                      </p>
                      <p>
                        {isSpanish
                          ? 'Para ejercer cualquiera de estos derechos, contáctenos en [email] con su solicitud. Responderemos dentro de 30 días.'
                          : 'To exercise any of these rights, contact us at [email] with your request. We will respond within 30 days.'}
                      </p>
                    </div>
                  </section>

                  {/* Data Retention */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '7. Retención de Datos' : '7. Data Retention'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Conservamos su información personal solo durante el tiempo necesario para cumplir con los propósitos descritos en esta política, a menos que la ley requiera o permita un período de retención más largo.'
                        : 'We retain your personal information only for as long as necessary to fulfill the purposes described in this policy, unless the law requires or permits a longer retention period.'}
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>
                        {isSpanish
                          ? 'Información de pedidos: 7 años (requisitos fiscales)'
                          : 'Order information: 7 years (tax requirements)'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Información de cuenta: Mientras su cuenta esté activa'
                          : 'Account information: While your account is active'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Imágenes de referencia: Eliminadas después de completar el pedido, a menos que se otorgue permiso adicional'
                          : 'Reference images: Deleted after order completion, unless additional permission is granted'}
                      </li>
                    </ul>
                  </section>

                  {/* Children's Privacy */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '8. Privacidad de Menores' : '8. Children\'s Privacy'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente información personal de menores. Si descubrimos que hemos recopilado información de un menor, la eliminaremos inmediatamente.'
                        : 'Our services are not directed to children under 18 years of age. We do not knowingly collect personal information from children. If we discover that we have collected information from a child, we will delete it immediately.'}
                    </p>
                  </section>

                  {/* International Transfers */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '9. Transferencias Internacionales' : '9. International Transfers'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Su información puede ser transferida y procesada en países distintos al suyo. Al utilizar nuestros servicios, usted consiente estas transferencias. Implementamos salvaguardas apropiadas para proteger su información.'
                        : 'Your information may be transferred and processed in countries other than your own. By using our services, you consent to these transfers. We implement appropriate safeguards to protect your information.'}
                    </p>
                  </section>

                  {/* Changes to Policy */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '10. Cambios a esta Política' : '10. Changes to This Policy'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos de cualquier cambio publicando la nueva política en esta página y actualizando la fecha de "Última actualización".'
                        : 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.'}
                    </p>
                  </section>

                  {/* Contact Information */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '11. Información de Contacto' : '11. Contact Information'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Si tiene preguntas sobre esta Política de Privacidad o desea ejercer sus derechos, contáctenos:'
                        : 'If you have questions about this Privacy Policy or wish to exercise your rights, contact us:'}
                    </p>
                    <div className="mt-4 space-y-2">
                      <p>
                        <strong>Email:</strong> {/* TODO: Add email */}
                      </p>
                      <p>
                        <strong>{isSpanish ? 'Teléfono:' : 'Phone:'}</strong> {/* TODO: Add phone */}
                      </p>
                      <p>
                        <strong>{isSpanish ? 'Dirección:' : 'Address:'}</strong> {/* TODO: Add address */}
                      </p>
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
