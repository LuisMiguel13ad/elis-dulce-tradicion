/**
 * Cookie Policy Page
 * Information about cookie usage and tracking
 */

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const CookiePolicy = () => {
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
                {isSpanish ? 'Política de Cookies' : 'Cookie Policy'}
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
                      {isSpanish ? '1. ¿Qué son las Cookies?' : '1. What Are Cookies?'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web. Las cookies nos ayudan a mejorar su experiencia al recordar sus preferencias y comprender cómo utiliza nuestro sitio.'
                        : 'Cookies are small text files that are stored on your device when you visit a website. Cookies help us improve your experience by remembering your preferences and understanding how you use our site.'}
                    </p>
                  </section>

                  {/* Types of Cookies */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '2. Tipos de Cookies que Utilizamos' : '2. Types of Cookies We Use'}
                    </h2>
                    
                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '2.1 Cookies Esenciales' : '2.1 Essential Cookies'}
                    </h3>
                    <p>
                      {isSpanish
                        ? 'Estas cookies son necesarias para el funcionamiento del sitio web y no se pueden desactivar. Incluyen:'
                        : 'These cookies are necessary for the website to function and cannot be disabled. They include:'}
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>
                        <strong>{isSpanish ? 'Cookies de Autenticación:' : 'Authentication Cookies:'}</strong>{' '}
                        {isSpanish
                          ? 'Mantienen su sesión iniciada'
                          : 'Keep you logged in'}
                      </li>
                      <li>
                        <strong>{isSpanish ? 'Cookies de Seguridad:' : 'Security Cookies:'}</strong>{' '}
                        {isSpanish
                          ? 'Protegen contra actividades fraudulentas'
                          : 'Protect against fraudulent activities'}
                      </li>
                      <li>
                        <strong>{isSpanish ? 'Cookies de Preferencias:' : 'Preference Cookies:'}</strong>{' '}
                        {isSpanish
                          ? 'Recuerdan su idioma y configuración'
                          : 'Remember your language and settings'}
                      </li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '2.2 Cookies Analíticas' : '2.2 Analytics Cookies'}
                    </h3>
                    <p>
                      {isSpanish
                        ? 'Estas cookies nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web. Solo se utilizan con su consentimiento.'
                        : 'These cookies help us understand how visitors interact with our website. They are only used with your consent.'}
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>
                        <strong>Google Analytics:</strong>{' '}
                        {isSpanish
                          ? 'Rastrea visitas, páginas vistas y comportamiento del usuario'
                          : 'Tracks visits, page views, and user behavior'}
                      </li>
                      <li>
                        {isSpanish
                          ? 'Estas cookies se pueden desactivar a través de nuestro banner de consentimiento'
                          : 'These cookies can be disabled through our consent banner'}
                      </li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '2.3 Cookies de Funcionalidad' : '2.3 Functionality Cookies'}
                    </h3>
                    <p>
                      {isSpanish
                        ? 'Estas cookies permiten que el sitio web recuerde las elecciones que hace (como su idioma preferido) para proporcionar características mejoradas y personalizadas.'
                        : 'These cookies allow the website to remember choices you make (such as your preferred language) to provide enhanced and personalized features.'}
                    </p>
                  </section>

                  {/* Third-Party Cookies */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '3. Cookies de Terceros' : '3. Third-Party Cookies'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Algunos servicios de terceros que utilizamos pueden establecer cookies en su dispositivo:'
                        : 'Some third-party services we use may set cookies on your device:'}
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>
                        <strong>Google Analytics:</strong>{' '}
                        {isSpanish
                          ? 'Para análisis de tráfico web'
                          : 'For web traffic analysis'}
                      </li>
                      <li>
                        <strong>Square:</strong>{' '}
                        {isSpanish
                          ? 'Para procesamiento de pagos seguros'
                          : 'For secure payment processing'}
                      </li>
                      <li>
                        <strong>Google Maps:</strong>{' '}
                        {isSpanish
                          ? 'Para verificación de direcciones'
                          : 'For address verification'}
                      </li>
                    </ul>
                    <p className="mt-4">
                      {isSpanish
                        ? 'Estas empresas tienen sus propias políticas de privacidad y uso de cookies. Le recomendamos que las revise.'
                        : 'These companies have their own privacy policies and cookie usage. We recommend you review them.'}
                    </p>
                  </section>

                  {/* Managing Cookies */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '4. Gestión de Cookies' : '4. Managing Cookies'}
                    </h2>
                    
                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '4.1 Consentimiento de Cookies' : '4.1 Cookie Consent'}
                    </h3>
                    <p>
                      {isSpanish
                        ? 'Cuando visita nuestro sitio por primera vez, verá un banner de consentimiento de cookies. Puede aceptar o rechazar cookies no esenciales. Su preferencia se guardará y recordará en futuras visitas.'
                        : 'When you first visit our site, you will see a cookie consent banner. You can accept or reject non-essential cookies. Your preference will be saved and remembered for future visits.'}
                    </p>

                    <h3 className="text-xl font-semibold mt-4 mb-2">
                      {isSpanish ? '4.2 Configuración del Navegador' : '4.2 Browser Settings'}
                    </h3>
                    <p>
                      {isSpanish
                        ? 'También puede gestionar cookies a través de la configuración de su navegador:'
                        : 'You can also manage cookies through your browser settings:'}
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>
                        <strong>Chrome:</strong>{' '}
                        {isSpanish
                          ? 'Configuración > Privacidad y seguridad > Cookies'
                          : 'Settings > Privacy and security > Cookies'}
                      </li>
                      <li>
                        <strong>Firefox:</strong>{' '}
                        {isSpanish
                          ? 'Opciones > Privacidad y seguridad > Cookies'
                          : 'Options > Privacy & Security > Cookies'}
                      </li>
                      <li>
                        <strong>Safari:</strong>{' '}
                        {isSpanish
                          ? 'Preferencias > Privacidad > Cookies'
                          : 'Preferences > Privacy > Cookies'}
                      </li>
                      <li>
                        <strong>Edge:</strong>{' '}
                        {isSpanish
                          ? 'Configuración > Cookies y permisos del sitio'
                          : 'Settings > Cookies and site permissions'}
                      </li>
                    </ul>

                    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                      <p className="font-semibold mb-2">
                        {isSpanish ? '⚠️ Nota Importante:' : '⚠️ Important Note:'}
                      </p>
                      <p>
                        {isSpanish
                          ? 'Desactivar cookies esenciales puede afectar la funcionalidad del sitio web. Algunas características pueden no funcionar correctamente sin cookies.'
                          : 'Disabling essential cookies may affect website functionality. Some features may not work properly without cookies.'}
                      </p>
                    </div>
                  </section>

                  {/* Cookie Retention */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '5. Retención de Cookies' : '5. Cookie Retention'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Las cookies se almacenan en su dispositivo por diferentes períodos:'
                        : 'Cookies are stored on your device for different periods:'}
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>
                        <strong>{isSpanish ? 'Cookies de Sesión:' : 'Session Cookies:'}</strong>{' '}
                        {isSpanish
                          ? 'Se eliminan cuando cierra su navegador'
                          : 'Deleted when you close your browser'}
                      </li>
                      <li>
                        <strong>{isSpanish ? 'Cookies Persistentes:' : 'Persistent Cookies:'}</strong>{' '}
                        {isSpanish
                          ? 'Permanecen hasta su fecha de expiración o hasta que las elimine manualmente'
                          : 'Remain until their expiration date or until you manually delete them'}
                      </li>
                    </ul>
                  </section>

                  {/* Updates to Policy */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '6. Actualizaciones de esta Política' : '6. Updates to This Policy'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Podemos actualizar esta Política de Cookies ocasionalmente. Le recomendamos que revise esta página periódicamente para estar informado sobre cómo utilizamos las cookies.'
                        : 'We may update this Cookie Policy from time to time. We recommend that you review this page periodically to stay informed about how we use cookies.'}
                    </p>
                  </section>

                  {/* Contact Information */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4">
                      {isSpanish ? '7. Información de Contacto' : '7. Contact Information'}
                    </h2>
                    <p>
                      {isSpanish
                        ? 'Si tiene preguntas sobre nuestra Política de Cookies, contáctenos:'
                        : 'If you have questions about our Cookie Policy, contact us:'}
                    </p>
                    <div className="mt-4 space-y-2">
                      <p>
                        <strong>Email:</strong> {/* TODO: Add email */}
                      </p>
                      <p>
                        <strong>{isSpanish ? 'Teléfono:' : 'Phone:'}</strong> {/* TODO: Add phone */}
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

export default CookiePolicy;
