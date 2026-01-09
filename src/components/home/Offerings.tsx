import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Importing assets
import panDulceImg from '@/assets/3.png';
import cakeImg from '@/assets/weddingCake.jpg';
import tamalesImg from '@/assets/4.png';
import breakfastImg from '@/assets/6.png';

export const Offerings = () => {
    const { t } = useLanguage();

    const offerings = [
        {
            id: 1,
            titleES: 'Pan Dulce Tradicional',
            titleEN: 'Traditional Pan Dulce',
            descES: 'Conchas, puerquitos y orejas horneados diariamente.',
            descEN: 'Conchas, puerquitos, and orejas baked fresh daily.',
            image: panDulceImg,
            link: '/menu'
        },
        {
            id: 2,
            titleES: 'Pasteles Especiales',
            titleEN: 'Specialty Cakes',
            descES: 'Diseños personalizados para bodas y cumpleaños.',
            descEN: 'Custom designs for weddings and birthdays.',
            image: cakeImg,
            link: '/order'
        },
        {
            id: 3,
            titleES: 'Tamales Auténticos',
            titleEN: 'Authentic Tamales',
            descES: 'Sabores tradicionales hechos en casa.',
            descEN: 'Traditional homemade flavors.',
            image: tamalesImg,
            link: '/menu'
        },
        {
            id: 4,
            titleES: 'Desayunos',
            titleEN: 'Breakfast',
            descES: 'Empieza tu día con nuestros platillos.',
            descEN: 'Start your day with our delicious dishes.',
            image: breakfastImg,
            link: '/menu'
        }
    ];

    return (
        <div className="py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {offerings.map((item) => (
                    <div
                        key={item.id}
                        className="group relative h-[400px] overflow-hidden rounded-2xl border-2 border-amber-100 bg-white shadow-lg transition-all hover:border-[#C6A649] hover:shadow-xl hover:-translate-y-1"
                    >
                        {/* Image Background */}
                        <div className="absolute inset-0 h-full w-full">
                            <img
                                src={item.image}
                                alt={t(item.titleES, item.titleEN)}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                        </div>

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <h3 className="text-2xl font-bold text-white mb-2 font-display">
                                {t(item.titleES, item.titleEN)}
                            </h3>
                            <p className="text-gray-300 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 transform translate-y-4 group-hover:translate-y-0">
                                {t(item.descES, item.descEN)}
                            </p>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
                                <Button
                                    variant="link"
                                    className="text-[#C6A649] hover:text-[#E5C565] p-0 font-bold tracking-wide uppercase text-xs flex items-center gap-2"
                                    asChild
                                >
                                    <Link to={item.link}>
                                        {t('Ver Más', 'View More')} <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Offerings;
