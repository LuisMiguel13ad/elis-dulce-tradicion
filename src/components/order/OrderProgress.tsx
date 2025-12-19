import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface OrderProgressProps {
  currentStep: number;
  totalSteps: number;
}

const OrderProgress = ({ currentStep, totalSteps }: OrderProgressProps) => {
  const { t } = useLanguage();

  const steps = [
    { number: 1, labelES: 'Información del Cliente', labelEN: 'Customer Info' },
    { number: 2, labelES: 'Detalles del Pastel', labelEN: 'Cake Details' },
    { number: 3, labelES: 'Entrega', labelEN: 'Delivery' },
    { number: 4, labelES: 'Revisar y Pagar', labelEN: 'Review & Pay' },
  ];

  return (
    <div className="mb-8 w-full">
      <div className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.number}>
              {/* Step Circle & Label */}
              <div className="flex flex-col items-center relative z-10 flex-none">
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full border-2 transition-all duration-300',
                    'w-10 h-10 md:w-12 md:h-12', // Slightly larger touch targets
                    isCompleted
                      ? 'bg-primary border-primary text-secondary scale-100'
                      : isCurrent
                      ? 'bg-background border-primary text-primary scale-110 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                      : 'bg-muted border-border text-muted-foreground scale-100'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />
                  ) : (
                    <span className="font-sans text-sm md:text-base font-bold">{step.number}</span>
                  )}
                </div>
                
                {/* Desktop Label */}
                <span
                  className={cn(
                    'absolute top-14 left-1/2 -translate-x-1/2 w-32 text-center text-xs font-sans font-medium hidden md:block transition-colors duration-300',
                    isCurrent ? 'text-primary font-bold' : 'text-muted-foreground'
                  )}
                >
                  {t(step.labelES, step.labelEN)}
                </span>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div className="flex-1 mx-2 md:mx-4 h-0.5 bg-border relative overflow-hidden rounded-full">
                  <div 
                    className={cn(
                      "absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out",
                      isCompleted ? "w-full" : "w-0"
                    )} 
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Mobile Current Step Label - Centered below */}
      <div className="mt-4 md:mt-12 text-center md:hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
        <span className="block text-sm font-bold text-primary mb-1">
          {t(steps[currentStep - 1].labelES, steps[currentStep - 1].labelEN)}
        </span>
        <p className="text-xs text-muted-foreground">
          {t(`Paso ${currentStep} de ${totalSteps}`, `Step ${currentStep} of ${totalSteps}`)}
        </p>
      </div>
    </div>
  );
};

export default OrderProgress;
