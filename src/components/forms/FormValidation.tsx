import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { validateEmail, validatePhone, sanitizeString } from '@/lib/validation';

interface FormValidationProps {
  email?: string;
  phone?: string;
  onValidationChange?: (isValid: boolean) => void;
}

/**
 * Real-time form validation component
 */
export function FormValidation({ email, phone, onValidationChange }: FormValidationProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const newErrors: Record<string, string> = {};

    // Validate email
    if (email !== undefined && email !== '') {
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.error || 'Invalid email';
      }
    }

    // Validate phone
    if (phone !== undefined && phone !== '') {
      const phoneValidation = validatePhone(phone);
      if (!phoneValidation.valid) {
        newErrors.phone = phoneValidation.error || 'Invalid phone number';
      }
    }

    setErrors(newErrors);
    onValidationChange?.(Object.keys(newErrors).length === 0);
  }, [email, phone, onValidationChange]);

  if (Object.keys(errors).length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {Object.entries(errors).map(([field, message]) => (
        <Alert key={field} variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{message}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}

/**
 * Hook to prevent duplicate form submissions
 */
export function usePreventDuplicateSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);

  const handleSubmit = async (submitFn: () => Promise<void>, debounceMs = 2000) => {
    const now = Date.now();
    
    // Prevent duplicate submissions within debounce window
    if (isSubmitting || (now - lastSubmitTime < debounceMs)) {
      return;
    }

    setIsSubmitting(true);
    setLastSubmitTime(now);

    try {
      await submitFn();
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, handleSubmit };
}
