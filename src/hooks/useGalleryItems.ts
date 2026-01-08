import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface GalleryItem {
    id: number;
    image_url: string;
    category: string;
    category_en: string;
    category_es: string;
    caption_en?: string;
    caption_es?: string;
    display_order: number;
}

export interface GalleryCategory {
    id: string;
    titleES: string;
    titleEN: string;
    images: {
        src: string;
        category: string;
        categoryES: string;
        categoryEN: string;
    }[];
}

export function useGalleryItems() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchItems() {
            try {
                setLoading(true);

                // If Supabase is not configured, we might want to return empty or mock
                // But for now we assume it is or will fail gracefully
                if (!supabase) {
                    console.warn('Supabase not configured, using fallback/empty gallery');
                    setLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from('gallery_items')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true });

                if (error) {
                    throw error;
                }

                if (data) {
                    setItems(data);
                }
            } catch (err: any) {
                console.error('Error fetching gallery items:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchItems();
    }, []);

    // Helper to transform to the category structure used by the UI
    const getCategories = (): GalleryCategory[] => {
        if (!items.length) return [];

        const categoriesMap = new Map<string, GalleryCategory>();

        items.forEach(item => {
            if (!categoriesMap.has(item.category)) {
                categoriesMap.set(item.category, {
                    id: item.category,
                    titleES: item.category_es || item.category,
                    titleEN: item.category_en || item.category,
                    images: []
                });
            }

            const category = categoriesMap.get(item.category)!;
            category.images.push({
                src: item.image_url,
                category: item.category,
                categoryES: item.category_es || item.category,
                categoryEN: item.category_en || item.category
            });
        });

        return Array.from(categoriesMap.values());
    };

    return { items, categories: getCategories(), loading, error };
}
