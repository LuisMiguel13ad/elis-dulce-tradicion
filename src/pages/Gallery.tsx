import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageLightbox from '@/components/gallery/ImageLightbox';
import { Button } from '@/components/ui/button';
import { useState, useMemo, useCallback, memo } from 'react';
import { LazyImage } from '@/components/optimized/LazyImage';
import { useGalleryItems } from '@/hooks/useGalleryItems';
import { Skeleton } from '@/components/ui/skeleton';
interface GalleryImage {
  src: string;
  category: string;
  categoryES: string;
  categoryEN: string;
}

const Gallery = () => {
  const { t } = useLanguage();
  const { items, loading } = useGalleryItems();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Flatten all images for lightbox navigation
  const allImages = useMemo(() => {
    return items.map(item => item.image_url);
  }, [items]);

  const handleImageClick = useCallback((imageSrc: string) => {
    const index = allImages.indexOf(imageSrc);
    if (index !== -1) {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  }, [allImages]);

  const handleNavigate = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);



  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#C6A649]/30">
      <Navbar />

      <main className="pt-32 pb-24 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#C6A649]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-20 text-center relative z-10">
            <span className="inline-block px-4 py-1 rounded-full border border-[#C6A649]/30 bg-[#C6A649]/10 text-[#C6A649] text-sm font-bold tracking-[0.2em] uppercase mb-8 animate-fade-in shadow-[0_0_20px_rgba(198,166,73,0.15)]">
              {t('Nuestro Trabajo', 'Our Work')}
            </span>
            <h1 className="mb-6 font-display text-5xl font-black text-white md:text-7xl lg:text-8xl animate-fade-in uppercase tracking-tighter">
              {t('Galería', 'Gallery')}
            </h1>
            <div className="mx-auto mb-8 h-1.5 w-32 rounded-full bg-gradient-to-r from-transparent via-[#C6A649] to-transparent shadow-[0_0_15px_rgba(198,166,73,0.5)]" />
            <p className="mx-auto max-w-2xl font-sans text-xl text-gray-400 font-light leading-relaxed animate-fade-in animation-delay-300">
              {t(
                'Momentos hermosos. Sonrisas reales. Celebraciones inolvidables. Explore nuestra colección de obras maestras.',
                'Beautiful moments. Real smiles. Unforgettable celebrations. Browse our collection of masterpieces.'
              )}
            </p>
          </div>


          {loading ? (
            <div className="space-y-12">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="aspect-[9/16] w-full rounded-2xl bg-white/5" />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Unified Masonry Grid - Dark Mode */}
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 px-1 animate-fade-in">
                {items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    onClick={() => handleImageClick(item.image_url)}
                    className="break-inside-avoid group cursor-pointer relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(198,166,73,0.25)] hover:-translate-y-2 hover:border-[#C6A649]/30"
                  >
                    <div className="relative">
                      <LazyImage
                        src={item.image_url}
                        alt="Eli's Bakery Masterpiece"
                        className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110"
                        effect="blur"
                      />

                      {/* Premium Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      {/* Hover UI */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-8 group-hover:translate-y-0">
                        <div className="rounded-full bg-[#C6A649] p-5 shadow-[0_0_30px_rgba(198,166,73,0.5)] text-black">
                          <svg
                            className="h-10 w-10"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <ImageLightbox
        images={allImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={handleNavigate}
      />

      <Footer />
    </div>
  );
};

export default Gallery;
