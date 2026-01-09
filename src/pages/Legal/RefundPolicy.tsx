/**
 * Refund Policy Page
 * Cancellation and refund policy
 */

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const RefundPolicy = () => {
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
                {isSpanish ? 'Política de Reembolsos' : 'Refund Policy'}
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
                        ? 'Esta Política de Reembolsos describe los términos y condiciones bajo los cuales Eli\'s Bakery Cafe procesa cancelaciones y reembolsos. Al realizar un pedido, usted acepta esta política.'
                        : 'This Refund Policy describes the terms and conditions under which Eli\'s Bakery Cafe processes cancellations and refunds. By placing an order, you agree to this policy.'}
                    </p>
                  </section>

                  {/* Cancellation Policy */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '2. Política de Cancelación' : '2. Cancellation Policy'}
                    </h2>

                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '2.1 Cancelación por el Cliente' : '2.1 Customer Cancellation'}
                    </h3>
                    <p>
                      {isSpanish
                        ? 'Los clientes pueden cancelar pedidos en cualquier momento antes de que el pedido esté en proceso de preparación. Las cancelaciones se procesan de la siguiente manera:'
                        : 'Customers may cancel orders at any time before the order is in preparation. Cancellations are processed as follows:'}
                    </p>

                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold mb-2">
                        {isSpanish ? '✅ Más de 48 horas de anticipación' : '✅ More than 48 hours in advance'}
                      </h4>
                      <p>
                        {isSpanish
                          ? 'Reembolso completo del monto pagado. El reembolso se procesará dentro de 5-10 días hábiles.'
                          : 'Full refund of the amount paid. Refund will be processed within 5-10 business days.'}
                      </p>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold mb-2">
                        {isSpanish ? '⚠️ 24-48 horas de anticipación' : '⚠️ 24-48 hours in advance'}
                      </h4>
                      <p>
                        {isSpanish
                          ? 'Reembolso del 50% del monto pagado. El reembolso se procesará dentro de 5-10 días hábiles.'
                          : '50% refund of the amount paid. Refund will be processed within 5-10 business days.'}
                      </p>
                    </div>

                    <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold mb-2">
                        {isSpanish ? '❌ Menos de 24 horas de anticipación' : '❌ Less than 24 hours in advance'}
                      </h4>
                      <p>
                        {isSpanish
                          ? 'No se otorga reembolso, a menos que sea por razones de emergencia médica o circunstancias excepcionales. Comuníquese con nosotros para discutir su situación.'
                          : 'No refund will be issued, unless due to medical emergency or exceptional circumstances. Please contact us to discuss your situation.'}
                      </p>
                    </div>

                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '2.2 Cancelación por la Empresa' : '2.2 Company Cancellation'}
                    </h3>
                    <p>
                      {isSpanish
                        ? 'Si cancelamos su pedido por razones fuera de nuestro control (por ejemplo, ingredientes no disponibles, problemas de capacidad), recibirá un reembolso completo.'
                        : 'If we cancel your order for reasons beyond our control (e.g., unavailable ingredients, capacity issues), you will receive a full refund.'}
                    </p>

                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '2.3 Pedidos en Proceso' : '2.3 Orders in Process'}
                    </h3>
                    <p>
                      {isSpanish
                        ? 'Una vez que un pedido está en proceso de preparación (estado "in_progress"), no se pueden realizar cancelaciones. Esto se debe a que los ingredientes ya han sido preparados y asignados a su pedido.'
                        : 'Once an order is in preparation (status "in_progress"), cancellations cannot be made. This is because ingredients have already been prepared and allocated to your order.'}
                    </p>
                  </section>

                  {/* Refund Process */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '3. Proceso de Reembolso' : '3. Refund Process'}
                    </h2>

                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '3.1 Cómo Solicitar un Reembolso' : '3.1 How to Request a Refund'}
                    </h3>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>
                        {isSpanish
                          ? 'Inicie sesión en su cuenta y vaya a "Historial de Pedidos"'
                          : 'Log into your account and go to "Order History"'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Seleccione el pedido que desea cancelar'
                          : 'Select the order you wish to cancel'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Haga clic en "Cancelar Pedido" si está disponible'
                          : 'Click "Cancel Order" if available'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'O contáctenos directamente en [email] o [phone]'
                          : 'Or contact us directly at [email] or [phone]'}
                      </li>
                    </ol>

                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '3.2 Procesamiento de Reembolsos' : '3.2 Refund Processing'}
                    </h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        {isSpanish
                          ? 'Los reembolsos se procesan a través de Square, el mismo método de pago utilizado para la compra original.'
                          : 'Refunds are processed through Square, the same payment method used for the original purchase.'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'El tiempo de procesamiento es de 5-10 días hábiles desde la aprobación del reembolso.'
                          : 'Processing time is 5-10 business days from refund approval.'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'El reembolso aparecerá en su estado de cuenta como un crédito de "Eli\'s Bakery Cafe".'
                          : 'The refund will appear on your statement as a credit from "Eli\'s Bakery Cafe".'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Recibirá una confirmación por correo electrónico una vez que se procese el reembolso.'
                          : 'You will receive an email confirmation once the refund is processed.'}
                      </li>
                    </ul>
                  </section>

                  {/* Partial Refunds */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '4. Reembolsos Parciales' : '4. Partial Refunds'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'En casos excepcionales, podemos ofrecer reembolsos parciales:'
                        : 'In exceptional cases, we may offer partial refunds:'}
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>
                        {isSpanish
                          ? 'Si el producto entregado no coincide con lo ordenado (error nuestro)'
                          : 'If the delivered product does not match what was ordered (our error)'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Si el producto está dañado durante la entrega (evaluado caso por caso)'
                          : 'If the product is damaged during delivery (evaluated case by case)'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Si hay problemas de calidad con el producto (evaluado caso por caso)'
                          : 'If there are quality issues with the product (evaluated case by case)'}
                      </li>
                    </ul>
                    <p className="mt-4">
                      {isSpanish
                        ? 'Para solicitar un reembolso parcial, debe contactarnos dentro de 24 horas de recibir el pedido y proporcionar fotografías del problema.'
                        : 'To request a partial refund, you must contact us within 24 hours of receiving the order and provide photographs of the issue.'}
                    </p>
                  </section>

                  {/* Non-Refundable Items */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '5. Artículos No Reembolsables' : '5. Non-Refundable Items'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Los siguientes artículos o situaciones no son elegibles para reembolso:'
                        : 'The following items or situations are not eligible for refund:'}
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>
                        {isSpanish
                          ? 'Pedidos cancelados con menos de 24 horas de anticipación (excepto emergencias)'
                          : 'Orders cancelled with less than 24 hours notice (except emergencies)'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Pedidos que ya están en proceso de preparación'
                          : 'Orders that are already in preparation'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Productos personalizados que ya han sido creados'
                          : 'Custom products that have already been created'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Tarifas de entrega (no reembolsables una vez que se inicia la entrega)'
                          : 'Delivery fees (non-refundable once delivery has started)'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Cambios de opinión sobre el diseño o sabor después de la confirmación'
                          : 'Change of mind about design or flavor after confirmation'}
                      </li>
                    </ul>
                  </section>

                  {/* Disputes */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '6. Disputas de Reembolso' : '6. Refund Disputes'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Si no está satisfecho con una decisión de reembolso, puede:'
                        : 'If you are not satisfied with a refund decision, you may:'}
                    </p>
                    <ol className="list-decimal pl-6 space-y-2 mt-2">
                      <li>
                        {isSpanish
                          ? 'Contactarnos directamente para revisar su caso'
                          : 'Contact us directly to review your case'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Presentar una disputa a través de su banco o procesador de pagos'
                          : 'File a dispute through your bank or payment processor'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Contactar a las autoridades de protección al consumidor si es necesario'
                          : 'Contact consumer protection authorities if necessary'}
                      </li>
                    </ol>
                  </section>

                  {/* Contact Information */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '7. Información de Contacto' : '7. Contact Information'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Para preguntas sobre reembolsos o cancelaciones, contáctenos:'
                        : 'For questions about refunds or cancellations, contact us:'}
                    </p>
                    <div className="mt-4 space-y-2">
                      <p>
                        <strong>Email:</strong> admin@elisbakery.com
                      </p>
                      <p>
                        <strong>{isSpanish ? 'Teléfono:' : 'Phone:'}</strong> (610) 279-6200
                      </p>
                      <p>
                        <strong>{isSpanish ? 'Horario de Atención:' : 'Business Hours:'}</strong>{' '}
                        {isSpanish
                          ? 'Lunes a Sábado, 9:00 AM - 6:00 PM'
                          : 'Monday to Saturday, 9:00 AM - 6:00 PM'}
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

export default RefundPolicy;
