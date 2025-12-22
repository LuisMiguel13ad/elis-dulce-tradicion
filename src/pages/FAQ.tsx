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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <HelpCircle className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="mb-4 font-display text-4xl font-bold text-gradient-gold md:text-5xl">
                {t('Preguntas Frecuentes', 'Frequently Asked Questions')}
              </h1>
              <div className="mx-auto mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent" />
              <p className="font-sans text-lg text-muted-foreground">
                {t(
                  'Encuentra respuestas a las preguntas más comunes sobre nuestros productos y servicios.',
                  'Find answers to the most common questions about our products and services.'
                )}
              </p>
            </div>
            
            {/* Search and Category Filters */}
            <div className="mb-8 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('Buscar preguntas...', 'Search questions...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {FAQ_CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {t(category.label_es, category.label_en)}
                  </Button>
                ))}
              </div>
              
              {searchQuery && (
                <p className="text-sm text-muted-foreground">
                  {t(
                    `Mostrando ${filteredFAQs.length} resultado(s)`,
                    `Showing ${filteredFAQs.length} result(s)`
                  )}
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full space-y-4">
                {displayFAQs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    {t('No hay preguntas frecuentes disponibles.', 'No FAQs available.')}
                  </div>
                ) : (
                  displayFAQs.map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      value={`item-${faq.id}`}
                      className="rounded-lg border border-border bg-card px-6 shadow-card"
                    >
                      <AccordionTrigger className="font-sans text-left font-semibold text-foreground hover:no-underline">
                        <div className="flex items-center gap-3 flex-1">
                          {t(faq.question_es, faq.question_en)}
                          {faq.category && faq.category !== 'general' && (
                            <Badge variant="outline" className="ml-auto">
                              {t(
                                FAQ_CATEGORIES.find(c => c.id === faq.category)?.label_es || '',
                                FAQ_CATEGORIES.find(c => c.id === faq.category)?.label_en || ''
                              )}
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="font-sans text-muted-foreground leading-relaxed space-y-4">
                        <p>{t(faq.answer_es, faq.answer_en)}</p>
                        
                        {/* Feedback Section */}
                        <div className="pt-4 border-t border-border">
                          <p className="text-sm font-semibold mb-2">
                            {t('¿Fue útil esta respuesta?', 'Was this helpful?')}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant={helpfulVotes.has(faq.id) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleFeedback(faq.id, true)}
                              disabled={helpfulVotes.has(faq.id) || notHelpfulVotes.has(faq.id)}
                            >
                              {helpfulVotes.has(faq.id) ? (
                                <>
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  {t('Útil', 'Helpful')}
                                </>
                              ) : (
                                <>
                                  <ThumbsUp className="mr-1 h-3 w-3" />
                                  {t('Sí', 'Yes')}
                                </>
                              )}
                            </Button>
                            <Button
                              variant={notHelpfulVotes.has(faq.id) ? 'destructive' : 'outline'}
                              size="sm"
                              onClick={() => handleFeedback(faq.id, false)}
                              disabled={helpfulVotes.has(faq.id) || notHelpfulVotes.has(faq.id)}
                            >
                              <ThumbsDown className="mr-1 h-3 w-3" />
                              {t('No', 'No')}
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))
                )}
              </Accordion>
            )}

            <div className="mt-12 rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-accent/10 p-8 text-center shadow-elegant">
              <h3 className="mb-4 font-display text-2xl font-bold text-foreground">
                {t('¿Tienes más preguntas?', 'Have more questions?')}
              </h3>
              <p className="mb-6 font-sans text-lg text-muted-foreground">
                {t(
                  'No dudes en contactarnos. Estamos aquí para ayudarte.',
                  'Don\'t hesitate to contact us. We\'re here to help.'
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+16102796200"
                  className="font-sans text-xl font-bold text-primary hover:opacity-80 transition-smooth"
                >
                  📱 (610) 279-6200
                </a>
                <a
                  href="https://wa.me/16102796200"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-xl font-bold text-primary hover:opacity-80 transition-smooth"
                >
                  💬 WhatsApp
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

export default FAQ;

