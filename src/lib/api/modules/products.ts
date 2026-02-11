import { BaseApiClient } from '../base';

const MOCK_PRODUCTS = [
    {
        id: 1,
        name_es: 'Pastel de Tres Leches Tradicional',
        name_en: 'Traditional Tres Leches Cake',
        description_es: 'Nuestro famoso pastel de tres leches, esponjoso y perfectamente humedecido con nuestra mezcla secreta.',
        description_en: 'Our famous tres leches cake, moist and perfectly balanced with our secret milk blend.',
        price: 35.00,
        category: 'cakes',
        image_url: '/images/menu/wedding_cake_display_1768064340098.png',
        is_active: true
    },
    {
        id: 2,
        name_es: 'Conchas de Vainilla y Chocolate',
        name_en: 'Vanilla & Chocolate Conchas',
        description_es: 'Pan dulce tradicional con una costra crujiente de azúcar en forma de concha.',
        description_en: 'Traditional sweet bread with a crunchy shell-patterned sugar topping.',
        price: 2.50,
        category: 'bread',
        image_url: '/images/menu/pan_dulce_basket_1768064358293.png',
        is_active: true
    },
    {
        id: 3,
        name_es: 'Pastel de Bodas "Elegancia"',
        name_en: 'Elegance Wedding Cake',
        description_es: 'Diseño multinivel con flores frescas y detalles en oro comestible.',
        description_en: 'Multi-tiered design with fresh flowers and edible gold accents.',
        price: 250.00,
        category: 'cakes',
        image_url: '/images/menu/wedding_cake_display_1768064340098.png',
        is_active: true
    },
    {
        id: 4,
        name_es: 'Surtido de Pan Dulce de Temporada',
        name_en: 'Seasonal Sweet Bread Assortment',
        description_es: 'Una selección de nuestros mejores panes dulces del día, incluyendo orejas y cuernitos.',
        description_en: 'A selection of our best daily sweet breads, including orejas and cuernitos.',
        price: 15.00,
        category: 'bread',
        image_url: '/images/menu/pan_dulce_basket_1768064358293.png',
        is_active: true
    },
    {
        id: 5,
        name_es: 'Tamales de Pollo con Salsa Verde',
        name_en: 'Chicken Tamales with Green Sauce',
        description_es: 'Tamales hechos a mano con masa de maíz fresca y pollo deshebrado en salsa verde.',
        description_en: 'Handmade tamales with fresh corn masa and shredded chicken in green sauce.',
        price: 3.50,
        category: 'other',
        image_url: '/images/menu/dessert_table_spread_1768064377177.png',
        is_active: true
    },
    {
        id: 6,
        name_es: 'Mesa de Postres "Fiesta"',
        name_en: 'Fiesta Dessert Table',
        description_es: 'Servicio completo de mesa de postres para eventos, incluye variedad de mini postres.',
        description_en: 'Full dessert table service for events, includes a variety of mini desserts.',
        price: 450.00,
        category: 'other',
        image_url: '/images/menu/dessert_table_spread_1768064377177.png',
        is_active: true
    }
];

export class ProductsApi extends BaseApiClient {
    async getProducts() {
        const sb = this.ensureSupabase();

        if (sb) {
            const { data, error } = await sb.from('products').select('*').eq('is_active', true);
            if (!error && data && data.length > 0) {
                return data;
            }
            if (error) {
                console.warn('Error fetching products, using mock fallback', error);
            }
        }

        return MOCK_PRODUCTS;
    }

    async getAllProducts() {
        const sb = this.ensureSupabase();
        if (sb) {
            const { data, error } = await sb.from('products').select('*').order('category').order('name_en');
            if (error) throw error;
            return data || [];
        }
        return MOCK_PRODUCTS;
    }

    async createProduct(productData: any) {
        const sb = this.ensureSupabase();
        if (!sb) throw new Error('Database connection not available.');
        const { data, error } = await sb.from('products').insert(productData).select().single();
        if (error) throw error;
        return data;
    }

    async updateProduct(id: number, productData: any) {
        const sb = this.ensureSupabase();
        if (!sb) throw new Error('Database connection not available.');
        const { data, error } = await sb.from('products').update(productData).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    async deleteProduct(id: number) {
        const sb = this.ensureSupabase();
        if (!sb) throw new Error('Database connection not available.');
        const { error } = await sb.from('products').update({ is_active: false }).eq('id', id);
        if (error) throw error;
    }
}
