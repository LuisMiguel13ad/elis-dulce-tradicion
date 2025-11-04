import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-full bg-secondary/10 p-1">
      <Button
        variant={language === 'es' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('es')}
        className="rounded-full px-4 py-1 text-sm font-semibold transition-smooth"
      >
        ES
      </Button>
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('en')}
        className="rounded-full px-4 py-1 text-sm font-semibold transition-smooth"
      >
        EN
      </Button>
    </div>
  );
};

export default LanguageToggle;
