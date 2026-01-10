import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Quote, Star } from 'lucide-react';

interface TestimonialCard {
  quoteES: string;
  quoteEN: string;
  author: string;
  roleES: string;
  roleEN: string;
  avatar: string;
  rating: string;
}

const testimonials: TestimonialCard[] = [
  {
    quoteES:
      'Eli\'s Bakery hizo el pastel para nuestra boda y fue increíble!! Fue entregado a tiempo y se veía exactamente como lo imaginamos. El pastel estaba delicioso y nuestros invitados no paraban de hablar de lo bueno que estaba!',
    quoteEN:
      'Eli\'s Bakery made the cake for our wedding and it was amazing!! It was delivered on time and looked exactly how we pictured. The cake was so delicious and our guests couldn\'t stop talking about how good it was!',
    author: 'Elise Harrison',
    roleES: 'Reseña de Google',
    roleEN: 'Google Review',
    avatar:
      'https://ui-avatars.com/api/?name=Elise+Harrison&background=random&color=fff',
    rating: '5.0',
  },
  {
    quoteES:
      '¡Qué agradable sorpresa! Hermoso y delicioso pastel de tres leches, digno de su reputación. La tienda huele a cielo y está llena hasta el borde de productos recién horneados.',
    quoteEN:
      'What a pleasant surprise. Beautiful and delicious tres leches cake, worthy of their reputation. The store smells like heaven and is filled to the brim with freshly baked goods.',
    author: 'Kevin L.',
    roleES: 'Reseña de Google',
    roleEN: 'Google Review',
    avatar:
      'https://ui-avatars.com/api/?name=Kevin+L&background=random&color=fff',
    rating: '5.0',
  },
  {
    quoteES:
      'Compramos el pastel de durazno y fresa recientemente, ¡y fue encantador! El pastel estaba suave, esponjoso e increíblemente sabroso.',
    quoteEN:
      'We recently bought the peach and strawberry cake from this bakery, and it was delightful! The cake was soft, spongy, and incredibly tasty.',
    author: 'Manpreet Kaur',
    roleES: 'Reseña de Google',
    roleEN: 'Google Review',
    avatar:
      'https://ui-avatars.com/api/?name=Manpreet+Kaur&background=random&color=fff',
    rating: '5.0',
  },
];

const layers = [
  { gradientOpacity: 0.1, rotation: -10, panelOpacity: 1 },
  { gradientOpacity: 0.08, rotation: -6, panelOpacity: 0.9 },
  { gradientOpacity: 0.06, rotation: 0, panelOpacity: 0.8 },
];

const TestimonialCarousel = () => {
  const { t } = useLanguage();
  const [isHovering, setIsHovering] = useState(false);

  return (
    <section className="relative bg-black py-32 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C6A649]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-20 text-center animate-fade-in">
            <span className="text-sm font-bold tracking-[0.3em] text-[#C6A649] uppercase mb-4 block">
              {t('Testimonios', 'Testimonials')}
            </span>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tight">
              {t('Lo Que Dicen', 'What Our')} <span className="text-[#C6A649] drop-shadow-[0_0_15px_rgba(198,166,73,0.3)]">{t('Nuestros Clientes', 'Customers Say')}</span>
            </h2>
            <div className="h-1.5 w-32 bg-gradient-to-r from-transparent via-[#C6A649] to-transparent mx-auto rounded-full shadow-[0_0_10px_rgba(198,166,73,0.5)]"></div>
          </div>

          <div
            className="relative flex items-center justify-center px-4 sm:px-8 min-h-[500px]"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="flex flex-col items-center gap-12 md:flex-row md:gap-0 md:justify-center">
              {testimonials.map((testimonial, index) => {
                const layer = layers[index % layers.length];
                const rotation = isHovering ? 0 : layer.rotation;
                const margin = isHovering ? 0 : -60;

                return (
                  <div
                    key={testimonial.author}
                    className="relative flex h-[420px] w-[350px] items-center justify-center rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-3xl transition-all duration-700 ease-out group"
                    style={{
                      background: isHovering
                        ? 'rgba(255,255,255,0.08)'
                        : `linear-gradient(rgba(255,255,255,${layer.gradientOpacity}), rgba(0,0,0,0.5))`,
                      transform: `rotate(${rotation}deg) translateY(${isHovering ? 20 : 0}px) scale(${isHovering ? 1.05 : 1})`,
                      marginLeft: margin,
                      marginRight: margin,
                      zIndex: isHovering ? 50 : 10 + index,
                    }}
                  >
                    <div className="flex h-full flex-col p-10 justify-between">
                      <div>
                        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C6A649]/10 border border-[#C6A649]/20 transition-all group-hover:bg-[#C6A649] group-hover:text-black">
                          <Quote className="h-6 w-6 text-[#C6A649] group-hover:text-black" />
                        </div>

                        <p className="mb-6 text-xl leading-relaxed text-gray-300 font-light italic font-serif">
                          “{t(testimonial.quoteES, testimonial.quoteEN)}”
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/10 pt-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={testimonial.avatar}
                            alt={`${testimonial.author} avatar`}
                            className="h-10 w-10 rounded-full object-cover border border-[#C6A649]/30"
                          />
                          <div>
                            <div className="text-base font-bold text-white uppercase tracking-wider">
                              {testimonial.author}
                            </div>
                            <div className="text-xs text-[#C6A649] font-bold uppercase tracking-widest">
                              {t(testimonial.roleES, testimonial.roleEN)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-[#C6A649]/10 px-3 py-1 rounded-full border border-[#C6A649]/20">
                          <Star className="h-3 w-3 text-[#C6A649] fill-[#C6A649]" />
                          <span className="text-xs font-black text-[#C6A649]">{testimonial.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
