import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { memo } from 'react';
import { Heart, ChevronRight } from 'lucide-react';
import sprite from '@/assets/featured-sprite.png';

const FeaturedProducts = memo(() => {
  const { t } = useLanguage();

  const products = [
    {
      id: 1,
      title: '6 X CONCHAS, THE CLASSICS',
      price: 'FROM $18.00',
      bgPosition: '0% 0%',
    },
    {
      id: 2,
      title: '12 X PAN DULCE, THE ULTIMATE FAVORITES',
      price: 'FROM $32.00',
      bgPosition: '33.35% 0%',
    },
    {
      id: 3,
      title: '6 X SPECIALTY PASTRIES, THE CELEBRATION BOX',
      price: 'FROM $24.00',
      bgPosition: '66.65% 0%',
    },
    {
      id: 4,
      title: '18 X PAN DULCE, THE FAMILY BOX',
      price: 'FROM $45.00',
      bgPosition: '100% 0%',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 tracking-tight">
            ELI'S <span className="text-[#C6A649]">PAN DULCE</span>
          </h2>
          <div className="h-1 w-20 bg-[#C6A649] mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-500 font-medium tracking-wide text-sm uppercase">
            Freshly Baked Every Morning
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col group cursor-pointer">
              {/* Card Image Area (Sprite) */}
              <div className="relative rounded-md overflow-hidden shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
                {/* 
                  Sprite Implementation:
                  - The image contains 4 boxes with margin/padding and text below.
                  - We want to show just the box part.
                  - We use a predetermined aspect ratio that likely cuts off the text at the bottom.
                */}
                <div
                  className="w-full aspect-square bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${sprite})`,
                    backgroundSize: '400% auto', // 4 images width
                    backgroundPosition: product.bgPosition,
                  }}
                />
              </div>

              {/* Product Info */}
              <div className="mt-6 text-center">
                <h3 className="font-black text-sm md:text-base text-gray-900 uppercase tracking-wide px-2 leading-tight mb-2">
                  {product.title}
                </h3>
                <p className="text-xs font-bold text-gray-500 tracking-wider">
                  {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Indicators (Mock visual) */}
        <div className="flex justify-center gap-3 mb-12">
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
        </div>

        {/* Description & CTA */}
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <p className="text-gray-600 font-medium leading-relaxed md:text-lg">
            Eli’s Bakery Cafe Pan Dulce are kind of a big deal – we took inspiration from the traditional Mexican sweet breads we love to create the ultimate Pan Dulce experience. Fresh, authentic, and made with the finest ingredients. Our Pan Dulce are available for next day pickup or delivery. Try a mixed box, or check out one of our signature flavors such as Conchas or Orejas.
          </p>

          <Button
            asChild
            size="lg"
            className="rounded-full bg-[#C6A649] hover:bg-[#B5953F] text-white px-10 py-7 font-black text-sm tracking-widest shadow-xl shadow-amber-900/10 transition-transform hover:scale-105"
          >
            <Link to="/order">
              NEXT DAY FRESH PAN DULCE <img src="https://em-content.zobj.net/source/apple/391/croissant_1f950.png" alt="croissant" className="w-5 h-5 ml-2 inline-block filter brightness-0 invert" />
            </Link>
          </Button>
        </div>

      </div>
    </section>
  );
});

FeaturedProducts.displayName = 'FeaturedProducts';

export default FeaturedProducts;
