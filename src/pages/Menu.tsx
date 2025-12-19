import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Cake, Coffee, Cookie, Search } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { useProducts } from '@/lib/queries/products';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { LazyImage } from '@/components/optimized/LazyImage';

type MenuProduct = { id?: number; name_es: string; name_en: string; description_es: string; description_en: string; price: number | string; category?: string; image_url?: string; };

const groupProductsByCategory = (products: MenuProduct[]) => {
  const grouped: Record<string, MenuProduct[]> = {};
  products.forEach(product => {
    const cat = product.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(product);
  });
  return Object.keys(grouped).map(catId => ({
    id: catId,
    icon: catId === 'cakes' ? Cake : (catId === 'bread' ? Cookie : Coffee),
    titleES: catId === 'cakes' ? 'Pasteles' : (catId === 'bread' ? 'Pan Dulce' : 'Otros'),
    titleEN: catId === 'cakes' ? 'Cakes' : (catId === 'bread' ? 'Sweet Bread' : 'Other'),
    items: grouped[catId]
  }));
};

const Menu = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Debounce search query to avoid excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Use React Query for products (cached, long stale time)
  const { data: products = [], isLoading } = useProducts();
  
  // Memoize grouped categories
  const menuCategories = useMemo(() => {
    return groupProductsByCategory(products);
  }, [products]);

  // Memoize filtered categories with debounced search
  const filteredCategories = useMemo(() => {
    return menuCategories.map(category => ({
      ...category,
      items: category.items.filter((item: MenuProduct) => {
        const matchesSearch = debouncedSearchQuery === '' || 
          t(item.name_es, item.name_en).toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          t(item.description_es, item.description_en).toLowerCase().includes(debouncedSearchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || category.id === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    })).filter(category => category.items.length > 0);
  }, [debouncedSearchQuery, selectedCategory, t, menuCategories]);

  // Memoize category change handler
  const handleCategoryChange = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h1 className="mb-4 font-display text-4xl font-bold text-gradient-gold md:text-5xl lg:text-6xl">
              {t('Menú', 'Menu')}
            </h1>
            <div className="mx-auto mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent" />
            <p className="mx-auto max-w-2xl font-sans text-lg text-muted-foreground md:text-xl">
              {t('Deliciosos sabores tradicionales. Hechos con amor y los mejores ingredientes.', 'Delicious traditional flavors. Made with love and the finest ingredients.')}
            </p>
          </div>
          <div className="mb-12 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input type="text" placeholder={t('Buscar en el menú...', 'Search menu...')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant={selectedCategory === null ? 'default' : 'outline'} onClick={() => handleCategoryChange(null)} size="sm">{t('Todos', 'All')}</Button>
              {menuCategories.map((category) => (
                <Button key={category.id} variant={selectedCategory === category.id ? 'default' : 'outline'} onClick={() => handleCategoryChange(category.id)} size="sm">{t(category.titleES, category.titleEN)}</Button>
              ))}
            </div>
          </div>
          <div className="space-y-16">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12"><p className="text-muted-foreground text-lg">{t('No se encontraron productos', 'No products found')}</p></div>
            ) : (
              filteredCategories.map((category, idx) => {
                const Icon = category.icon;
                return (
                  <div key={idx} className="animate-fade-in">
                    <div className="mb-8 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-glow">
                        <Icon className="h-6 w-6 text-secondary" />
                      </div>
                      <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">{t(category.titleES, category.titleEN)}</h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {category.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex flex-col">
                          <div className="group rounded-xl border border-border bg-card overflow-hidden shadow-card transition-smooth hover:scale-105 hover:border-primary/50 hover:shadow-elegant h-full">
                            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                              <LazyImage
                                src={item.image_url || '/placeholder.svg'}
                                alt={t(item.name_es, item.name_en)}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                effect="blur"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="p-6">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <h3 className="font-sans text-lg font-bold text-foreground flex-1">{t(item.name_es, item.name_en)}</h3>
                                <span className="font-display text-xl font-bold text-primary whitespace-nowrap">${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</span>
                              </div>
                              {(item.description_es || item.description_en) && (
                                <p className="font-sans text-sm text-muted-foreground mb-0 line-clamp-2">{t(item.description_es, item.description_en)}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-16 rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-accent/10 p-8 text-center shadow-elegant">
            <h3 className="mb-4 font-display text-2xl font-bold text-foreground md:text-3xl">{t('¿Buscas algo especial?', 'Looking for something special?')}</h3>
            <p className="mb-6 font-sans text-lg text-muted-foreground">{t('Contáctanos para consultas sobre productos personalizados o pedidos grandes.', 'Contact us for inquiries about custom products or large orders.')}</p>
            <p className="font-sans text-xl font-bold text-primary">📱 610-910-9067</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Menu;
