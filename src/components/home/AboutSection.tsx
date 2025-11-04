import { useLanguage } from '@/contexts/LanguageContext';
import { Heart, Award, Users } from 'lucide-react';

const AboutSection = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Heart,
      titleES: 'Hecho con Amor',
      titleEN: 'Made with Love',
      descES: 'Cada producto es elaborado con dedicación y pasión',
      descEN: 'Every product crafted with dedication and passion',
    },
    {
      icon: Award,
      titleES: 'Calidad Premium',
      titleEN: 'Premium Quality',
      descES: 'Solo los mejores ingredientes frescos',
      descEN: 'Only the finest fresh ingredients',
    },
    {
      icon: Users,
      titleES: 'Tradición Familiar',
      titleEN: 'Family Tradition',
      descES: 'Recetas transmitidas por generaciones',
      descEN: 'Recipes passed down through generations',
    },
  ];

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

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-border bg-card p-8 text-center shadow-card transition-smooth hover:scale-105 hover:shadow-elegant"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-glow transition-smooth group-hover:animate-glow">
                  <feature.icon className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="mb-3 font-display text-xl font-bold text-foreground">
                  {t(feature.titleES, feature.titleEN)}
                </h3>
                <p className="font-sans text-muted-foreground">
                  {t(feature.descES, feature.descEN)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
