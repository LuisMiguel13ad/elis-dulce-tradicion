import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ReviewQuote from '@/components/about/ReviewQuote';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Heart, Award, Users, Cake, ArrowRight, Quote } from 'lucide-react';
import { featuredReviews } from '@/data/reviews';

const About = () => {
  const { t } = useLanguage();

  const values = [
    {
      icon: Heart,
      titleES: 'Hecho con Amor',
      titleEN: 'Made with Love',
      descES: 'Cada producto es elaborado con dedicación y pasión, siguiendo recetas familiares transmitidas por generaciones.',
      descEN: 'Every product is crafted with dedication and passion, following family recipes passed down through generations.',
    },
    {
      icon: Award,
      titleES: 'Sabores Auténticos',
      titleEN: 'Authentic Flavors',
      descES: 'Mantenemos la tradición mexicana viva con ingredientes frescos y técnicas tradicionales que capturan el verdadero sabor de casa.',
      descEN: 'We keep Mexican tradition alive with fresh ingredients and traditional techniques that capture the true taste of home.',
    },
    {
      icon: Users,
      titleES: 'Tradición Familiar',
      titleEN: 'Family Tradition',
      descES: 'Nuestras recetas han sido perfeccionadas a lo largo de los años, creando sabores que conectan con el corazón y el alma.',
      descEN: 'Our recipes have been perfected over the years, creating flavors that connect with the heart and soul.',
    },
    {
      icon: Cake,
      titleES: 'Servicio Personalizado',
      titleEN: 'Personalized Service',
      descES: 'Cada pastel cuenta una historia única. Trabajamos contigo para hacer realidad tu visión y crear momentos inolvidables.',
      descEN: 'Every cake tells a unique story. We work with you to bring your vision to life and create unforgettable moments.',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#C6A649]/30">
      <Navbar />

      <main>
        {/* Cinematic Hero Section */}
        <section className="relative pt-48 pb-32 overflow-hidden">
          {/* Background Glows */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#C6A649]/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="mx-auto max-w-5xl text-center">
              <span className="inline-block px-4 py-1 rounded-full border border-[#C6A649]/30 bg-[#C6A649]/10 text-[#C6A649] text-sm font-bold tracking-[0.2em] uppercase mb-8 animate-fade-in shadow-[0_0_20px_rgba(198,166,73,0.15)]">
                {t('Nuestra Herencia', 'Our Heritage')}
              </span>
              <h1 className="mb-8 font-display text-6xl md:text-8xl font-black tracking-tight animate-fade-in">
                <span className="text-white">{t('La Dulce', 'The Sweet')} </span>
                <span className="text-[#C6A649] block md:inline drop-shadow-[0_0_15px_rgba(198,166,73,0.3)]">
                  {t('Tradición', 'Tradition')}
                </span>
              </h1>
              <div className="mx-auto mb-12 h-1.5 w-40 rounded-full bg-gradient-to-r from-transparent via-[#C6A649] to-transparent shadow-[0_0_10px_rgba(198,166,73,0.5)]" />
              <p className="mx-auto max-w-2xl font-serif text-2xl italic text-gray-400 md:text-3xl animate-fade-in animation-delay-300">
                {t(
                  '"Sabores que celebran la vida, recetas que unen generaciones."',
                  '"Flavors that celebrate life, recipes that unite generations."'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* The Story Grid */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="grid gap-16 lg:grid-cols-2 items-center">

              {/* Image Side with Premium Frame */}
              <div className="relative group order-2 lg:order-1">
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#C6A649]/20 to-transparent blur-2xl rounded-[2rem] opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl skew-y-1 group-hover:skew-y-0 transition-transform duration-700">
                  <img
                    src="/src/assets/about/bakery-display.png"
                    alt="Eli's Bakery Legacy"
                    className="w-full h-auto object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-[#C6A649] flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-[#C6A649]/50">E</div>
                      <div>
                        <p className="text-white font-bold text-lg">Eli & Family</p>
                        <p className="text-[#C6A649] text-sm font-semibold">Founders since 1990</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Side - Glassmorphism Card */}
              <div className="space-y-12 order-1 lg:order-2">
                <div className="relative rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-10 md:p-14 shadow-2xl">
                  <Quote className="absolute top-8 right-8 h-16 w-16 text-[#C6A649]/10" />

                  <div className="space-y-8 relative z-10">
                    <h2 className="text-4xl font-bold text-[#C6A649] font-display uppercase tracking-widest">
                      {t('El Comienzo', 'The Beginning')}
                    </h2>

                    <div className="space-y-6 text-lg md:text-xl text-gray-300 leading-relaxed font-light">
                      <p>
                        {t(
                          'Nuestra historia no empieza en un horno comercial, sino en la pequeña cocina de mi abuela en México. Allí, el aroma del pan recién horneado era el lenguaje del amor.',
                          'Our story doesn\'t start in a commercial oven, but in my grandmother\'s small kitchen in Mexico. There, the aroma of fresh-baked bread was the language of love.'
                        )}
                      </p>
                      <p>
                        {t(
                          'Esa sabiduría pasó de mi abuela a mi madre, y de ella a mí. Tres generaciones de mujeres dedicadas a perfeccionar la alquimia secreta de los sabores auténticos.',
                          'That wisdom passed from my grandmother to my mother, and from her to me. Three generations of women dedicated to perfecting the secret alchemy of authentic flavors.'
                        )}
                      </p>
                    </div>

                    <div className="pt-8 border-t border-white/10">
                      <p className="text-[#C6A649] font-black text-xl italic font-serif">
                        {t(
                          '"No solo horneamos pan; horneamos memorias que nutren el alma."',
                          '"We don\'t just bake bread; we bake memories that nourish the soul."'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Core Values - Interactive Cards */}
        <section className="py-24 bg-white/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter">
                {t('Nuestros', 'Our')} <span className="text-[#C6A649]">{t('Valores', 'Values')}</span>
              </h2>
              <div className="mx-auto h-1 w-24 bg-[#C6A649] rounded-full shadow-[0_0_15px_rgba(198,166,73,0.5)]" />
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {values.map((val, idx) => {
                const Icon = val.icon;
                return (
                  <div key={idx} className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#C6A649]/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="relative h-full p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-500 group-hover:-translate-y-4 group-hover:border-[#C6A649]/50 overflow-hidden">
                      <div className="absolute -right-4 -top-4 h-24 w-24 bg-[#C6A649]/5 rounded-full blur-2xl group-hover:bg-[#C6A649]/10 transition-colors" />

                      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C6A649]/10 text-[#C6A649] group-hover:bg-[#C6A649] group-hover:text-black transition-all duration-500 shadow-lg">
                        <Icon className="h-8 w-8" />
                      </div>

                      <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#C6A649] transition-colors">
                        {t(val.titleES, val.titleEN)}
                      </h3>

                      <p className="text-gray-400 group-hover:text-gray-200 transition-colors leading-relaxed">
                        {t(val.descES, val.descEN)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA - The Invitation */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C6A649]/10 rounded-full blur-[150px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="mx-auto max-w-4xl space-y-10">
              <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
                {t('Únete a nuestra', 'Join our')} <br />
                <span className="text-[#C6A649]">{t('Gran Familia', 'Big Family')}</span>
              </h2>

              <p className="text-xl md:text-2xl text-gray-300 font-light max-w-2xl mx-auto">
                {t(
                  'Cada bocado es una parte de nuestra historia. Ven a ser parte de la tradición que endulza la vida día tras día.',
                  'Every bite is a part of our story. Come be a part of the tradition that sweetens life day after day.'
                )}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
                <Button
                  asChild
                  size="lg"
                  className="h-16 px-12 rounded-full bg-[#C6A649] text-black font-black text-xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_30px_rgba(198,166,73,0.3)] shadow-glow"
                >
                  <Link to="/order">
                    {t('Ordenar Ahora', 'Order Now')}
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-16 px-12 rounded-full border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white font-bold text-xl hover:border-white transition-all"
                >
                  <Link to="/menu">
                    {t('Explorar Menú', 'Explore Menu')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
