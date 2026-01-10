import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Cake, Coffee, Cookie, Search, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-black text-white selection:bg-[#C6A649]/30">
      <Navbar />
      <main className="pt-48 pb-32 relative overflow-hidden">
        {/* Background Glows - Cyber Premium Style */}
        <div className="absolute top-0 left-0 w-full h-[1000px] bg-gradient-to-b from-[#C6A649]/10 to-transparent pointer-events-none" />
        <div className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] bg-[#C6A649]/10 rounded-full blur-[150px] pointer-events-none opacity-50" />
        <div className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[130px] pointer-events-none opacity-40" />
        <div className="absolute bottom-[20%] -left-[15%] w-[700px] h-[700px] bg-[#C6A649]/5 rounded-full blur-[180px] pointer-events-none opacity-30" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-20 text-center">
            <span className="inline-block px-4 py-1 rounded-full border border-[#C6A649]/30 bg-[#C6A649]/10 text-[#C6A649] text-sm font-bold tracking-[0.2em] uppercase mb-8 animate-fade-in shadow-[0_0_20px_rgba(198,166,73,0.15)]">
              {t('Nuestros Sabores', 'Our Flavors')}
            </span>
            <h1 className="mb-8 font-display text-6xl md:text-8xl font-black tracking-tight animate-fade-in uppercase">
              {t('El', 'The')} <span className="text-[#C6A649] drop-shadow-[0_0_15px_rgba(198,166,73,0.3)]">{t('Menú', 'Menu')}</span>
            </h1>
            <div className="mx-auto mb-10 h-1.5 w-40 rounded-full bg-gradient-to-r from-transparent via-[#C6A649] to-transparent shadow-[0_0_10px_rgba(198,166,73,0.5)]" />
            <p className="mx-auto max-w-2xl font-sans text-xl text-gray-400 font-light leading-relaxed animate-fade-in animation-delay-300">
              {t('Deliciosos sabores tradicionales. Hechos con amor y los mejores ingredientes.', 'Delicious traditional flavors. Made with love and the finest ingredients.')}
            </p>
          </div>

          <div className="mb-20 space-y-6 max-w-4xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-[#C6A649] group-focus-within:text-white transition-colors" />
              <Input
                type="text"
                placeholder={t('Buscar en el menú...', 'Search menu...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-16 pl-14 rounded-full bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#C6A649]/50 focus:ring-[#C6A649]/20 transition-all text-lg backdrop-blur-sm"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                onClick={() => handleCategoryChange(null)}
                className={`rounded-full px-8 py-6 text-base font-bold transition-all ${selectedCategory === null ? 'bg-[#C6A649] text-black shadow-[0_0_20px_rgba(198,166,73,0.4)]' : 'bg-white/5 border-white/10 text-white hover:border-[#C6A649] hover:text-[#C6A649]'}`}
              >
                {t('Todos', 'All')}
              </Button>
              {menuCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`rounded-full px-8 py-6 text-base font-bold transition-all ${selectedCategory === category.id ? 'bg-[#C6A649] text-black shadow-[0_0_20px_rgba(198,166,73,0.4)]' : 'bg-white/5 border-white/10 text-white hover:border-[#C6A649] hover:text-[#C6A649]'}`}
                >
                  {t(category.titleES, category.titleEN)}
                </Button>
              ))}
            </div>
          </div>

          {/* Static Menu Sections - Cyber Premium Redesign */}
          <div className="space-y-40 mb-40">

            {/* Celebration & Wedding Cakes */}
            <section className="grid md:grid-cols-2 gap-16 items-center relative">
              <div className="order-2 md:order-1 space-y-8 animate-fade-in">
                <div className="flex items-center gap-6 mb-4">
                  <div className="p-4 rounded-2xl bg-[#C6A649]/10 text-[#C6A649] border border-[#C6A649]/20 shadow-lg">
                    <Cake className="w-10 h-10" />
                  </div>
                  <h2 className="font-display text-4xl md:text-5xl font-black text-white-900 tracking-tight leading-none">
                    {t('Pasteles de', 'Pasteles de')} <br />
                    <span className="text-[#C6A649]">{t('Celebración y Bodas', 'Celebration & Wedding Cakes')}</span>
                  </h2>
                </div>

                <p className="text-xl text-gray-400 font-light leading-relaxed">
                  {t(
                    'Nos especializamos en pasteles personalizados con decoraciones elaboradas, flores frescas y un toque auténtico mexicano. Perfecto para bodas, quinceañeras y todas las ocasiones especiales.',
                    'We specialize in custom celebration cakes with elaborate decorations, fresh flowers, and authentic Mexican flair. Perfect for weddings, quinceañeras, birthdays, and all special occasions.'
                  )}
                </p>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 md:p-12 shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-20 -top-20 h-64 w-64 bg-[#C6A649]/5 rounded-full blur-3xl group-hover:bg-[#C6A649]/10 transition-colors" />

                  <h3 className="font-display text-2xl font-black text-[#C6A649] mb-8 uppercase tracking-widest">
                    {t('Diseño Personalizado', 'Custom Design Cakes')}
                  </h3>
                  <ul className="space-y-4 mb-10">
                    {[
                      ['Flores frescas decorativas', 'Fresh floral decorations'],
                      ['Estilo auténtico mexicano', 'Colorful Mexican-inspired designs'],
                      ['Temas y mensajes únicos', 'Custom messages and themes'],
                      ['Fruta fresca de temporada', 'Fresh fruit toppings'],
                      ['Acentos en oro comestible', 'Elegant gold accents']
                    ].map(([es, en], i) => (
                      <li key={i} className="flex items-center gap-4 text-gray-300 text-lg">
                        <div className="h-2 w-2 rounded-full bg-[#C6A649] shadow-[0_0_8px_rgba(198,166,73,0.8)]" />
                        <span>{t(es, en)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap items-center gap-8 mt-10">
                    <Button className="bg-[#C6A649] text-black font-black hover:bg-white hover:scale-105 transition-all text-xl px-12 h-16 rounded-full shadow-[0_0_30px_rgba(198,166,73,0.3)] shadow-glow">
                      {t('Cotizar Ahora', 'Get a Quote')}
                    </Button>
                    <p className="text-sm text-gray-500 italic font-medium">
                      * {t('Requiere pedido anticipado', 'Pre-order recommended')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="order-1 md:order-2 relative group-perspective scale-95 hover:scale-100 transition-transform duration-700">
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#C6A649]/30 to-transparent blur-2xl rounded-[3rem] opacity-30 group-hover:opacity-60 transition-opacity duration-700" />
                <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 rotate-2 group-hover:rotate-0 transition-transform duration-700">
                  <LazyImage
                    src="/images/menu/wedding_cake_display_1768064340098.png"
                    alt="Wedding Cake"
                    className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-10 left-10 right-10">
                    <p className="text-white font-serif text-2xl italic leading-tight">
                      {t('"La pieza central de tu gran día"', '"The centerpiece of your big day"')}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Traditional Pan Dulce */}
            <section className="grid md:grid-cols-2 gap-20 items-center">
              <div className="order-1 relative group hover:-rotate-1 transition-transform duration-700">
                <div className="absolute -inset-4 bg-gradient-to-br from-amber-500/20 to-transparent blur-2xl rounded-[3rem] opacity-30" />
                <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
                  <LazyImage
                    src="/images/menu/pan_dulce_basket_1768064358293.png"
                    alt="Pan Dulce Basket"
                    className="w-full h-full object-cover transform transition duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              </div>

              <div className="order-2 space-y-10">
                <div className="flex items-center gap-6">
                  <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Cookie className="w-10 h-10" />
                  </div>
                  <h2 className="font-display text-4xl md:text-5xl font-black text-white tracking-tight leading-none uppercase">
                    {t('Pan Dulce', 'Traditional')} <br />
                    <span className="text-amber-500">{t('Tradicional', 'Pan Dulce')}</span>
                  </h2>
                </div>

                <p className="text-xl text-gray-400 font-light leading-relaxed">
                  {t('Horneado fresco todos los días usando recetas tradicionales mexicanas transmitidas por generaciones.', 'Fresh baked daily using traditional Mexican recipes passed down through generations.')}
                </p>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-[#C6A649]/50 transition-all duration-500 group/card">
                    <div className="mb-4 text-amber-500 font-black text-sm uppercase tracking-widest">{t('El Favorito', 'The Favorite')}</div>
                    <h4 className="font-display text-2xl font-black text-white mb-3">{t('Conchas', 'Conchas')}</h4>
                    <p className="text-gray-400 leading-relaxed mb-6 group-hover/card:text-gray-200 transition-colors">
                      {t('Nuestro pan dulce insignia con cubierta clásica de azúcar en patrones de concha.', 'Our signature sweet bread with classic shell-patterned sugar topping.')}
                    </p>
                    <div className="flex gap-3">
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-400">Chocolate</span>
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-400">Vainilla</span>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-[#C6A649]/50 transition-all duration-500 group/card">
                    <div className="mb-4 text-[#C6A649] font-black text-sm uppercase tracking-widest">{t('Surtido Diario', 'Daily Variety')}</div>
                    <h4 className="font-display text-2xl font-black text-white mb-3">{t('Pan Variado', 'Assorted Bread')}</h4>
                    <p className="text-gray-400 leading-relaxed mb-6 group-hover/card:text-gray-200 transition-colors">
                      {t('Una selección que cambia diariamente para sorprender tu paladar cada mañana.', 'A daily changing variety to surprise your palate every single morning.')}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-400">Donas</span>
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-400">Orejas</span>
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-400">Cuernitos</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-6 bg-[#C6A649]/5 border border-[#C6A649]/20 rounded-2xl shadow-inner">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C6A649]/20 text-[#C6A649]">
                    <Search className="h-5 w-5" />
                  </div>
                  <p className="text-lg font-bold text-[#C6A649]">
                    {t('Te esperamos hoy para la selección más fresca', 'Visit us today for the freshest daily selection')}
                  </p>
                </div>
              </div>
            </section>

            {/* Dessert Services & Events - Redesigned for Impact */}
            <section className="relative rounded-[3rem] overflow-hidden shadow-[0_0_60px_rgba(198,166,73,0.15)] group border border-white/10 w-full bg-stone-900">
              <div className="absolute inset-0">
                <img
                  src="/images/menu/dessert_table_spread_1768064377177.png"
                  alt="Dessert Table"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                {/* Refined gradient overlay for better contrast and depth */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30 md:bg-gradient-to-r" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-700" />
              </div>

              <div className="relative z-10 py-20 px-6 md:px-12 lg:px-20 text-left md:text-center max-w-5xl mx-auto space-y-8">
                <div className="inline-flex p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 mb-2 shadow-2xl">
                  <Coffee className="w-10 h-10 text-[#C6A649]" />
                </div>
                <h2 className="font-display text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                  {t('Mesas de Postres', 'Dessert Services')} <br />
                  <span className="text-[#C6A649]">& {t('Eventos', 'Events')}</span>
                </h2>
                <p className="text-xl text-gray-200 font-light leading-relaxed max-w-3xl mx-auto drop-shadow-md">
                  {t(
                    'Creamos experiencias dulces e inolvidables. Desde mesas de postres coordinadas hasta banquetes personalizados, elevamos tu evento con el auténtico sabor de Eli\'s.',
                    'We create sweet and unforgettable experiences. From coordinated dessert tables to custom catering, we elevate your event with the authentic taste of Eli\'s.'
                  )}
                </p>

                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  {['Weddings', 'Quinceañeras', 'Corporate', 'Birthdays'].map((tag) => (
                    <span key={tag} className="px-5 py-2 rounded-full bg-black/40 border border-white/10 text-white font-bold text-xs uppercase tracking-widest backdrop-blur-md">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-8">
                  <Button size="lg" className="h-16 px-12 rounded-full bg-white text-black font-black text-lg hover:bg-[#C6A649] hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]" asChild>
                    <a href="tel:+16102796200">
                      {t('Solicitar Cotización', 'Book Your Event')}
                    </a>
                  </Button>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-32">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-24 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-[#C6A649]" />
                <p className="text-[#C6A649] font-bold animate-pulse">{t('Cargando sabiendo...', 'Loading sweetness...')}</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-gray-400 text-2xl font-light">{t('No se encontraron productos coincidentes', 'No matching products found')}</p>
              </div>
            ) : (
              filteredCategories.map((category, idx) => {
                const Icon = category.icon;
                return (
                  <div key={idx} className="animate-fade-in group/section">
                    <div className="mb-14 flex items-center gap-8">
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-[#C6A649]/10 text-[#C6A649] border border-[#C6A649]/20 shadow-2xl group-hover/section:scale-110 transition-transform duration-500">
                        <div className="absolute inset-0 bg-[#C6A649] blur-xl opacity-20 rounded-full" />
                        <Icon className="h-10 w-10 relative z-10" />
                      </div>
                      <h2 className="font-display text-5xl md:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-sm">{t(category.titleES, category.titleEN)}</h2>
                      <div className="flex-1 h-[2px] bg-gradient-to-r from-[#C6A649]/30 via-white/5 to-transparent ml-8 hidden md:block" />
                    </div>
                    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                      {category.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex flex-col">
                          <div className="group/item relative rounded-[2.5rem] border border-white/5 bg-white/[0.03] overflow-hidden transition-all duration-700 hover:-translate-y-4 hover:border-[#C6A649]/40 hover:bg-white/[0.08] hover:shadow-[0_40px_80px_rgba(0,0,0,0.6)] backdrop-blur-md">
                            <div className="relative aspect-[16/11] overflow-hidden">
                              <LazyImage
                                src={item.image_url || '/placeholder.svg'}
                                alt={t(item.name_es, item.name_en)}
                                className="h-full w-full object-cover transition-transform duration-1000 group-hover/item:scale-110"
                                effect="blur"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                              <div className="absolute bottom-6 right-6">
                                <span className="inline-flex px-5 py-2.5 rounded-2xl bg-black/70 backdrop-blur-xl border border-[#C6A649]/30 font-display text-2xl font-black text-[#C6A649] shadow-[0_0_20px_rgba(198,166,73,0.3)]">
                                  ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                                </span>
                              </div>
                            </div>
                            <div className="p-10">
                              <h3 className="font-display text-2xl font-black text-white mb-4 transition-colors group-hover/item:text-[#C6A649] uppercase tracking-tight">{t(item.name_es, item.name_en)}</h3>
                              {(item.description_es || item.description_en) && (
                                <p className="font-sans text-lg text-gray-400 leading-relaxed font-light line-clamp-3 group-hover/item:text-gray-200 transition-colors">
                                  {t(item.description_es, item.description_en)}
                                </p>
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

          {/* Special Order CTA */}
          <div className="mt-40 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#C6A649]/20 via-[#C6A649]/5 to-[#C6A649]/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
            <div className="relative rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-3xl p-16 md:p-24 text-center overflow-hidden">
              <div className="absolute -left-20 -bottom-20 h-80 w-80 bg-[#C6A649]/5 rounded-full blur-[100px]" />

              <h3 className="relative z-10 mb-6 font-display text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                {t('¿Buscas algo', 'Looking for something')} <br />
                <span className="text-[#C6A649]">{t('único y especial?', 'Unique & Special?')}</span>
              </h3>
              <p className="relative z-10 mb-12 font-sans text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                {t('Estamos aquí para hacer realidad tus sueños más dulces. Contáctanos para pedidos personalizados a gran escala.', 'We\'re here to bring your sweetest dreams to life. Contact us for large-scale custom orders.')}
              </p>

              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-8">
                <a href="tel:+16102796200" className="flex items-center gap-4 px-10 py-5 rounded-full bg-[#C6A649] text-black font-black text-xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_30px_rgba(198,166,73,0.3)]">
                  <div className="p-2 rounded-full bg-black/5">
                    <Coffee className="w-6 h-6" />
                  </div>
                  (610) 279-6200
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Menu;
