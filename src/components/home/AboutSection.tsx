import { useLanguage } from '@/contexts/LanguageContext';
import { Features } from '@/components/blocks/features-8';

const AboutSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-4xl font-bold text-gradient-gold md:text-5xl">
              {t('Sobre Nosotros', 'About Us')}
            </h2>
            <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent" />
          </div>

          <div className="mb-16 space-y-6 text-center">
            <p className="mx-auto max-w-3xl font-sans text-lg leading-relaxed text-foreground md:text-xl">
              {t(
                "En Eli's Bakery Cafe somos una pastelería y panadería familiar con raíces mexicanas. Nuestro compromiso es ofrecer productos frescos todos los días, desde nuestro famoso pastel de 3 leches, hasta pan dulce tradicional, postres especiales y pasteles personalizados para cualquier ocasión.",
                "At Eli's Bakery Cafe, we are a family-owned bakery rooted in Mexican tradition. We take pride in offering freshly baked products daily — from our signature Tres Leches cake, to traditional sweet breads, specialty desserts, and fully customized cakes for any occasion."
              )}
            </p>
            <p className="mx-auto max-w-3xl font-sans text-lg leading-relaxed text-muted-foreground">
              {t(
                'Cada pastel cuenta una historia: cumpleaños, bodas, quinceañeras, bautizos y celebraciones especiales. Lo hacemos con dedicación, detalles elegantes y el sabor auténtico que nos ha distinguido por años.',
                'Every cake tells a story: birthdays, weddings, quinceañeras, baby showers, and more. We create each one with care, elegance, and the authentic flavor our customers love.'
              )}
            </p>
            <p className="font-display text-2xl font-semibold italic text-primary">
              {t(
                "Porque en Eli's, cada celebración merece ser inolvidable.",
                "Because at Eli's, every celebration deserves to be unforgettable."
              )}
            </p>
          </div>

          <Features />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
