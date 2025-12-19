/**
 * Terms of Service Page
 * Legal terms and conditions for using Eli's Bakery Cafe services
 */

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const TermsOfService = () => {
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
                {isSpanish ? 'Términos de Servicio' : 'Terms of Service'}
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
                  {/* Business Information */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '1. Información de la Empresa' : '1. Business Information'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Eli\'s Bakery Cafe ("nosotros", "nuestro", "la empresa") opera este sitio web y proporciona servicios de pastelería y panadería.'
                        : 'Eli\'s Bakery Cafe ("we", "our", "the company") operates this website and provides bakery and pastry services.'}
                    </p>
                    <div className="mt-4 space-y-2">
                      <p>
                        <strong>{isSpanish ? 'Nombre del Negocio:' : 'Business Name:'}</strong> Eli's Bakery Cafe
                      </p>
                      <p>
                        <strong>{isSpanish ? 'Dirección:' : 'Address:'}</strong>{' '}
                        {/* TODO: Add actual business address */}
                        [Business Address Here]
                      </p>
                      <p>
                        <strong>{isSpanish ? 'Teléfono:' : 'Phone:'}</strong>{' '}
                        {/* TODO: Add actual phone number */}
                        [Phone Number Here]
                      </p>
                      <p>
                        <strong>{isSpanish ? 'Email:' : 'Email:'}</strong>{' '}
                        {/* TODO: Add actual email */}
                        [Email Address Here]
                      </p>
                    </div>
                  </section>

                  {/* Acceptance of Terms */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '2. Aceptación de los Términos' : '2. Acceptance of Terms'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos Términos de Servicio y a todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestros servicios.'
                        : 'By accessing and using this website, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you must not use our services.'}
                    </p>
                  </section>

                  {/* Order Terms */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '3. Términos de Pedidos' : '3. Order Terms'}
                    </h2>
                    
                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '3.1 Depósitos y Pagos' : '3.1 Deposits and Payments'}
                    </h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        {isSpanish
                          ? 'Todos los pedidos requieren pago completo al momento de la orden.'
                          : 'All orders require full payment at the time of ordering.'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Aceptamos pagos mediante tarjeta de crédito/débito a través de Square.'
                          : 'We accept payments via credit/debit card through Square.'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Los precios están en dólares estadounidenses (USD) y están sujetos a cambios sin previo aviso.'
                          : 'Prices are in US Dollars (USD) and subject to change without notice.'}
                      </li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '3.2 Cancelaciones' : '3.2 Cancellations'}
                    </h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        {isSpanish
                          ? 'Las cancelaciones realizadas con más de 48 horas de anticipación recibirán un reembolso completo.'
                          : 'Cancellations made more than 48 hours in advance will receive a full refund.'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Las cancelaciones realizadas entre 24-48 horas antes recibirán un reembolso del 50%.'
                          : 'Cancellations made 24-48 hours in advance will receive a 50% refund.'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Las cancelaciones realizadas con menos de 24 horas de anticipación no son elegibles para reembolso, a menos que sea por razones de emergencia médica o circunstancias excepcionales.'
                          : 'Cancellations made less than 24 hours in advance are not eligible for refund, unless due to medical emergency or exceptional circumstances.'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Una vez que el pedido esté en proceso de preparación, no se pueden realizar cancelaciones.'
                          : 'Once an order is in preparation, cancellations cannot be made.'}
                      </li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '3.3 Modificaciones de Pedidos' : '3.3 Order Modifications'}
                    </h3>
                    <p>
                      {isSpanish
                        ? 'Las modificaciones a los pedidos solo se pueden realizar antes de que el pedido esté en proceso. Comuníquese con nosotros lo antes posible si necesita realizar cambios.'
                        : 'Order modifications can only be made before the order is in process. Please contact us as soon as possible if you need to make changes.'}
                    </p>
                  </section>

                  {/* Delivery Terms */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '4. Términos de Entrega' : '4. Delivery Terms'}
                    </h2>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        {isSpanish
                          ? 'Ofrecemos entrega a domicilio y recogida en tienda.'
                          : 'We offer home delivery and in-store pickup.'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Los tiempos de entrega son estimados y pueden variar según las condiciones del tráfico y otros factores fuera de nuestro control.'
                          : 'Delivery times are estimates and may vary due to traffic conditions and other factors beyond our control.'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Debe proporcionar una dirección de entrega precisa y completa. No somos responsables por entregas fallidas debido a direcciones incorrectas.'
                          : 'You must provide an accurate and complete delivery address. We are not responsible for failed deliveries due to incorrect addresses.'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Debe estar presente para recibir la entrega. Si no está disponible, contactaremos para reorganizar la entrega.'
                          : 'You must be present to receive the delivery. If unavailable, we will contact you to reschedule delivery.'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'No somos responsables por daños que ocurran después de que el producto haya sido entregado y recibido.'
                          : 'We are not responsible for damages that occur after the product has been delivered and received.'}
                      </li>
                    </ul>
                  </section>

                  {/* Allergen Disclaimer */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '5. Descargo de Responsabilidad por Alérgenos' : '5. Allergen Disclaimer'}
                    </h2>
                    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <p className="font-semibold mb-2">
                        {isSpanish ? 'ADVERTENCIA IMPORTANTE:' : 'IMPORTANT WARNING:'}
                      </p>
                      <p>
                        {isSpanish
                          ? 'Nuestros productos pueden contener o entrar en contacto con alérgenos comunes, incluyendo pero no limitado a: trigo, huevos, leche, soja, nueces, maní y otros ingredientes que pueden causar reacciones alérgicas. Aunque hacemos nuestro mejor esfuerzo para evitar la contaminación cruzada, no podemos garantizar que nuestros productos estén completamente libres de alérgenos. Por favor, informe a nuestro personal sobre cualquier alergia alimentaria antes de realizar su pedido.'
                          : 'Our products may contain or come into contact with common allergens, including but not limited to: wheat, eggs, milk, soy, tree nuts, peanuts, and other ingredients that may cause allergic reactions. While we make our best effort to avoid cross-contamination, we cannot guarantee that our products are completely allergen-free. Please inform our staff of any food allergies before placing your order.'}
                      </p>
                    </div>
                  </section>

                  {/* Image Usage Rights */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '6. Derechos de Uso de Imágenes' : '6. Image Usage Rights'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Al cargar imágenes de referencia para su pedido, usted otorga a Eli\'s Bakery Cafe el derecho de usar esas imágenes únicamente para los siguientes propósitos:'
                        : 'By uploading reference images for your order, you grant Eli\'s Bakery Cafe the right to use those images solely for the following purposes:'}
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>
                        {isSpanish
                          ? 'Crear y personalizar su pedido de pastel.'
                          : 'Creating and customizing your cake order.'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Comunicación interna con nuestro equipo de producción.'
                          : 'Internal communication with our production team.'}
                      </li>
                    </ul>
                    <p className="mt-4">
                      {isSpanish
                        ? 'No utilizaremos sus imágenes para marketing, publicidad o cualquier otro propósito sin su consentimiento explícito por escrito. Sus imágenes se almacenan de forma segura y se eliminan después de completar su pedido, a menos que nos otorgue permiso adicional.'
                        : 'We will not use your images for marketing, advertising, or any other purpose without your explicit written consent. Your images are stored securely and deleted after your order is completed, unless you grant us additional permission.'}
                    </p>
                  </section>

                  {/* Payment Processing */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '7. Procesamiento de Pagos' : '7. Payment Processing'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Utilizamos Square, Inc. ("Square") para procesar todos los pagos. Al realizar un pago, usted acepta los términos de servicio de Square. No almacenamos información de tarjetas de crédito en nuestros servidores. Toda la información de pago se procesa de forma segura a través de Square.'
                        : 'We use Square, Inc. ("Square") to process all payments. By making a payment, you agree to Square\'s terms of service. We do not store credit card information on our servers. All payment information is processed securely through Square.'}
                    </p>
                    <p className="mt-2">
                      {isSpanish
                        ? 'Para más información sobre cómo Square maneja sus datos, visite: '
                        : 'For more information about how Square handles your data, visit: '}
                      <a
                        href="https://squareup.com/us/en/legal/general/ua"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        https://squareup.com/us/en/legal/general/ua
                      </a>
                    </p>
                  </section>

                  {/* Dispute Resolution */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '8. Resolución de Disputas' : '8. Dispute Resolution'}
                    </h2>
                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '8.1 Contacto Inicial' : '8.1 Initial Contact'}
                    </h3>
                    <p>
                      {isSpanish
                        ? 'Si tiene alguna queja o disputa, por favor contáctenos primero en [email] o [phone] para intentar resolver el problema de manera amigable.'
                        : 'If you have any complaint or dispute, please contact us first at [email] or [phone] to attempt to resolve the issue amicably.'}
                    </p>

                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '8.2 Mediación' : '8.2 Mediation'}
                    </h3>
                    <p>
                      {isSpanish
                        ? 'Si no podemos resolver la disputa mediante comunicación directa, ambas partes acuerdan intentar la mediación a través de un mediador mutuamente acordado antes de proceder con acciones legales.'
                        : 'If we cannot resolve the dispute through direct communication, both parties agree to attempt mediation through a mutually agreed mediator before proceeding with legal action.'}
                    </p>

                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '8.3 Ley Aplicable' : '8.3 Governing Law'}
                    </h3>
                    <p>
                      {isSpanish
                        ? 'Estos términos se rigen por las leyes del estado de [State], Estados Unidos, sin tener en cuenta sus disposiciones sobre conflictos de leyes.'
                        : 'These terms are governed by the laws of the State of [State], United States, without regard to its conflict of law provisions.'}
                    </p>
                  </section>

                  {/* Limitation of Liability */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '9. Limitación de Responsabilidad' : '9. Limitation of Liability'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'En la máxima medida permitida por la ley, Eli\'s Bakery Cafe no será responsable de ningún daño indirecto, incidental, especial, consecuente o punitivo que surja del uso de nuestros servicios.'
                        : 'To the maximum extent permitted by law, Eli\'s Bakery Cafe shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from the use of our services.'}
                    </p>
                  </section>

                  {/* Changes to Terms */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '10. Cambios a los Términos' : '10. Changes to Terms'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en este sitio web. Es su responsabilidad revisar estos términos periódicamente.'
                        : 'We reserve the right to modify these terms at any time. Changes will take effect immediately upon posting on this website. It is your responsibility to review these terms periodically.'}
                    </p>
                  </section>

                  {/* Contact Information */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '11. Información de Contacto' : '11. Contact Information'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Si tiene preguntas sobre estos Términos de Servicio, puede contactarnos:'
                        : 'If you have questions about these Terms of Service, you may contact us:'}
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

export default TermsOfService;
