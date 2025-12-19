import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

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
    <div className={`rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-accent/10 p-8 ${className}`}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-2xl font-bold text-foreground">
            {t('Mantente Informado', 'Stay Informed')}
          </h3>
          <p className="font-sans text-sm text-muted-foreground">
            {t('Recibe ofertas especiales y novedades', 'Receive special offers and updates')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder={t('Ingresa tu email', 'Enter your email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          disabled={isSubmitting || isSuccess}
          required
        />
        <Button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className="bg-primary text-secondary"
        >
          {isSuccess ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {t('¡Suscrito!', 'Subscribed!')}
            </>
          ) : isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
              {t('Enviando...', 'Sending...')}
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              {t('Suscribirse', 'Subscribe')}
            </>
          )}
        </Button>
      </form>

      <p className="mt-4 text-xs text-muted-foreground">
        {t(
          'Al suscribirte, aceptas recibir comunicaciones de marketing. Puedes cancelar la suscripción en cualquier momento.',
          'By subscribing, you agree to receive marketing communications. You can unsubscribe at any time.'
        )}
      </p>
    </div>
  );
};

export default NewsletterSignup;


