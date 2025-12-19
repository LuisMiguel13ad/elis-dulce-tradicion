import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

/**
 * Pull to refresh component for mobile
 */
export const PullToRefresh = ({
  onRefresh,
  children,
  threshold = 80,
}: PullToRefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const isPulling = useRef(false);

  const y = useMotionValue(0);
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || window.scrollY > 0) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      if (distance > 0) {
        e.preventDefault();
        const pullAmount = Math.min(distance, threshold * 2);
        setPullDistance(pullAmount);
        y.set(pullAmount);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;

      isPulling.current = false;

      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        y.set(threshold);
        
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          y.set(0);
          setPullDistance(0);
        }
      } else {
        y.set(0);
        setPullDistance(0);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, threshold, onRefresh, y, isRefreshing]);

  const progress = Math.min((pullDistance / threshold) * 100, 100);

  return (
    <div ref={containerRef} className="relative">
      {/* Pull indicator */}
      <motion.div
        style={{ y: springY }}
        className="absolute top-0 left-0 right-0 flex items-center justify-center h-20 -translate-y-full"
      >
        {isRefreshing ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent"
              style={{
                transform: `rotate(${progress * 3.6}deg)`,
              }}
            />
            <span className="text-xs text-muted-foreground">
              {pullDistance >= threshold ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        )}
      </motion.div>

      {/* Content */}
      <motion.div style={{ y: springY }}>
        {children}
      </motion.div>
    </div>
  );
};
