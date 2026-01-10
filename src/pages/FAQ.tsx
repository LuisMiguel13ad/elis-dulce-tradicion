import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Loader2, Search, ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { useFAQs } from '@/lib/hooks/useCMS';
import { useSubmitFAQFeedback } from '@/lib/hooks/useSupport';
import { toast } from 'sonner';

const FAQ_CATEGORIES = [
  { id: 'all', label_en: 'All Categories', label_es: 'Todas las Categorías' },
  { id: 'ordering', label_en: 'Ordering', label_es: 'Pedidos' },
  { id: 'delivery', label_en: 'Delivery', label_es: 'Entrega' },
  { id: 'payment', label_en: 'Payment', label_es: 'Pago' },
  { id: 'custom', label_en: 'Custom Cakes', label_es: 'Pasteles Personalizados' },
];

const FAQ = () => {
  const { t, language } = useLanguage();
  const isSpanish = language === 'es';
  const { data: faqs = [], isLoading, error } = useFAQs();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [helpfulVotes, setHelpfulVotes] = useState<Set<number>>(new Set());
  const [notHelpfulVotes, setNotHelpfulVotes] = useState<Set<number>>(new Set());

  const submitFeedback = useSubmitFAQFeedback();

  // Fallback to hardcoded FAQs if CMS fails
  const fallbackFAQs = [
    {
      id: 1,
      question_en: 'How much advance notice do I need to order a cake?',
      question_es: '¿Cuánto tiempo de anticipación necesito para ordenar un pastel?',
      answer_en: 'We recommend ordering at least 24 hours in advance to ensure availability. For more elaborate cakes or large orders, we suggest 48-72 hours notice.',
      answer_es: 'Recomendamos ordenar con al menos 24 horas de anticipación para asegurar disponibilidad. Para pasteles más elaborados o grandes pedidos, sugerimos 48-72 horas de anticipación.',
      display_order: 1,
      is_active: true,
    },
    {
      id: 2,
      question_en: 'What are the prices for cakes?',
      question_es: '¿Cuáles son los precios de los pasteles?',
      answer_en: 'Prices vary depending on size and design complexity. Small cakes (8") start from $40, while larger cakes can cost up to $200 or more. Contact us for an accurate quote.',
      answer_es: 'Los precios varían según el tamaño y la complejidad del diseño. Los pasteles pequeños (8") comienzan desde $40, mientras que los más grandes pueden costar hasta $200 o más. Contáctenos para una cotización precisa.',
      display_order: 2,
      is_active: true,
    },
    {
      id: 3,
      question_en: 'Do you offer delivery?',
      question_es: '¿Ofrecen entrega a domicilio?',
      answer_en: 'Yes, we offer delivery for an additional fee of $15. You can also pick up your order at our location at no additional cost.',
      answer_es: 'Sí, ofrecemos entrega a domicilio por una tarifa adicional de $15. También puede recoger su pedido en nuestra ubicación sin costo adicional.',
      display_order: 3,
      is_active: true,
    },
    {
      id: 4,
      question_en: 'Can I fully customize my cake?',
      question_es: '¿Puedo personalizar completamente mi pastel?',
      answer_en: 'Absolutely! We offer full customization including size, flavor, filling, theme, and dedication text. You can send us a reference photo via WhatsApp at (610) 279-6200.',
      answer_es: '¡Absolutamente! Ofrecemos personalización completa incluyendo tamaño, sabor, relleno, tema y dedicatoria. Puede enviarnos una foto de referencia por WhatsApp al (610) 279-6200.',
      display_order: 4,
      is_active: true,
    },
    {
      id: 5,
      question_en: 'What payment methods do you accept?',
      question_es: '¿Qué métodos de pago aceptan?',
      answer_en: 'We accept online payments through Square (credit/debit cards) and also accept cash in-store.',
      answer_es: 'Aceptamos pagos en línea a través de Square (tarjetas de crédito/débito) y también aceptamos efectivo en la tienda.',
      display_order: 5,
      is_active: true,
    },
    {
      id: 6,
      question_en: 'Do you make gluten-free or vegan cakes?',
      question_es: '¿Hacen pasteles sin gluten o veganos?',
      answer_en: 'Yes, we offer gluten-free and vegan options. Please contact us at least 48 hours in advance for these special orders.',
      answer_es: 'Sí, ofrecemos opciones sin gluten y veganas. Por favor, contáctenos con al menos 48 horas de anticipación para estos pedidos especiales.',
      display_order: 6,
      is_active: true,
    },
    {
      id: 7,
      question_en: 'What are your hours?',
      question_es: '¿Cuál es su horario de atención?',
      answer_en: 'We are open Monday through Sunday from 5:00 AM to 10:00 PM. You can visit us at 324 W Marshall St, Norristown, PA 19401.',
      answer_es: 'Estamos abiertos de lunes a domingo de 5:00 AM a 10:00 PM. Puede visitarnos en 324 W Marshall St, Norristown, PA 19401.',
      display_order: 7,
      is_active: true,
    },
    {
      id: 8,
      question_en: 'Can I cancel or modify my order?',
      question_es: '¿Puedo cancelar o modificar mi pedido?',
      answer_en: 'Cancellations or modifications must be made at least 24 hours in advance. Please contact us as soon as possible if you need to make changes.',
      answer_es: 'Las cancelaciones o modificaciones deben realizarse con al menos 24 horas de anticipación. Por favor, contáctenos lo antes posible si necesita hacer cambios.',
      display_order: 8,
      is_active: true,
    },
  ];

  const allFAQs = error ? fallbackFAQs : (faqs.length > 0 ? faqs : fallbackFAQs);

  // Add category mapping to FAQs (if not present)
  const faqsWithCategories = allFAQs.map((faq, index) => {
    // Try to infer category from question content
    const question = isSpanish ? faq.question_es : faq.question_en;
    const lowerQuestion = question.toLowerCase();

    let category = 'general';
    if (lowerQuestion.includes('order') || lowerQuestion.includes('pedido') || lowerQuestion.includes('advance') || lowerQuestion.includes('anticipación')) {
      category = 'ordering';
    } else if (lowerQuestion.includes('delivery') || lowerQuestion.includes('entrega') || lowerQuestion.includes('pickup') || lowerQuestion.includes('recoger')) {
      category = 'delivery';
    } else if (lowerQuestion.includes('payment') || lowerQuestion.includes('pago') || lowerQuestion.includes('price') || lowerQuestion.includes('precio')) {
      category = 'payment';
    } else if (lowerQuestion.includes('custom') || lowerQuestion.includes('personalizado') || lowerQuestion.includes('design') || lowerQuestion.includes('diseño')) {
      category = 'custom';
    }

    return { ...faq, category };
  });

  // Filter FAQs by search and category
  const filteredFAQs = useMemo(() => {
    return faqsWithCategories.filter(faq => {
      // Category filter
      if (selectedCategory !== 'all' && faq.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const question = isSpanish ? faq.question_es : faq.question_en;
        const answer = isSpanish ? faq.answer_es : faq.answer_en;
        return question.toLowerCase().includes(query) || answer.toLowerCase().includes(query);
      }

      return true;
    });
  }, [faqsWithCategories, searchQuery, selectedCategory, isSpanish]);

  const handleFeedback = async (faqId: number, isHelpful: boolean) => {
    // Prevent duplicate votes
    if (isHelpful && helpfulVotes.has(faqId)) return;
    if (!isHelpful && notHelpfulVotes.has(faqId)) return;

    try {
      await submitFeedback.mutateAsync({
        faq_id: faqId,
        is_helpful: isHelpful,
      });

      if (isHelpful) {
        setHelpfulVotes(prev => new Set(prev).add(faqId));
        toast.success(t('¡Gracias por tu feedback!', 'Thanks for your feedback!'));
      } else {
        setNotHelpfulVotes(prev => new Set(prev).add(faqId));
        toast.success(t('Gracias por ayudarnos a mejorar', 'Thanks for helping us improve'));
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const displayFAQs = filteredFAQs;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#C6A649]/30">
      <Navbar />

      <main className="pt-48 pb-32 overflow-hidden relative">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#C6A649]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-4xl text-center mb-24">
            <span className="inline-block px-4 py-1 rounded-full border border-[#C6A649]/30 bg-[#C6A649]/10 text-[#C6A649] text-sm font-bold tracking-[0.2em] uppercase mb-8 animate-fade-in shadow-[0_0_20px_rgba(198,166,73,0.15)]">
              {t('Centro de Ayuda', 'Help Center')}
            </span>
            <h1 className="mb-8 font-display text-5xl md:text-7xl font-black tracking-tight animate-fade-in">
              {t('Preguntas', 'Frequently')} <span className="text-[#C6A649] drop-shadow-[0_0_15px_rgba(198,166,73,0.3)]">{t('Frecuentes', 'Asked Questions')}</span>
            </h1>
            <div className="mx-auto mb-10 h-1.5 w-32 rounded-full bg-gradient-to-r from-transparent via-[#C6A649] to-transparent shadow-[0_0_10px_rgba(198,166,73,0.5)]" />
            <p className="mx-auto max-w-2xl font-sans text-xl text-gray-400 font-light leading-relaxed animate-fade-in animation-delay-300">
              {t(
                'Todo lo que necesitas saber sobre nuestras delicias, pedidos y entregas en un solo lugar.',
                'Everything you need to know about our treats, ordering, and delivery in one place.'
              )}
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-24 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-[#C6A649]" />
                <p className="text-[#C6A649] font-bold animate-pulse">{t('Cargando sabiendo...', 'Loading sweetness...')}</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full space-y-6">
                {allFAQs.length === 0 ? (
                  <div className="text-center text-gray-400 py-12 border border-white/10 rounded-3xl bg-white/5">
                    {t('No hay preguntas frecuentes disponibles.', 'No FAQs available.')}
                  </div>
                ) : (
                  allFAQs.map((faq, idx) => (
                    <AccordionItem
                      key={faq.id || idx}
                      value={`item-${faq.id || idx}`}
                      className="group relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-[#C6A649]/30 hover:bg-white/[0.08] overflow-hidden"
                    >
                      <AccordionTrigger className="px-8 py-8 font-sans text-left text-lg md:text-xl font-bold text-white hover:no-underline hover:text-[#C6A649] transition-colors group-data-[state=open]:text-[#C6A649] [&[data-state=open]>svg]:rotate-180">
                        <div className="flex items-center gap-4">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C6A649]/10 text-[#C6A649] text-xs font-black">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          {t(faq.question_es, faq.question_en)}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-8 pb-8 pt-0 font-sans text-gray-300 text-lg leading-relaxed space-y-6 border-t border-white/5">
                        <div className="pt-6">
                          {t(faq.answer_es, faq.answer_en)}
                        </div>

                        {/* Feedback Section - Mini Glass Pack */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
                          <p className="text-sm font-semibold text-gray-400">
                            {t('¿Fue útil esta respuesta?', 'Was this helpful?')}
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleFeedback(faq.id, true)}
                              disabled={helpfulVotes.has(faq.id) || notHelpfulVotes.has(faq.id)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all ${helpfulVotes.has(faq.id)
                                  ? 'bg-[#C6A649] border-[#C6A649] text-black shadow-[0_0_15px_rgba(198,166,73,0.4)]'
                                  : 'bg-white/5 border-white/10 text-white hover:border-[#C6A649] hover:text-[#C6A649]'
                                }`}
                            >
                              <ThumbsUp className="h-3.5 w-3.5" />
                              {helpfulVotes.has(faq.id) ? t('¡Útil!', 'Helpful!') : t('Sí', 'Yes')}
                            </button>
                            <button
                              onClick={() => handleFeedback(faq.id, false)}
                              disabled={helpfulVotes.has(faq.id) || notHelpfulVotes.has(faq.id)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all ${notHelpfulVotes.has(faq.id)
                                  ? 'bg-red-500 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                                  : 'bg-white/5 border-white/10 text-white hover:border-red-500 hover:text-red-500'
                                }`}
                            >
                              <ThumbsDown className="h-3.5 w-3.5" />
                              {t('No', 'No')}
                            </button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))
                )}
              </Accordion>
            )}

            {/* Support CTA Card */}
            <div className="mt-20 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#C6A649]/20 via-[#C6A649]/5 to-[#C6A649]/20 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000" />
              <div className="relative rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-10 md:p-14 text-center overflow-hidden">
                <div className="absolute -right-20 -top-20 h-64 w-64 bg-[#C6A649]/5 rounded-full blur-3xl" />

                <h3 className="relative z-10 mb-4 font-display text-3xl font-black text-white uppercase tracking-tight">
                  {t('¿Aún tienes dudas?', 'Still have questions?')}
                </h3>
                <p className="relative z-10 mb-10 font-sans text-lg text-gray-400 max-w-lg mx-auto leading-relaxed">
                  {t(
                    'Nuestro equipo está listo para ayudarte con pedidos especiales, eventos o cualquier consulta.',
                    'Our team is ready to help you with special orders, events, or any inquiry.'
                  )}
                </p>

                <div className="relative z-10 flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <a
                    href="tel:+16102796200"
                    className="group/btn flex items-center gap-3 px-8 py-4 rounded-full bg-[#C6A649] text-black font-black text-lg transition-all hover:scale-105 hover:bg-white shadow-[0_0_25px_rgba(198,166,73,0.3)]"
                  >
                    <div className="bg-black/10 rounded-full p-2 group-hover/btn:bg-black/5">
                      <Search className="h-5 w-5" />
                    </div>
                    (610) 279-6200
                  </a>
                  <a
                    href="https://wa.me/16102796200"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-8 py-4 rounded-full border border-white/20 bg-white/5 text-white font-bold text-lg hover:bg-white/10 hover:border-white transition-all transition-smooth"
                  >
                    <div className="bg-[#25D366] rounded-full p-2">
                      <HelpCircle className="h-5 w-5 text-white" />
                    </div>
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;

