import { MapPin, Clock, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import storefrontImage from '@/assets/2_M3wfgx3WZRpTbrc5cQDbCM_1767033935219_na1fn_L2hvbWUvdWJ1bnR1L2VsaXNfYmFrZXJ5X2ZpbmFsL2ludGVyaW9yL2ludGVyaW9yXzAxX2Jha2VyeV9zdG9yZWZyb250X2V4dGVyaW9yX2VuaGFuY2Vk.png';

export const VisitUs = () => {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-[#C6A649] mb-4 font-serif italic">
                        Visit Us
                    </h2>
                    <div className="h-1 w-24 bg-gradient-to-r from-[#C6A649] to-amber-300 mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-12 items-stretch">

                    {/* Left Column: Contact Info & Map */}
                    <div className="space-y-6 flex flex-col h-full animate-in slide-in-from-left duration-700">

                        {/* Address Card */}
                        <div className="flex items-start gap-5 p-5 rounded-2xl border border-amber-100 hover:border-[#C6A649]/30 hover:shadow-md transition-all duration-300 group bg-white">
                            <div className="bg-[#FFF0F5] p-3 rounded-full group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                                <MapPin className="w-5 h-5 text-[#C6A649]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1 font-serif">Address</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    324 W Marshall St<br />
                                    Norristown, PA 19401
                                </p>
                                <a
                                    href="https://maps.google.com/?q=324+W+Marshall+St,+Norristown,+PA+19401"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-block mt-1 text-xs text-[#C6A649] font-bold hover:underline"
                                >
                                    Get Directions
                                </a>
                            </div>
                        </div>

                        {/* Hours Card */}
                        <div className="flex items-start gap-5 p-5 rounded-2xl border border-amber-100 hover:border-[#C6A649]/30 hover:shadow-md transition-all duration-300 group bg-white">
                            <div className="bg-[#FDF5E6] p-3 rounded-full group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                                <Clock className="w-5 h-5 text-[#C6A649]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1 font-serif">Hours</h3>
                                <div className="space-y-1 text-gray-600 text-sm">
                                    <div className="flex justify-between w-full max-w-[200px]">
                                        <span>Monday – Sunday</span>
                                    </div>
                                    <div className="font-medium text-gray-800">
                                        5:00 AM – 10:00 PM
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Phone Card */}
                        <div className="flex items-start gap-5 p-5 rounded-2xl border border-amber-100 hover:border-[#C6A649]/30 hover:shadow-md transition-all duration-300 group bg-white">
                            <div className="bg-[#E6F3FF] p-3 rounded-full group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                                <Phone className="w-5 h-5 text-[#C6A649]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 font-serif">Phone</h3>
                                <p className="text-gray-600 mb-3 text-sm">(610) 279-6200</p>
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        className="bg-[#C6A649] hover:bg-[#B5953F] text-white rounded-full px-5 h-8 text-xs shadow-md hover:shadow-lg transition-all"
                                        asChild
                                    >
                                        <a href="tel:+16102796200">
                                            <Phone className="w-3 h-3 mr-2" /> Call
                                        </a>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="border-[#C6A649] text-[#C6A649] hover:bg-[#FFF0F5] hover:text-[#B5953F] rounded-full px-5 h-8 text-xs"
                                    >
                                        <MessageCircle className="w-3 h-3 mr-2" /> WhatsApp
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Map (Moved to Left Column) */}
                        <div className="w-full flex-grow min-h-[250px] rounded-2xl overflow-hidden shadow-lg border-2 border-white ring-1 ring-gray-100 mt-2">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3053.468785873215!2d-75.34586432431644!3d40.1156847714894!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c69637c3855555%3A0x6345634563456345!2s324%20W%20Marshall%20St%2C%20Norristown%2C%20PA%2019401!5e0!3m2!1sen!2sus!4v1709920000000!5m2!1sen!2sus"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Eli's Bakery Location"
                                className="grayscale-[20%] hover:grayscale-0 transition-all duration-500 h-full w-full object-cover"
                            ></iframe>
                        </div>

                    </div>

                    {/* Right Column: Storefront Image (Dominant Visual) */}
                    <div className="relative h-full min-h-[500px] animate-in slide-in-from-right duration-700 delay-200">
                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-gray-100 group">
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                            <img
                                src={storefrontImage}
                                alt="Eli's Bakery Storefront"
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />

                            {/* Overlay Text */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 z-20">
                                <p className="text-[#C6A649] font-black tracking-widest uppercase text-sm mb-1">Welcome To</p>
                                <h3 className="text-white text-3xl font-serif italic">Eli's Bakery Cafe</h3>
                                <p className="text-gray-300 text-sm mt-2 max-w-sm">
                                    Look for our brick storefront on West Marshall Street. A place where tradition invites you in.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
