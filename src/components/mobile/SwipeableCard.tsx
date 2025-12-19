import { useRef, useState } from 'react';
import { motion, PanInfo, useMotionValue } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  threshold?: number;
  className?: string;
}

/**
 * Swipeable card component for mobile
 * Supports swipe left/right gestures
 */
export const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 100,
  className,
}: SwipeableCardProps) => {
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeDistance = info.offset.x;

    if (Math.abs(swipeDistance) > threshold) {
      if (swipeDistance > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (swipeDistance < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    setIsDragging(false);
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      style={{ x }}
      className={cn('relative', className)}
    >
      {/* Left action indicator */}
      {onSwipeRight && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-20 bg-green-500 rounded-l-lg flex items-center justify-center"
          style={{
            opacity: x.get() > 0 ? Math.min(x.get() / threshold, 1) : 0,
          }}
        >
          {leftAction || <CheckCircle2 className="h-8 w-8 text-white" />}
        </motion.div>
      )}

      {/* Right action indicator */}
      {onSwipeLeft && (
        <motion.div
          className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 rounded-r-lg flex items-center justify-center"
          style={{
            opacity: x.get() < 0 ? Math.min(Math.abs(x.get()) / threshold, 1) : 0,
          }}
        >
          {rightAction || <X className="h-8 w-8 text-white" />}
        </motion.div>
      )}

      {/* Card content */}
      <div className={cn(
        'bg-card border border-border rounded-lg',
        isDragging && 'shadow-lg'
      )}>
        {children}
      </div>
    </motion.div>
  );
};
