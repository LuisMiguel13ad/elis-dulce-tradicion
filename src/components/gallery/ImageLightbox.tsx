import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const ImageLightbox = ({ images, currentIndex, isOpen, onClose, onNavigate }: ImageLightboxProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handlePrevious = useCallback(() => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onNavigate(newIndex);
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onNavigate(newIndex);
  }, [currentIndex, images.length, onNavigate]);

  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, onClose, handlePrevious, handleNext]);

  if (!isOpen || images.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-none">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-smooth"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={handlePrevious}
              className="absolute left-4 z-50 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-smooth"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <div className="relative w-full h-full flex items-center justify-center p-8">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={images[currentIndex]}
                alt={`Gallery image ${currentIndex + 1}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 0.9 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onLoad={() => setImageLoaded(true)}
                className="max-w-full max-h-full object-contain"
              />
            </AnimatePresence>
          </div>

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 z-50 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-smooth"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 text-white text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageLightbox;



