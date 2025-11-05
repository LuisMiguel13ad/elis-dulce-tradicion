import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Cake, Coffee, Cookie, Sandwich } from 'lucide-react';

const Menu = () => {
  const { t } = useLanguage();

  const menuCategories = [
    {
      icon: Cake,
      titleES: 'Pasteles',
      titleEN: 'Cakes',
      items: [
        { nameES: 'Pastel de Tres Leches', nameEN: 'Tres Leches Cake', price: '$25.00' },
        { nameES: 'Pastel de Chocolate', nameEN: 'Chocolate Cake', price: '$28.00' },
        { nameES: 'Pastel de Fresa', nameEN: 'Strawberry Cake', price: '$26.00' },
        { nameES: 'Pastel de Vainilla', nameEN: 'Vanilla Cake', price: '$24.00' },
        { nameES: 'Pastel de Zanahoria', nameEN: 'Carrot Cake', price: '$27.00' },
        { nameES: 'Pastel de Red Velvet', nameEN: 'Red Velvet Cake', price: '$30.00' },
        { nameES: 'Pastel de Oreo', nameEN: 'Oreo Cake', price: '$29.00' },
        { nameES: 'Pastel Personalizado', nameEN: 'Custom Cake', price: 'Desde $35.00' },
      ],
    },
    {
      icon: Cookie,
      titleES: 'Postres y Dulces',
      titleEN: 'Desserts & Sweets',
      items: [
        { nameES: 'Flan', nameEN: 'Flan', price: '$4.50' },
        { nameES: 'Arroz con Leche', nameEN: 'Rice Pudding', price: '$5.00' },
        { nameES: 'Tres Leches Individual', nameEN: 'Individual Tres Leches', price: '$5.50' },
        { nameES: 'Churros', nameEN: 'Churros', price: '$3.50' },
        { nameES: 'Empanadas de Manzana', nameEN: 'Apple Empanadas', price: '$4.00' },
        { nameES: 'Galletas Decoradas', nameEN: 'Decorated Cookies', price: '$2.50' },
        { nameES: 'Cupcakes', nameEN: 'Cupcakes', price: '$3.00' },
        { nameES: 'Brownies', nameEN: 'Brownies', price: '$4.00' },
      ],
    },
    {
      icon: Sandwich,
      titleES: 'Pan Dulce',
      titleEN: 'Sweet Bread',
      items: [
        { nameES: 'Conchas', nameEN: 'Conchas', price: '$2.00' },
        { nameES: 'Pan de Muerto', nameEN: 'Pan de Muerto', price: '$3.50' },
        { nameES: 'Oreja', nameEN: 'Oreja', price: '$2.50' },
        { nameES: 'Cuernito', nameEN: 'Croissant', price: '$2.50' },
        { nameES: 'Dona', nameEN: 'Donut', price: '$2.00' },
        { nameES: 'Polvorón', nameEN: 'Polvorón', price: '$1.50' },
        { nameES: 'Biscocho', nameEN: 'Biscocho', price: '$2.00' },
        { nameES: 'Bollo', nameEN: 'Bollo', price: '$2.50' },
      ],
    },
    {
      icon: Coffee,
      titleES: 'Bebidas',
      titleEN: 'Beverages',
      items: [
        { nameES: 'Café Americano', nameEN: 'Americano Coffee', price: '$3.50' },
        { nameES: 'Café Latte', nameEN: 'Cafe Latte', price: '$4.50' },
        { nameES: 'Cappuccino', nameEN: 'Cappuccino', price: '$4.50' },
        { nameES: 'Café de Olla', nameEN: 'Traditional Coffee', price: '$4.00' },
        { nameES: 'Chocolate Caliente', nameEN: 'Hot Chocolate', price: '$4.00' },
        { nameES: 'Agua de Horchata', nameEN: 'Horchata', price: '$3.50' },
        { nameES: 'Agua de Jamaica', nameEN: 'Hibiscus Water', price: '$3.50' },
        { nameES: 'Refresco', nameEN: 'Soda', price: '$2.50' },
      ],
    },
  ];

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
              {t(
                'Deliciosos sabores tradicionales. Hechos con amor y los mejores ingredientes.',
                'Delicious traditional flavors. Made with love and the finest ingredients.'
              )}
            </p>
          </div>

          <div className="space-y-16">
            {menuCategories.map((category, idx) => {
              const Icon = category.icon;
              return (
                <div key={idx} className="animate-fade-in">
                  <div className="mb-8 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-glow">
                      <Icon className="h-6 w-6 text-secondary" />
                    </div>
                    <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                      {t(category.titleES, category.titleEN)}
                    </h2>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {category.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="group rounded-xl border border-border bg-card p-6 shadow-card transition-smooth hover:scale-105 hover:border-primary/50 hover:shadow-elegant"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="mb-2 font-sans text-lg font-bold text-foreground">
                              {t(item.nameES, item.nameEN)}
                            </h3>
                          </div>
                          <span className="font-display text-xl font-bold text-primary">
                            {item.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-accent/10 p-8 text-center shadow-elegant">
            <h3 className="mb-4 font-display text-2xl font-bold text-foreground md:text-3xl">
              {t('¿Buscas algo especial?', 'Looking for something special?')}
            </h3>
            <p className="mb-6 font-sans text-lg text-muted-foreground">
              {t(
                'Contáctanos para consultas sobre productos personalizados o pedidos grandes.',
                'Contact us for inquiries about custom products or large orders.'
              )}
            </p>
            <p className="font-sans text-xl font-bold text-primary">📱 610-910-9067</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Menu;

