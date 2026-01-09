import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Croissant, Cake, Utensils, Coffee } from 'lucide-react';
import aboutImage from '@/assets/0_aON7A52gUvpSJio0cqBsf3_1767033929047_na1fn_L2hvbWUvdWJ1bnR1L2VsaXNfYmFrZXJ5X2ZpbmFsL2ludGVyaW9yL2VuaGFuY2VkX2Nha2VfMDVfYmFrZXJ5X2Rpc3BsYXlfY2FzZV9jYWtlcw.png';

const AboutSection = () => {
  const { t } = useLanguage();

  const offerings = [
    { icon: Croissant, labelES: 'Pan Dulce', labelEN: 'Pastries' },
    { icon: Cake, labelES: 'Pasteles', labelEN: 'Cakes' },
    { icon: Utensils, labelES: 'Tamales', labelEN: 'Tamales' },
    { icon: Coffee, labelES: 'Desayunos', labelEN: 'Breakfast' },
  ];

  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">

          {/* Text Content Side */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h2 className="font-display text-4xl font-bold tracking-tighter text-gradient-gold sm:text-5xl">
                {t('Sobre Nosotros', 'About Us')}
              </h2>
              <div className="h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent" />
            </div>

            <div className="space-y-6 text-lg text-muted-foreground">
              <p className="leading-relaxed">
                {t(
                  "En Eli's Bakery Cafe somos una pastelería y panadería familiar con raíces mexicanas. Nuestro compromiso es ofrecer productos frescos todos los días, desde nuestro famoso pastel de 3 leches, hasta pan dulce tradicional, postres especiales y pasteles personalizados para cualquier ocasión.",
                  "At Eli's Bakery Cafe, we are a family-owned bakery rooted in Mexican tradition. We take pride in offering freshly baked products daily — from our signature Tres Leches cake, to traditional sweet breads, specialty desserts, and fully customized cakes for any occasion."
                )}
              </p>
              <p className="font-medium text-foreground italic">
                {t(
                  "Porque en Eli's, cada celebración merece ser inolvidable.",
                  "Because at Eli's, every celebration deserves to be unforgettable."
                )}
              </p>
            </div>

            {/* Icons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4">
              {offerings.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex flex-col items-center gap-3 text-center group">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110 shadow-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-semibold text-foreground/80 group-hover:text-primary transition-colors">
                      {t(item.labelES, item.labelEN)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4">
              <Button asChild className="rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/menu" className="flex items-center gap-2">
                  {t('Ver Menú', 'View Menu')} <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Image Side */}
          <div className="relative mx-auto w-full max-w-[600px] lg:max-w-none">
            <div className="relative aspect-square overflow-hidden rounded-2xl shadow-2xl ring-1 ring-border/50">
              {/* Decorative elements */}
              <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

              <img
                src={aboutImage}
                alt="Eli's Bakery Display Case"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />

              {/* Glass overlay */}
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl pointer-events-none" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
