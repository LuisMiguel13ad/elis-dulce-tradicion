import { useLanguage } from '@/contexts/LanguageContext';
import { Heart, Award, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const FeaturesThread = () => {
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
    <div className="relative mx-auto max-w-4xl">
      {/* Thread line */}
      <div className="absolute left-8 top-0 h-full w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary md:left-1/2 md:-translate-x-0.5" />
      
      <div className="space-y-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const isEven = index % 2 === 0;
          
          return (
            <div
              key={index}
              className={cn(
                "relative flex gap-8",
                isEven ? "md:flex-row" : "md:flex-row-reverse"
              )}
            >
              {/* Icon and connector */}
              <div className="relative z-10 flex flex-shrink-0 items-start justify-center md:w-1/2">
                <div className="relative">
                  <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-xl" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-glow transition-smooth hover:scale-110 hover:shadow-[0_0_30px_hsl(45_92%_63%/0.5)]">
                    <Icon className="h-8 w-8 text-secondary" />
                  </div>
                  {/* Thread connector dot */}
                  <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-4 ring-background" />
                </div>
              </div>

              {/* Content card */}
              <div className={cn(
                "flex-1 rounded-2xl border border-border bg-card p-6 shadow-card transition-smooth hover:scale-105 hover:shadow-elegant md:w-1/2",
                isEven ? "md:ml-auto" : "md:mr-auto"
              )}>
                <h3 className="mb-2 font-display text-xl font-bold text-foreground">
                  {t(feature.titleES, feature.titleEN)}
                </h3>
                <p className="font-sans text-muted-foreground">
                  {t(feature.descES, feature.descEN)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturesThread;

