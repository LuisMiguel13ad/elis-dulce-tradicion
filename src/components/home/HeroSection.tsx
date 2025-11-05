import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Cake } from 'lucide-react';
import heroVideo from '@/assets/HeroVideo.mp4';

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      {/* Full-width video background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        {/* Subtle dark overlay for text legibility (30-40% opacity) */}
        <div className="absolute inset-0 bg-black/35" />
      </div>

      {/* Content overlay - centered */}
      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="mx-auto max-w-4xl space-y-8 animate-fade-in">
          <div className="mb-6 inline-block rounded-full border-2 border-primary/30 bg-secondary/50 px-6 py-2 backdrop-blur-sm">
            <p className="font-sans text-sm font-semibold tracking-wider text-primary">
              {t('Desde 1995 • Tradición Familiar', 'Since 1995 • Family Tradition')}
            </p>
          </div>

          <h1 className="font-display text-5xl font-bold leading-tight text-white md:text-7xl lg:text-8xl">
            <span className="inline-block animate-shimmer bg-gradient-to-r from-primary via-primary/80 to-primary bg-[length:200%_auto] bg-clip-text text-transparent">
              Eli's Bakery Cafe
            </span>
          </h1>

          <p className="font-display text-3xl font-semibold text-primary/90 md:text-4xl">
            {t('Sabores que Celebran la Vida', 'Flavors That Celebrate Life')}
          </p>

          <p className="mx-auto max-w-2xl font-sans text-lg leading-relaxed text-white/95 md:text-xl">
            {t(
              'Panadería y pastelería tradicional con el toque especial de casa. Hechos con amor, calidad y tradición mexicana.',
              'Traditional bakery & pastry made with care, quality, and Mexican heritage.'
            )}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-6 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group h-16 rounded-full bg-primary px-10 font-sans text-lg font-bold text-secondary shadow-glow transition-smooth hover:scale-105 hover:shadow-[0_0_50px_hsl(45_92%_63%/0.5)]"
            >
              <Link to="/order">
                <Cake className="mr-2 h-5 w-5" />
                {t('Ordenar Pastel', 'ORDER NOW')}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-16 rounded-full border-2 border-white/30 bg-white/10 px-10 font-sans text-lg font-bold text-white backdrop-blur-sm transition-smooth hover:bg-white/20 hover:text-white"
            >
              <Link to="/gallery">{t('Ver Galería', 'View Gallery')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
