import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import confetti from 'canvas-confetti';

export interface ConfettiRef {
  fire: (options?: confetti.Options) => void;
}

interface ConfettiProps {
  className?: string;
  onMouseEnter?: () => void;
}

export const Confetti = forwardRef<ConfettiRef, ConfettiProps>(
  ({ className = '', onMouseEnter }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
      fire: (options?: confetti.Options) => {
        if (canvasRef.current) {
          const myConfetti = confetti.create(canvasRef.current, {
            resize: true,
            useWorker: true,
          });

          // Default confetti options with gold colors matching the site theme
          const defaultOptions: confetti.Options = {
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f8cc4a', '#fbe089', '#c99e2a', '#ffd700', '#ffed4e'],
            ...options,
          };

          myConfetti(defaultOptions);
        }
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        className={className}
        onMouseEnter={onMouseEnter}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      />
    );
  }
);

Confetti.displayName = 'Confetti';

