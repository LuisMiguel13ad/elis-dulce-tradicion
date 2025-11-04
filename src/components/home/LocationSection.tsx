import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Clock, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LocationSection = () => {
  const { t } = useLanguage();

  const handleWhatsApp = () => {
    window.open('https://wa.me/16109109067', '_blank');
  };

  const handleCall = () => {
    window.location.href = 'tel:+16109109067';
  };

  return (
    <section className="relative bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-4xl font-bold text-gradient-gold md:text-5xl">
              {t('Visítanos', 'Visit Us')}
            </h2>
            <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent" />
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-2 font-display text-xl font-bold text-foreground">
                    {t('Dirección', 'Address')}
                  </h3>
                  <p className="font-sans text-muted-foreground">
                    846 Street Rd.<br />
                    Bensalem, PA 19020
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-2 font-display text-xl font-bold text-foreground">
                    {t('Horario', 'Hours')}
                  </h3>
                  <p className="font-sans text-muted-foreground">
                    {t('Lunes – Domingo', 'Monday – Sunday')}<br />
                    9:00 AM – 8:00 PM
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-2 font-display text-xl font-bold text-foreground">
                    {t('Teléfono', 'Phone')}
                  </h3>
                  <p className="font-sans text-muted-foreground">
                    610-910-9067
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleCall}
                  size="lg"
                  className="flex-1 rounded-full bg-primary font-sans font-bold text-secondary shadow-glow transition-smooth hover:scale-105"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  {t('Llamar', 'Call')}
                </Button>
                <Button
                  onClick={handleWhatsApp}
                  size="lg"
                  variant="outline"
                  className="flex-1 rounded-full border-2 border-primary font-sans font-bold text-primary transition-smooth hover:bg-primary hover:text-secondary"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border shadow-elegant">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3052.8447282966977!2d-74.95261892346976!3d40.10627277147694!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c6b3a35a3e4f8d%3A0x7d4f8e8c8f8e8f8e!2s846%20Street%20Rd%2C%20Bensalem%2C%20PA%2019020!5e0!3m2!1sen!2sus!4v1234567890123"
                width="100%"
                height="500"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t('Ubicación de Eli\'s Bakery Cafe', 'Eli\'s Bakery Cafe Location')}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
