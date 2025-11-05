import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import customCake from '@/assets/custom-cake.jpg';
import tresLeches from '@/assets/tres-leches.jpg';
import carBirthdayCake from '@/assets/CarBirthdayCake.jpg';
import butterflyBirthdayCake from '@/assets/ButterflyBirthdayCake.jpg';
import pawPatrolBirthdayCake from '@/assets/PawPatrolBirthdayCake.jpg';
import alWeddingCake from '@/assets/ALWeddingCake.jpg';
import weddingCake from '@/assets/weddingCake.jpg';
import jmWeddingCake from '@/assets/JMWeddingCake.jpg';
import quinceImage1 from '@/assets/3.png';
import quinceImage2 from '@/assets/4.png';
import quinceImage3 from '@/assets/6.png';

const Gallery = () => {
  const { t } = useLanguage();

  const categories = [
    {
      titleES: 'Pasteles de Cumpleaños',
      titleEN: 'Birthday Cakes',
      images: [carBirthdayCake, butterflyBirthdayCake, pawPatrolBirthdayCake],
    },
    {
      titleES: 'Bodas',
      titleEN: 'Weddings',
      images: [alWeddingCake, weddingCake, jmWeddingCake],
    },
    {
      titleES: 'Mis Quince Años',
      titleEN: 'My Sweet Fifteen',
      images: [quinceImage1, quinceImage2, quinceImage3],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h1 className="mb-4 font-display text-4xl font-bold text-gradient-gold md:text-5xl lg:text-6xl">
              {t('Galería', 'Gallery')}
            </h1>
            <div className="mx-auto mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent" />
            <p className="mx-auto max-w-2xl font-sans text-lg text-muted-foreground md:text-xl">
              {t(
                'Momentos hermosos. Sonrisas reales. Celebraciones inolvidables. Explore nuestra colección de pasteles y panadería fresca.',
                'Beautiful moments. Real smiles. Unforgettable celebrations. Browse our collection of cakes and fresh bakery items.'
              )}
            </p>
          </div>

          <div className="space-y-16">
            {categories.map((category, idx) => (
              <div key={idx} className="animate-fade-in">
                <h2 className="mb-8 font-display text-3xl font-bold text-foreground md:text-4xl">
                  {t(category.titleES, category.titleEN)}
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {category.images.map((image, imgIdx) => (
                    <div
                      key={imgIdx}
                      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-smooth hover:scale-105 hover:shadow-elegant"
                    >
                      <div className="relative aspect-[9/16] overflow-hidden">
                        <img
                          src={image}
                          alt={`${t(category.titleES, category.titleEN)} ${imgIdx + 1}`}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Gallery;
