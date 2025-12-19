import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  delay: number;
  duration: number;
}

const LanguageToggle = () => {
  const { language, setLanguage, t } = useLanguage();
  
  // State Management
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Ref to track toggle button DOM element
  const toggleRef = useRef<HTMLButtonElement>(null);
  
  // Track whether toggle is in Español (left) or English (right) position
  const isEnglish = mounted && language === 'en';
  
  // Handle hydration - prevent mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Generate particles with different timing
  const generateParticles = () => {
    const newParticles: Particle[] = [];
    const particleCount = 3; // Multiple layers
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        delay: i * 0.1, // Stagger timing
        duration: 0.6 + i * 0.1, // Different durations for depth
      });
    }
    setParticles(newParticles);
    setIsAnimating(true);
    // Clear particles after animation
    setTimeout(() => {
      setIsAnimating(false);
      setParticles([]);
    }, 1000);
  };
  
  // Toggle handler - switches language and triggers particles
  const handleToggle = () => {
    generateParticles();
    setLanguage(isEnglish ? 'es' : 'en');
  };
  
  // Prevent hydration mismatch - show placeholder during SSR
  if (!mounted) {
    return (
      <div className="relative inline-block">
        <div className="relative flex h-[64px] w-[104px] items-center rounded-full bg-gray-200 p-1" />
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      {/* SVG Filter for Film Grain Texture */}
      <svg className="absolute w-0 h-0">
        <defs>
          {/* Light mode grain - subtle */}
          <filter id="grain-light">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="saturate"
              values="0"
              result="desaturatedNoise"
            />
            <feComponentTransfer in="desaturatedNoise" result="lightGrain">
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feBlend in="SourceGraphic" in2="lightGrain" mode="overlay" />
          </filter>
          
          {/* Dark mode grain - more visible */}
          <filter id="grain-dark">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="saturate"
              values="0"
              result="desaturatedNoise"
            />
            <feComponentTransfer in="desaturatedNoise" result="darkGrain">
              <feFuncA type="linear" slope="0.5" />
            </feComponentTransfer>
            <feBlend in="SourceGraphic" in2="darkGrain" mode="overlay" />
          </filter>
        </defs>
      </svg>
      
      {/* Pill-shaped track container */}
      <motion.button
        ref={toggleRef}
        onClick={handleToggle}
        className="relative flex h-[64px] w-[104px] items-center rounded-full p-[6px] transition-all duration-300 focus:outline-none"
        style={{
          background: isEnglish
            ? 'radial-gradient(ellipse at top left, #1e293b 0%, #0f172a 40%, #020617 100%)'
            : 'radial-gradient(ellipse at top left, #f8cc4a 0%, #fbe089 40%, #c99e2a 100%)',
          boxShadow: isEnglish
            ? `
              inset 5px 5px 12px rgba(0, 0, 0, 0.9),
              inset -5px -5px 12px rgba(71, 85, 105, 0.4),
              inset 8px 8px 16px rgba(0, 0, 0, 0.7),
              inset -8px -8px 16px rgba(100, 116, 139, 0.2),
              inset 0 2px 4px rgba(0, 0, 0, 1),
              inset 0 -2px 4px rgba(71, 85, 105, 0.4),
              inset 0 0 20px rgba(0, 0, 0, 0.6),
              0 1px 1px rgba(255, 255, 255, 0.05),
              0 2px 4px rgba(0, 0, 0, 0.4),
              0 8px 16px rgba(0, 0, 0, 0.4),
              0 16px 32px rgba(0, 0, 0, 0.3),
              0 24px 48px rgba(0, 0, 0, 0.2)
            `
            : `
              inset 5px 5px 12px rgba(204, 158, 42, 0.5),
              inset -5px -5px 12px rgba(248, 204, 74, 1),
              inset 8px 8px 16px rgba(201, 158, 42, 0.3),
              inset -8px -8px 16px rgba(251, 224, 137, 0.9),
              inset 0 2px 4px rgba(204, 158, 42, 0.4),
              inset 0 -2px 4px rgba(248, 204, 74, 1),
              inset 0 0 20px rgba(248, 204, 74, 0.3),
              0 1px 2px rgba(248, 204, 74, 1),
              0 2px 4px rgba(0, 0, 0, 0.1),
              0 8px 16px rgba(0, 0, 0, 0.08),
              0 16px 32px rgba(0, 0, 0, 0.06),
              0 24px 48px rgba(0, 0, 0, 0.04)
            `,
          border: isEnglish 
            ? '2px solid rgba(51, 65, 85, 0.6)' 
            : '2px solid rgba(248, 204, 74, 0.6)',
          position: 'relative',
        }}
        aria-label={isEnglish ? t('common.switchToSpanish', 'Switch to Español') : t('common.switchToEnglish', 'Switch to English')}
        role="switch"
        aria-checked={isEnglish}
        whileTap={{ scale: 0.98 }}
      >
        {/* Deep inner groove/rim effect */}
        <div 
          className="absolute inset-[3px] rounded-full pointer-events-none"
          style={{
            boxShadow: isEnglish
              ? 'inset 0 2px 6px rgba(0, 0, 0, 0.9), inset 0 -1px 3px rgba(71, 85, 105, 0.3)'
              : 'inset 0 2px 6px rgba(204, 158, 42, 0.4), inset 0 -1px 3px rgba(251, 224, 137, 0.8)',
          }}
        />
        
        {/* Multi-layer glossy overlay */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: isEnglish
              ? `
                radial-gradient(ellipse at top, rgba(71, 85, 105, 0.15) 0%, transparent 50%),
                linear-gradient(to bottom, rgba(71, 85, 105, 0.2) 0%, transparent 30%, transparent 70%, rgba(0, 0, 0, 0.3) 100%)
              `
              : `
                radial-gradient(ellipse at top, rgba(248, 204, 74, 0.8) 0%, transparent 50%),
                linear-gradient(to bottom, rgba(248, 204, 74, 0.7) 0%, transparent 30%, transparent 70%, rgba(204, 158, 42, 0.15) 100%)
              `,
            mixBlendMode: 'overlay',
          }}
        />
        
        {/* Ambient occlusion effect */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: isEnglish
              ? 'inset 0 0 15px rgba(0, 0, 0, 0.5)'
              : 'inset 0 0 15px rgba(248, 204, 74, 0.2)',
          }}
        />
        
        {/* Background Labels */}
        <div className="absolute inset-0 flex items-center justify-between px-2">
          <span className={`text-[10px] font-bold ${isEnglish ? 'text-yellow-100/80' : 'text-amber-600'}`}>
            Español
          </span>
          <span className={`text-[10px] font-bold ${isEnglish ? 'text-yellow-100' : 'text-slate-700/60'}`}>
            English
          </span>
        </div>
        
        {/* Circular Thumb with Bouncy Spring Physics */}
        <motion.div
          className="relative z-10 flex h-[44px] w-[44px] items-center justify-center rounded-full overflow-hidden"
          style={{
            background: isEnglish
              ? 'linear-gradient(145deg, #64748b 0%, #475569 50%, #334155 100%)'
              : 'linear-gradient(145deg, #f8cc4a 0%, #fbe089 50%, #c99e2a 100%)',
            boxShadow: isEnglish
              ? `
                inset 2px 2px 4px rgba(100, 116, 139, 0.4),
                inset -2px -2px 4px rgba(0, 0, 0, 0.8),
                inset 0 1px 1px rgba(255, 255, 255, 0.15),
                0 1px 2px rgba(255, 255, 255, 0.1),
                0 8px 32px rgba(0, 0, 0, 0.6),
                0 4px 12px rgba(0, 0, 0, 0.5),
                0 2px 4px rgba(0, 0, 0, 0.4)
              `
              : `
                inset 2px 2px 4px rgba(204, 158, 42, 0.3),
                inset -2px -2px 4px rgba(248, 204, 74, 1),
                inset 0 1px 2px rgba(251, 224, 137, 1),
                0 1px 2px rgba(248, 204, 74, 1),
                0 8px 32px rgba(0, 0, 0, 0.18),
                0 4px 12px rgba(0, 0, 0, 0.12),
                0 2px 4px rgba(0, 0, 0, 0.08)
              `,
            border: isEnglish
              ? '2px solid rgba(148, 163, 184, 0.3)'
              : '2px solid rgba(248, 204, 74, 0.9)',
          }}
          animate={{
            x: isEnglish ? 46 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 300, // Fast, responsive movement
            damping: 20, // Bouncy feel with slight overshoot
          }}
        >
          {/* Glossy shine overlay on thumb */}
          <div 
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(251, 224, 137, 0.4) 0%, transparent 40%, rgba(0, 0, 0, 0.1) 100%)',
              mixBlendMode: 'overlay',
            }}
          />
          
          {/* Particle Layer - expanding circles from center with grainy texture */}
          {isAnimating && particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: '10px',
                  height: '10px',
                  background: isEnglish
                    ? 'radial-gradient(circle, rgba(147, 197, 253, 0.5) 0%, rgba(147, 197, 253, 0) 70%)'
                    : 'radial-gradient(circle, rgba(251, 191, 36, 0.7) 0%, rgba(251, 191, 36, 0) 70%)',
                  mixBlendMode: 'normal',
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: isEnglish ? 6 : 8, opacity: [0, 1, 0] }}
                transition={{
                  duration: isEnglish ? 0.5 : particle.duration,
                  delay: particle.delay,
                  ease: 'easeOut',
                }}
              >
                {/* Grainy texture overlay */}
                <div 
                  className="absolute inset-0 rounded-full opacity-40"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    mixBlendMode: 'overlay',
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
          
          {/* Language Label on Thumb */}
          <div className="relative z-10">
            <span className={`text-[10px] font-bold ${isEnglish ? 'text-yellow-200' : 'text-amber-500'}`}>
              {isEnglish ? 'EN' : 'ES'}
            </span>
          </div>
        </motion.div>
      </motion.button>
    </div>
  );
};

export default LanguageToggle;
