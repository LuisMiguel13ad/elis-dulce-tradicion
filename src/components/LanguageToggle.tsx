import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-3 backdrop-blur-sm">
      <button
        onClick={() => setLanguage('es')}
        className={cn(
          "text-sm font-medium tracking-widest transition-all duration-300 hover:text-[#C6A649]",
          language === 'es' ? "text-[#C6A649] font-bold" : "text-white/70"
        )}
      >
        ES
      </button>

      <span className="text-white/40 font-light">|</span>

      <button
        onClick={() => setLanguage('en')}
        className={cn(
          "text-sm font-medium tracking-widest transition-all duration-300 hover:text-[#C6A649]",
          language === 'en' ? "text-[#C6A649] font-bold" : "text-white/70"
        )}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageToggle;
