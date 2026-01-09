import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import tieredCakeImage from '@/assets/4_RIAkf447HPcV0cv8RJFJ7u_1767033400718_na1fn_L2hvbWUvdWJ1bnR1L2VuaGFuY2VkX2Nha2VfMDc.png';

interface NewsletterSignupProps {
  variant?: 'default' | 'compact';
  className?: string;
}

const NewsletterSignup = ({ variant = 'default', className = '' }: NewsletterSignupProps) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast.error(t('Por favor ingrese un email válido', 'Please enter a valid email'));
      return;
    }

    setIsSubmitting(true);

    try {
      await api.subscribeNewsletter(email);
      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success(
        t(
          '¡Gracias por suscribirte! Te mantendremos informado.',
          'Thank you for subscribing! We\'ll keep you updated.'
        )
      );
      setEmail('');

      // Reset success state after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setIsSubmitting(false);
      toast.error(
        t(
          'Error al suscribirse. Por favor intente nuevamente.',
          'Error subscribing. Please try again.'
        )
      );
    }
  };

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          placeholder={t('Tu email', 'Your email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          disabled={isSubmitting || isSuccess}
        />
        <Button
          type="submit"
          disabled={isSubmitting || isSuccess}
          size="default"
        >
          {isSuccess ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : isSubmitting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
        </Button>
      </form>
    );
  }

  return (
    <section className={`py-20 bg-white ${className}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left Column: Image */}
          <div className="relative h-full min-h-[400px] lg:h-[500px] animate-in slide-in-from-left duration-700">
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-gray-100 group">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
              <img
                src={tieredCakeImage}
                alt="Eli's Bakery Cakes"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
              />
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="animate-in slide-in-from-right duration-700 delay-200">
            <div className="text-left mb-8">
              <h2 className="text-4xl md:text-5xl font-black text-[#C6A649] mb-4 font-serif italic">
                {t('Mantente Informado', 'Stay Informed')}
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-[#C6A649] to-amber-300 rounded-full mb-6"></div>
              <p className="text-gray-600 leading-relaxed text-lg">
                {t('Recibe ofertas especiales y novedades', 'Receive special offers, updates, and sweet deals directly to your inbox.')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
              <Input
                type="email"
                placeholder={t('Ingresa tu email', 'Enter your email address')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 px-6 rounded-full border-amber-200 bg-white focus:border-[#C6A649] focus:ring-[#C6A649]"
                disabled={isSubmitting || isSuccess}
                required
              />
              <Button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className="h-12 rounded-full bg-[#C6A649] hover:bg-[#B5953F] text-white font-bold text-base shadow-lg hover:shadow-xl transition-all w-full sm:w-auto px-8"
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    {t('¡Suscrito!', 'Subscribed!')}
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t('Enviando...', 'Sending...')}
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    {t('Suscribirse', 'Subscribe Now')}
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-xs text-gray-400">
              {t(
                'Al suscribirte, aceptas recibir comunicaciones de marketing.',
                'By subscribing, you agree to receive marketing communications. We respect your privacy.'
              )}
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default NewsletterSignup;
