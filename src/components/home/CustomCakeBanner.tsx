import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

// Import cake images
import carCake from '@/assets/CarBirthdayCake.jpg';
import weddingCake from '@/assets/weddingCake.jpg';
import pawPatrolCake from '@/assets/PawPatrolBirthdayCake.jpg';
import quinceCake from '@/assets/6.png';

const CustomCakeBanner = () => {
    const { t } = useLanguage();

    return (
        <section className="w-full py-8 md:py-12">
            <div className="container mx-auto px-4">
                <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-r from-[#b88746] via-[#d4a55d] to-[#fdfbf7] shadow-xl">
                    <div className="flex flex-col items-center gap-8 p-8 md:flex-row md:justify-between md:p-12">

                        {/* Text Content */}
                        <div className="z-10 flex max-w-xl flex-col items-center text-center md:items-start md:text-left">
                            <h2 className="mb-4 font-display text-4xl font-bold text-white shadow-sm md:text-5xl lg:text-6xl text-shadow-sm">
                                {t('Diseña tu Pastel Soñado', 'Customize Your Dream Cake')}
                            </h2>
                            <p className="mb-8 font-sans text-lg text-white/95 md:text-xl font-medium shadow-sm text-shadow-sm">
                                {t(
                                    'Pide en línea hoy, entregado en tu ciudad mañana.',
                                    'Order online today, delivered in your town tomorrow.'
                                )}
                            </p>
                            <Link to="/order">
                                <Button
                                    size="lg"
                                    className="bg-white text-[#b88746] hover:bg-white/90 font-bold border-2 border-transparent hover:border-[#b88746]/20 shadow-lg text-lg px-8 h-12"
                                >
                                    {t('Comenzar Pedido', 'Start Custom Order')}
                                </Button>
                            </Link>
                        </div>

                        {/* Images Composition */}
                        <div className="relative h-[300px] w-full max-w-lg md:h-[400px]">
                            {/* Wedding Cake - Center Back */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 transform transition-transform hover:scale-105 z-10 w-32 md:w-48">
                                <img
                                    src={weddingCake}
                                    alt="Wedding Cake"
                                    className="h-auto w-full rounded-lg object-cover shadow-2xl border-2 border-white/50"
                                />
                            </div>

                            {/* Quince Cake - Left Middle */}
                            <div className="absolute top-16 left-0 transform transition-transform hover:scale-105 z-20 w-36 md:w-52">
                                <img
                                    src={quinceCake}
                                    alt="Quinceañera Cake"
                                    className="h-auto w-full rounded-lg object-cover shadow-2xl border-2 border-white/50"
                                />
                            </div>

                            {/* Paw Patrol - Right Middle */}
                            <div className="absolute top-20 right-0 transform transition-transform hover:scale-105 z-20 w-32 md:w-44">
                                <img
                                    src={pawPatrolCake}
                                    alt="Paw Patrol Cake"
                                    className="h-auto w-full rounded-lg object-cover shadow-2xl border-2 border-white/50"
                                />
                            </div>

                            {/* Car Cake - Bottom Center */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 transform translate-y-4 transition-transform hover:scale-105 z-30 w-40 md:w-52">
                                <img
                                    src={carCake}
                                    alt="Birthday Cake"
                                    className="h-auto w-full rounded-lg object-cover shadow-2xl border-2 border-white/50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Decorative Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-transparent pointer-events-none"></div>
                </div>
            </div>
        </section>
    );
};

export default CustomCakeBanner;
