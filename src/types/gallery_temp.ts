export interface GalleryItem {
    id: number;
    image_url: string;
    category: string;
    category_en: string;
    category_es: string;
    caption_en?: string;
    caption_es?: string;
    description_en?: string;
    description_es?: string;
    display_order: number;
}

export interface GalleryCategory {
    id: string; // matches 'category' column
    titleES: string;
    titleEN: string;
    images: {
        src: string;
        category: string;
        categoryES: string;
        categoryEN: string;
    }[];
}
