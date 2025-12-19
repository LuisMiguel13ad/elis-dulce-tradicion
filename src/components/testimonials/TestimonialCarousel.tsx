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
    <section className="relative bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-display text-4xl font-bold text-gradient-gold md:text-5xl">
              {t('Lo Que Dicen Nuestros Clientes', 'What Our Customers Say')}
            </h2>
            <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent" />
          </div>

          <div
            className="relative flex items-center justify-center px-4 sm:px-8"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="flex flex-col items-center gap-8 md:flex-row md:gap-0 md:justify-center">
              {testimonials.map((testimonial, index) => {
                const layer = layers[index % layers.length];
                const rotation = isHovering ? 0 : layer.rotation;
                const margin = isHovering ? 0 : -40;

                return (
                  <div
                    key={testimonial.author}
                    className="relative flex h-[340px] w-[320px] items-center justify-center rounded-2xl border border-white/10 shadow-2xl backdrop-blur transition-all duration-500 ease-out"
                    style={{
                      background: `linear-gradient(rgba(255,255,255,${layer.gradientOpacity}), transparent)`,
                      boxShadow: '0 25px 25px rgba(0, 0, 0, 0.25)',
                      transform: `rotate(${rotation}deg) translateY(${isHovering ? 10 : 0}px)`,
                      marginLeft: margin,
                      marginRight: margin,
                    }}
                  >
                    <div
                      className="absolute inset-4 rounded-xl shadow-xl ring-1 ring-black/5 overflow-hidden"
                      style={{ backgroundColor: `rgba(255,255,255,${layer.panelOpacity})` }}
                    >
                      <div className="flex h-full flex-col p-6">
                        <div className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 ring-1 ring-black/5">
                          <Quote className="h-4 w-4 text-neutral-700" />
                        </div>

                        <p className="mb-4 flex-1 text-sm leading-relaxed text-neutral-900">
                          “{t(testimonial.quoteES, testimonial.quoteEN)}”
                        </p>

                        <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={testimonial.avatar}
                              alt={`${testimonial.author} avatar`}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                            <div>
                              <div className="text-sm font-medium text-neutral-900">
                                {testimonial.author}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {t(testimonial.roleES, testimonial.roleEN)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-medium">{testimonial.rating}</span>
                          </div>
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
