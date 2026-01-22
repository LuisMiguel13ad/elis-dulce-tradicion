import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface GalleryItem {
    id: string | number;
    image_url: string;
    caption?: string;
}

export function useGalleryItems() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Load Local Images via Vite Glob Import
        const loadLocalImages = () => {
            // Import all images from both directories
            const galleryModules = import.meta.glob('@/assets/gallery/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' });
            const productModules = import.meta.glob('@/assets/products/cakes/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' });

            const allImages: GalleryItem[] = [];
            let idCounter = 1;

            // Helper to process modules
            const processModules = (modules: Record<string, unknown>) => {
                Object.values(modules).forEach((imageSrc) => {
                    if (typeof imageSrc === 'string') {
                        allImages.push({
                            id: `local-${idCounter++}`,
                            image_url: imageSrc,
                            caption: 'Eli\'s Dulce Tradición'
                        });
                    }
                });
            };

            processModules(galleryModules);
            processModules(productModules);

            return allImages;
        };

        const localItems = loadLocalImages();

        // Shuffle once on mount
        const shuffled = [...localItems].sort(() => Math.random() - 0.5);

        // We prioritize local images as per user request to "show the work that has been done"
        setItems(shuffled);
        setLoading(false);

    }, []);

    return { items, loading };
}
