import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  placeholder?: string;
  effect?: 'blur' | 'opacity' | 'black-and-white';
}

/**
 * Optimized lazy-loaded image component
 * Uses Supabase image transformations for responsive images
 */
export const LazyImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder,
  effect = 'blur',
}: LazyImageProps) => {
  const [error, setError] = useState(false);

  // Generate responsive image URLs if using Supabase storage
  const isSupabaseImage = src?.includes('supabase.co/storage');
  
  // Generate WebP version
  const webpSrc = isSupabaseImage && !error
    ? `${src}?format=webp&quality=80`
    : src;

  // Generate responsive srcset
  const srcSet = isSupabaseImage && !error
    ? [
        `${src}?width=400&format=webp&quality=80 400w`,
        `${src}?width=800&format=webp&quality=80 800w`,
        `${src}?width=1200&format=webp&quality=80 1200w`,
      ].join(', ')
    : undefined;

  if (error && placeholder) {
    return (
      <img
        src={placeholder}
        alt={alt}
        className={className}
        width={width}
        height={height}
      />
    );
  }

  return (
    <LazyLoadImage
      src={webpSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      effect={effect}
      placeholderSrc={placeholder}
      srcSet={srcSet}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      onError={() => {
        if (!error) {
          setError(true);
        }
      }}
      loading="lazy"
    />
  );
};
