import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface FloatingActionButtonProps {
  to: string;
  label?: string;
  icon?: React.ReactNode;
}

/**
 * Floating Action Button for mobile navigation
 * Fixed at bottom right on mobile
 */
export const FloatingActionButton = ({
  to,
  label,
  icon,
}: FloatingActionButtonProps) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed bottom-6 right-6 z-40 md:hidden"
    >
      <Button
        asChild
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg"
      >
        <Link to={to}>
          {icon || <Plus className="h-6 w-6" />}
          {label && (
            <span className="ml-2 font-semibold">{label}</span>
          )}
        </Link>
      </Button>
    </motion.div>
  );
};
