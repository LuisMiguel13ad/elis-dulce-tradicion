/**
 * Age Verification Modal
 * For alcohol-infused cakes (optional feature)
 */

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AgeVerificationProps {
  open: boolean;
  onVerified: () => void;
  onCancel: () => void;
  requiredAge?: number;
}

const AgeVerification = ({
  open,
  onVerified,
  onCancel,
  requiredAge = 21,
}: AgeVerificationProps) => {
  const { t, language } = useLanguage();
  const [birthDate, setBirthDate] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isSpanish = language === 'es';

  const months = [
    { value: '01', label: isSpanish ? 'Enero' : 'January' },
    { value: '02', label: isSpanish ? 'Febrero' : 'February' },
    { value: '03', label: isSpanish ? 'Marzo' : 'March' },
    { value: '04', label: isSpanish ? 'Abril' : 'April' },
    { value: '05', label: isSpanish ? 'Mayo' : 'May' },
    { value: '06', label: isSpanish ? 'Junio' : 'June' },
    { value: '07', label: isSpanish ? 'Julio' : 'July' },
    { value: '08', label: isSpanish ? 'Agosto' : 'August' },
    { value: '09', label: isSpanish ? 'Septiembre' : 'September' },
    { value: '10', label: isSpanish ? 'Octubre' : 'October' },
    { value: '11', label: isSpanish ? 'Noviembre' : 'November' },
    { value: '12', label: isSpanish ? 'Diciembre' : 'December' },
  ];

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());

  const handleVerify = () => {
    setError(null);

    if (!month || !day || !year) {
      setError(
        isSpanish
          ? 'Por favor complete todos los campos'
          : 'Please fill in all fields'
      );
      return;
    }

    const dateString = `${year}-${month}-${day}`;
    const birth = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    if (age < requiredAge) {
      setError(
        isSpanish
          ? `Debe tener al menos ${requiredAge} años para realizar este pedido`
          : `You must be at least ${requiredAge} years old to place this order`
      );
      return;
    }

    // Store verification in localStorage
    localStorage.setItem('age_verification', JSON.stringify({
      verified: true,
      date: dateString,
      timestamp: new Date().toISOString(),
    }));

    setBirthDate(dateString);
    onVerified();
  };

  // Check if already verified
  const checkExistingVerification = () => {
    const stored = localStorage.getItem('age_verification');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const verifiedDate = new Date(data.timestamp);
        const daysSince = (Date.now() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24);
        
        // Verification valid for 30 days
        if (daysSince < 30) {
          onVerified();
          return true;
        }
      } catch (e) {
        // Invalid stored data
      }
    }
    return false;
  };

  if (open && checkExistingVerification()) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isSpanish ? 'Verificación de Edad' : 'Age Verification'}
          </DialogTitle>
          <DialogDescription>
            {isSpanish
              ? `Debe tener al menos ${requiredAge} años para realizar pedidos que contengan alcohol.`
              : `You must be at least ${requiredAge} years old to place orders containing alcohol.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              {isSpanish ? '⚠️ Requisito Legal' : '⚠️ Legal Requirement'}
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              {isSpanish
                ? 'Por ley, solo podemos vender productos con alcohol a personas mayores de 21 años. Esta información se almacena de forma segura y solo se utiliza para verificación de edad.'
                : 'By law, we can only sell alcohol-containing products to persons over 21 years of age. This information is stored securely and only used for age verification.'}
            </p>
          </div>

          <div className="space-y-2">
            <Label>
              {isSpanish ? 'Fecha de Nacimiento' : 'Date of Birth'}
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue placeholder={isSpanish ? 'Mes' : 'Month'} />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger>
                  <SelectValue placeholder={isSpanish ? 'Día' : 'Day'} />
                </SelectTrigger>
                <SelectContent>
                  {days.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder={isSpanish ? 'Año' : 'Year'} />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleVerify}
              className="flex-1 min-h-[44px]"
            >
              {isSpanish ? 'Verificar' : 'Verify'}
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 min-h-[44px]"
            >
              {isSpanish ? 'Cancelar' : 'Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgeVerification;
