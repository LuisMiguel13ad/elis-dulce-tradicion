import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { memo, useMemo } from 'react';
import {
  CardCurtainReveal,
  CardCurtainRevealBody,
  CardCurtainRevealTitle,
  CardCurtainRevealDescription,
} from '@/components/ui/card-curtain-reveal';
import { LazyImage } from '@/components/optimized/LazyImage';
import customCake from '@/assets/custom-cake.jpg';
import tresLeches from '@/assets/tres-leches.jpg';
import panDulce from '@/assets/pan-dulce.jpg';

const FeaturedProducts = memo(() => {
  const { t } = useLanguage();

  const products = useMemo(() => [
    {
      image: customCake,
      titleES: 'Pasteles Personalizados',
      titleEN: 'Custom Cakes',
      descES: 'Pasteles personalizados para toda ocasión. Diseños elegantes, colores hermosos y sabor incomparable.',
      descEN: 'Custom cakes for every occasion, crafted with elegance and unforgettable flavor.',
    },
    {
      image: tresLeches,
      titleES: 'Pastel de 3 Leches',
      titleEN: 'Tres Leches Cake',
      descES: 'Suave, delicado y húmedo, preparado con nuestra receta especial. El favorito de la casa.',
      descEN: 'Soft, rich, and deeply flavorful — prepared with our signature recipe. A house favorite.',
    },
    {
      image: panDulce,
      titleES: 'Pan Dulce & Panadería',
      titleEN: 'Sweet Bread & Bakery',
      descES: 'Conchas, bolillos, cuernitos y más, horneados cada día con ingredientes frescos.',
      descEN: 'Conchas, bolillos, croissants and more, baked fresh every day.',
    },
  ], []);

  return (
    <section className="relative bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-4xl font-bold text-gradient-gold md:text-5xl">
              {t('Productos Destacados', 'Featured Products')}
            </h2>
            <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent" />
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {products.map((product, index) => (
              <CardCurtainReveal
                key={index}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-smooth hover:shadow-elegant"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <LazyImage
                    src={product.image}
                    alt={t(product.titleES, product.titleEN)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    effect="blur"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
                <CardCurtainRevealBody>
                  <CardCurtainRevealTitle className="mb-3 font-display text-2xl font-bold text-foreground">
                    {t(product.titleES, product.titleEN)}
                  </CardCurtainRevealTitle>
                  <CardCurtainRevealDescription className="font-sans text-muted-foreground">
                    {t(product.descES, product.descEN)}
                  </CardCurtainRevealDescription>
                </CardCurtainRevealBody>
              </CardCurtainReveal>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-primary px-8 font-sans text-base font-bold text-secondary shadow-glow transition-smooth hover:scale-105"
            >
              <Link to="/order">{t('Hacer Pedido', 'Place Order')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
});

FeaturedProducts.displayName = 'FeaturedProducts';

export default FeaturedProducts;
