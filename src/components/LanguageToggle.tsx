import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center bg-black/40 border border-white/10 rounded-full p-1 backdrop-blur-md">
      <button
        onClick={() => setLanguage('es')}
        className={cn(
          "px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300",
          language === 'es'
            ? "bg-[#C6A649] text-black shadow-[0_0_10px_rgba(198,166,73,0.4)]"
            : "text-white/60 hover:text-white hover:bg-white/5"
        )}
        aria-label="Cambiar idioma a Español"
      >
        ES
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          "px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300",
          language === 'en'
            ? "bg-[#C6A649] text-black shadow-[0_0_10px_rgba(198,166,73,0.4)]"
            : "text-white/60 hover:text-white hover:bg-white/5"
        )}
        aria-label="Switch language to English"
      >
        EN
      </button>
    </div>
  );
};

export default LanguageToggle;
