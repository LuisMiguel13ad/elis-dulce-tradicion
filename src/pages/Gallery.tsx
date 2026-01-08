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
  const { categories, loading } = useGalleryItems();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Flatten all images for lightbox navigation
  const allImages = useMemo(() => {
    return categories.flatMap(cat => cat.images.map(img => img.src));
  }, [categories]);

  // Filter categories based on selection
  const filteredCategories = useMemo(() => {
    if (!selectedCategory) return categories;
    return categories.filter(cat => cat.id === selectedCategory);
  }, [categories, selectedCategory]);

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

  const showVideos = selectedCategory === null || selectedCategory === 'videos';

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


          {loading ? (
            <div className="space-y-12">
              <div className="flex justify-center gap-4">
                <Skeleton className="h-10 w-24 rounded-md" />
                <Skeleton className="h-10 w-32 rounded-md" />
                <Skeleton className="h-10 w-32 rounded-md" />
                <Skeleton className="h-10 w-32 rounded-md" />
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="aspect-[9/16] w-full rounded-2xl" />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Category Filters */}
              <div className="mb-12 flex flex-wrap justify-center gap-2">
                <Button
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(null)}
                  size="sm"
                >
                  {t('Todos', 'All')}
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category.id)}
                    size="sm"
                  >
                    {t(category.titleES, category.titleEN)}
                  </Button>
                ))}
                <Button
                  variant={selectedCategory === 'videos' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('videos')}
                  size="sm"
                >
                  {t('Videos', 'Videos')}
                </Button>
              </div>

              <div className="space-y-16">
                {filteredCategories.map((category, idx) => (
                  <div key={idx} className="animate-fade-in">
                    <h2 className="mb-8 font-display text-3xl font-bold text-foreground md:text-4xl">
                      {t(category.titleES, category.titleEN)}
                    </h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {category.images.map((image, imgIdx) => (
                        <div
                          key={imgIdx}
                          onClick={() => handleImageClick(image.src)}
                          className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-smooth hover:scale-105 hover:border-primary/50 hover:shadow-elegant"
                        >
                          <div className="relative aspect-[9/16] overflow-hidden">
                            <LazyImage
                              src={image.src}
                              alt={`${t(category.titleES, category.titleEN)} ${imgIdx + 1}`}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              effect="blur"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="rounded-full bg-white/20 backdrop-blur-sm p-4">
                                <svg
                                  className="h-8 w-8 text-white"
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
                  </div>
                ))}

                {/* Videos Section */}
                {showVideos && (
                  <div className="animate-fade-in">
                    <h2 className="mb-8 font-display text-3xl font-bold text-foreground md:text-4xl">
                      {t('Videos', 'Videos')}
                    </h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                        <div className="relative aspect-[9/16] w-full">
                          <iframe
                            src="https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Freel%2F751834970733497&show_text=false&width=340"
                            width="100%"
                            height="100%"
                            style={{ border: 'none', overflow: 'hidden' }}
                            scrolling="no"
                            frameBorder="0"
                            allowFullScreen={true}
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                            title="Eli's Bakery Facebook Reel"
                            className="absolute inset-0 h-full w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
