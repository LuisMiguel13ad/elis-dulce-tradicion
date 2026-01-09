import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { memo, useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

// Assets
import butterflyCake from '@/assets/ButterflyBirthdayCake.jpg';
import tresLeches from '@/assets/11_clwIuFthmR97VRfB6a4XDD_1767033461258_na1fn_L2hvbWUvdWJ1bnR1L2VsaXNfYmFrZXJ5X2ZpbmFsL2Nha2VzL2VuaGFuY2VkX2Nha2VfMTRfYXV0dW1uX3RoZW1lZF9mcnVpdF9jYWtl.png';
import chocolateCake from '@/assets/27_ovrAfSWf6FuOPKizfEcKWJ_1767033568983_na1fn_L2hvbWUvdWJ1bnR1L2VsaXNfYmFrZXJ5X2ZpbmFsL2Nha2VzL2Nha2VfMzBfcHVycGxlX2hlYXJ0X3J1ZmZsZV9jYWtlX2VuaGFuY2Vk.png';
import weddingCake from '@/assets/weddingCake.jpg';

import pawPatrol from '@/assets/PawPatrolBirthdayCake.jpg';
import realMadrid from '@/assets/RealMadridBirthdayCake.jpg';
import floralWedding from '@/assets/1_BGiTNyKst9wwImFKyXiOLl_1767033404784_na1fn_L2hvbWUvdWJ1bnR1L2VsaXNfYmFrZXJ5X2ZpbmFsL2Nha2VzL2Nha2VfMDJfZmxvcmFsX2FyY2hfd2VkZGluZ19jYWtlX2VuaGFuY2Vk.png';
import babyShower from '@/assets/15_zJnTTxgTjlNItc1cBnfXRN_1767033469326_na1fn_L2hvbWUvdWJ1bnR1L2VuaGFuY2VkX2Nha2VzL2Nha2VfMThfb2hfYmFieV9zaG93ZXJfY2FrZV9jbG91ZHNfbW9vbl9lbmhhbmNlZA.png';

const CakeSection = memo(() => {
    const { t } = useLanguage();

    const cakes = [
        {
            id: 1,
            title: 'DESIGN YOUR OWN CAKE',
            price: 'FROM $45.00',
            image: butterflyCake,
            bgColor: '#FFEDF4', // Pinkish
        },
        {
            id: 2,
            title: 'CLASSIC TRES LECHES CAKE',
            price: 'FROM $35.00',
            image: tresLeches,
            bgColor: '#FDF5E6', // Beige
        },
        {
            id: 3,
            title: 'CHOCOLATE FIESTA CAKE',
            price: 'FROM $40.00',
            image: chocolateCake,
            bgColor: '#E6E6FA', // Lavender
        },
        {
            id: 4,
            title: 'WEDDING CAKE - CUSTOM DESIGN',
            price: 'FROM $150.00',
            image: weddingCake,
            bgColor: '#E0FFFF', // Light Cyan
        },
        {
            id: 5,
            title: 'KIDS THEMED CAKES',
            price: 'FROM $55.00',
            image: pawPatrol,
            bgColor: '#E6F3FF', // Light Blue
        },
        {
            id: 6,
            title: 'SPORTS FAN CAKES',
            price: 'FROM $50.00',
            image: realMadrid,
            bgColor: '#F5F5F5', // Light Gray
        },
        {
            id: 7,
            title: 'ELEGANT FLORAL CAKES',
            price: 'FROM $120.00',
            image: floralWedding,
            bgColor: '#FFF0F0', // Very light pink
        },
        {
            id: 8,
            title: 'BABY SHOWER SPECIALS',
            price: 'FROM $65.00',
            image: babyShower,
            bgColor: '#FFFFE0', // Light Yellow
        },
    ];

    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 4;
    const totalPages = Math.ceil(cakes.length / itemsPerPage);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentPage((prev) => (prev + 1) % totalPages);
        }, 5000);
        return () => clearInterval(interval);
    }, [totalPages]);

    const handleDotClick = (index: number) => {
        setCurrentPage(index);
    };

    const displayedCakes = cakes.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* Section Header */}
                <div className="mb-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 tracking-tight">
                        ELI'S <span className="text-[#C6A649]">CAKES</span>
                    </h2>
                    <div className="h-1 w-20 bg-[#C6A649] mx-auto rounded-full"></div>
                    <p className="mt-4 text-gray-500 font-medium tracking-wide text-sm uppercase">
                        Celebration Centerpieces
                    </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {displayedCakes.map((cake) => (
                        <div key={cake.id} className="flex flex-col group cursor-pointer animate-in fade-in duration-500">
                            {/* Card Image Area */}
                            <div
                                className="relative rounded-md overflow-hidden aspect-square shadow-sm transition-transform duration-300 group-hover:-translate-y-1"
                                style={{ backgroundColor: cake.bgColor }}
                            >
                                {/* Tag */}
                                <div className="absolute top-0 left-0 bg-[#C6A649] text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-wider z-10">
                                    Norristown Delivery
                                </div>

                                {/* Heart Icon */}
                                <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-1.5 rounded-full z-10 hover:bg-white transition-colors">
                                    <Heart className="w-4 h-4 text-[#C6A649]" />
                                </div>

                                {/* Image */}
                                <div className="w-full h-full p-8 flex items-center justify-center">
                                    <img
                                        src={cake.image}
                                        alt={cake.title}
                                        className="w-full h-full object-contain filter drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="mt-6 text-center">
                                <h3 className="font-black text-sm md:text-base text-gray-900 uppercase tracking-wide px-2 leading-tight mb-2">
                                    {cake.title}
                                </h3>
                                <p className="text-xs font-bold text-gray-500 tracking-wider">
                                    {cake.price}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Carousel Indicators */}
                <div className="flex justify-center gap-3 mb-12">
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleDotClick(index)}
                            className={`w-3 h-3 rounded-full transition-colors duration-300 ${currentPage === index ? 'bg-amber-400' : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                            aria-label={`Go to page ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Description & CTA */}
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <p className="text-gray-600 font-medium leading-relaxed md:text-lg">
                        Great Celebration Cakes are the heart of Eli’s Bakery Cafe. Freshly baked and expertly decorated with authentic Mexican flair. The centerpiece for your birthday party, quinceañera, wedding, or special occasion. Whether you’re looking for a show-stopping Multi-Tiered Cake, Classic Tres Leches, or maybe you’d like to Design Your Own Cake, we’ve got you covered!
                    </p>

                    <Button
                        asChild
                        size="lg"
                        className="rounded-full bg-[#C6A649] hover:bg-[#B5953F] text-white px-10 py-7 font-black text-sm tracking-widest shadow-xl shadow-amber-900/10 transition-transform hover:scale-105"
                    >
                        <Link to="/order">
                            FIND YOUR PERFECT CAKE <span className="ml-2 text-lg">🎂</span>
                        </Link>
                    </Button>
                </div>

            </div>
        </section>
    );
});

CakeSection.displayName = 'CakeSection';

export default CakeSection;
