import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import tieredCakeImage from '@/assets/gallery/4_RIAkf447HPcV0cv8RJFJ7u_1767033400718_na1fn_L2hvbWUvdWJ1bnR1L2VuaGFuY2VkX2Nha2VfMDc.png';

interface NewsletterSignupProps {
  variant?: 'default' | 'compact';
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
}

const NewsletterSignup = ({ variant = 'default', className = '', inputClassName = '', buttonClassName = '' }: NewsletterSignupProps) => {
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
      <form onSubmit={handleSubmit} className={`flex gap-3 ${className}`}>
        <Input
          type="email"
          placeholder={t('Tu email', 'Your email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`flex-1 rounded-full bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#C6A649]/50 focus:ring-[#C6A649]/20 transition-all ${inputClassName}`}
          disabled={isSubmitting || isSuccess}
        />
        <Button
          type="submit"
          disabled={isSubmitting || isSuccess}
          size="default"
          className={`rounded-full bg-[#C6A649] text-black hover:bg-white transition-all ${buttonClassName}`}
        >
          {isSuccess ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
          ) : (
            <Mail className="h-5 w-5" />
          )}
        </Button>
      </form>
    );
  }

  return (
    <section className={`py-32 bg-black relative overflow-hidden ${className}`}>
      {/* Background Glow */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#C6A649]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left Column: Image - Premium Frame */}
          <div className="relative h-full min-h-[450px] lg:h-[600px] group animate-fade-in">
            <div className="absolute -inset-4 bg-[#C6A649]/20 blur-3xl rounded-[3rem] opacity-0 group-hover:opacity-30 transition-opacity duration-1000" />
            <div className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 rotate-1 group-hover:rotate-0 transition-transform duration-700">
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent z-10"></div>
              <img
                src={tieredCakeImage}
                alt="Eli's Bakery Cakes"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[2s] brightness-90 group-hover:brightness-100"
              />
              <div className="absolute bottom-10 left-10 z-20">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
                  <p className="text-[#C6A649] font-black text-sm uppercase tracking-[0.2em] mb-1">Exclusive</p>
                  <p className="text-white font-bold text-xl uppercase tracking-tighter">Sweet Updates</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="animate-fade-in space-y-10">
            <div className="text-left">
              <span className="text-sm font-bold tracking-[0.3em] text-[#C6A649] uppercase mb-4 block">
                {t('Comunidad', 'Community')}
              </span>
              <h2 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tight leading-none">
                {t('Mantente', 'Stay')} <br />
                <span className="text-[#C6A649] drop-shadow-[0_0_15px_rgba(198,166,73,0.3)]">{t('Informado', 'Informed')}</span>
              </h2>
              <div className="h-1.5 w-32 bg-gradient-to-r from-[#C6A649] to-transparent rounded-full mb-8 shadow-[0_0_10px_rgba(198,166,73,0.5)]"></div>
              <p className="text-gray-400 leading-relaxed text-xl font-light italic font-serif max-w-md">
                {t('Recibe ofertas especiales y novedades deliciosas directamente en tu bandeja de entrada.', 'Receive special offers, updates, and sweet deals directly to your inbox.')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-lg">
              <div className="relative group">
                <Input
                  type="email"
                  placeholder={t('Ingresa tu email', 'Enter your email address')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-20 px-10 rounded-full border-white/10 bg-white/5 text-white text-lg placeholder:text-gray-600 focus:border-[#C6A649] focus:ring-[#C6A649]/20 transition-all shadow-2xl"
                  disabled={isSubmitting || isSuccess}
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || isSuccess}
                    className="h-14 rounded-full bg-[#C6A649] hover:bg-white text-black font-black text-sm uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-[0_0_30px_rgba(198,166,73,0.3)] px-10"
                  >
                    {isSuccess ? (
                      <>
                        <CheckCircle2 className="mr-2 h-6 w-6" />
                        {t('¡Suscrito!', 'Subscribed!')}
                      </>
                    ) : isSubmitting ? (
                      <>
                        <div className="mr-2 h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
                        {t('Enviando...', 'Sending...')}
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-6 w-6" />
                        {t('Unirse', 'Join Us')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>

            <div className="flex items-center gap-4 text-gray-500">
              <div className="h-px flex-1 bg-white/10" />
              <p className="text-[10px] uppercase font-bold tracking-[0.2em]">
                {t(
                  'Sin Spam. Solo Dulzura.',
                  'No Spam. Just Sweetness.'
                )}
              </p>
              <div className="h-px flex-1 bg-white/10" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default NewsletterSignup;
