import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ReviewQuoteProps {
  nameES: string;
  nameEN: string;
  rating: number;
  textES: string;
  textEN: string;
  dateES: string;
  dateEN: string;
  theme?: string;
}

const ReviewQuote = ({ nameES, nameEN, rating, textES, textEN, dateES, dateEN, theme }: ReviewQuoteProps) => {
  const { t } = useLanguage();

  const themeLabels: Record<string, { es: string; en: string }> = {
    authentic: { es: 'Auténtico', en: 'Authentic' },
    family: { es: 'Familia', en: 'Family' },
    quality: { es: 'Calidad', en: 'Quality' },
    service: { es: 'Servicio', en: 'Service' },
    custom: { es: 'Personalizado', en: 'Custom' },
  };

  const themeLabel = theme ? themeLabels[theme] : null;

  return (
    <Card className="group relative h-full border-2 border-primary/20 bg-card shadow-card transition-smooth hover:border-primary/40 hover:shadow-elegant">
      <CardContent className="relative p-6 md:p-8">
        {/* Decorative quote mark */}
        <div className="absolute -top-2 -left-2 opacity-10 group-hover:opacity-20 transition-opacity">
          <Quote className="h-16 w-16 text-primary" />
        </div>

        {/* Star rating */}
        <div className="mb-4 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < rating
                  ? 'fill-primary text-primary'
                  : 'text-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        {/* Review text */}
        <p className="mb-6 font-sans text-base leading-relaxed text-foreground md:text-lg">
          "{t(textES, textEN)}"
        </p>

        {/* Customer info */}
        <div className="flex items-center justify-between border-t border-border/50 pt-4">
          <div>
            <p className="font-sans font-bold text-foreground">
              {t(nameES, nameEN)}
            </p>
            <p className="font-sans text-sm text-muted-foreground">
              {t(dateES, dateEN)}
            </p>
          </div>
          {themeLabel && (
            <div className="rounded-full bg-primary/10 px-3 py-1">
              <span className="font-sans text-xs font-semibold text-primary">
                {t(themeLabel.es, themeLabel.en)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewQuote;

