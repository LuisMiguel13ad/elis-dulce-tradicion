import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Cake } from 'lucide-react';
import heroVideo from '@/assets/CustomCakeVideo.mp4';
import heroLogo from '@/assets/TransparentLogo.png';

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
          preload="none"
          poster={heroLogo}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        {/* Subtle dark overlay for text legibility (30-40% opacity) */}
        <div className="absolute inset-0 bg-black/35" />
      </div>

      {/* Content overlay - centered */}
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mx-auto flex max-w-4xl flex-col items-center space-y-10 animate-fade-in">
            <div className="w-full max-w-[420px] md:max-w-[560px]">
              <img
                src={heroLogo}
                alt={t('home.logoAlt')}
                className="mx-auto h-auto w-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
              />
            </div>

            <Button
              asChild
              size="lg"
              className="group h-14 rounded-full bg-primary px-10 font-sans text-lg font-bold text-secondary shadow-glow transition-smooth hover:scale-105 hover:shadow-[0_0_45px_hsl(45_92%_63%/0.45)]"
            >
              <Link to="/order">
                <Cake className="mr-2 h-5 w-5" />
                {t('home.orderNow')}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
    </section>
  );
};

export default HeroSection;
