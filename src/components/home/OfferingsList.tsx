import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight, Croissant, Cake, Utensils, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const OfferingsList = () => {
    const { t } = useLanguage();

    const categories = [
        {
            id: 1,
            titleES: 'Pan Dulce y Repostería',
            titleEN: 'Pastries & Pan Dulce',
            descES: 'Conchas, orejas y galletas horneadas cada mañana.',
            descEN: 'Conchas, ears, and cookies baked fresh every morning.',
            icon: Croissant,
            link: '/menu'
        },
        {
            id: 2,
            titleES: 'Pasteles Personalizados',
            titleEN: 'Custom Cakes',
            descES: 'Para bodas, quinceañeras y toda celebración especial.',
            descEN: 'For weddings, quinceañeras, and every special celebration.',
            icon: Cake,
            link: '/order'
        },
        {
            id: 3,
            titleES: 'Tamales Tradicionales',
            titleEN: 'Traditional Tamales',
            descES: 'Hechos a mano con nuestra receta familiar.',
            descEN: 'Handmade with our authentic family recipe.',
            icon: Utensils,
            link: '/menu'
        },
        {
            id: 4,
            titleES: 'Desayunos Completos',
            titleEN: 'Breakfast Options',
            descES: 'Platillos deliciosos para empezar tu día.',
            descEN: 'Delicious dishes to start your day right.',
            icon: Coffee,
            link: '/menu'
        }
    ];

    return (
        <div className="py-24">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                {/* Left Side: Text Content */}
                <div className="flex flex-col justify-center text-center lg:col-span-5 lg:text-left">
                    <h2 className="font-display text-4xl font-bold text-gradient-gold md:text-5xl">
                        {t("Nuestras Especialidades", "Our Specialties")}
                    </h2>
                    <div className="my-6 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent lg:mx-0 mx-auto" />
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        {t(
                            "Somos una panadería mexicana auténtica que ofrece pan dulce, pasteles, tamales y desayunos. Cada bocado está lleno de tradición y sabor.",
                            "We are an authentic Mexican bakery selling pastries, cakes, and tamales, plus breakfast options. Every bite is filled with tradition and flavor."
                        )}
                    </p>
                    <div className="mt-8">
                        <Button className="bg-primary text-secondary hover:bg-primary/90 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                            <Link to="/menu">
                                {t("Ver Menú Completo", "View Full Menu")}
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Right Side: List Breakdown */}
                <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
                    {categories.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.id}
                                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-elegant"
                            >
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-secondary transition-colors">
                                    <Icon className="h-6 w-6" />
                                </div>

                                <h3 className="mb-2 font-display text-xl font-bold text-foreground">
                                    {t(item.titleES, item.titleEN)}
                                </h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    {t(item.descES, item.descEN)}
                                </p>

                                <div className="flex items-center text-sm font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                                    <Link to={item.link} className="flex items-center gap-2">
                                        {t("Explorar", "Explore")} <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default OfferingsList;
