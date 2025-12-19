/**
 * Business Hours Management Component
 * Admin UI for managing business hours
 */

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useBusinessHours,
  useUpdateBusinessHours,
} from '@/lib/hooks/useCMS';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';
import type { BusinessHours } from '@/lib/cms';

const DAYS_OF_WEEK = [
  { value: 0, label_en: 'Sunday', label_es: 'Domingo' },
  { value: 1, label_en: 'Monday', label_es: 'Lunes' },
  { value: 2, label_en: 'Tuesday', label_es: 'Martes' },
  { value: 3, label_en: 'Wednesday', label_es: 'Miércoles' },
  { value: 4, label_en: 'Thursday', label_es: 'Jueves' },
  { value: 5, label_en: 'Friday', label_es: 'Viernes' },
  { value: 6, label_en: 'Saturday', label_es: 'Sábado' },
];

export function BusinessHoursManager() {
  const { t, language } = useLanguage();
  const isSpanish = language === 'es';
  const { data: hours = [], isLoading } = useBusinessHours();
  const updateMutation = useUpdateBusinessHours();

  const [formData, setFormData] = useState<BusinessHours[]>([]);

  useEffect(() => {
    if (hours.length > 0) {
      setFormData([...hours]);
    } else {
      // Initialize with default hours
      setFormData(
        DAYS_OF_WEEK.map((day) => ({
          id: 0,
          day_of_week: day.value,
          is_open: true,
          open_time: '09:00',
          close_time: '20:00',
          is_closed: false,
        }))
      );
    }
  }, [hours]);

  const handleDayChange = (dayOfWeek: number, field: string, value: any) => {
    setFormData(
      formData.map((day) =>
        day.day_of_week === dayOfWeek
          ? { ...day, [field]: value }
          : day
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync(formData);
      toast.success(
        isSpanish
          ? 'Horarios guardados exitosamente'
          : 'Hours saved successfully'
      );
    } catch (error) {
      toast.error(
        isSpanish ? 'Error al guardar horarios' : 'Error saving hours'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {isSpanish ? 'Horarios de Atención' : 'Business Hours'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS_OF_WEEK.map((day) => {
            const dayData = formData.find((d) => d.day_of_week === day.value);
            if (!dayData) return null;

            return (
              <div
                key={day.value}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <div className="w-32 flex-shrink-0">
                  <Label className="font-semibold">
                    {isSpanish ? day.label_es : day.label_en}
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={dayData.is_closed}
                    onChange={(e) =>
                      handleDayChange(day.value, 'is_closed', e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label className="text-sm">
                    {isSpanish ? 'Cerrado' : 'Closed'}
                  </Label>
                </div>

                {!dayData.is_closed && (
                  <>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`open_${day.value}`} className="text-sm">
                        {isSpanish ? 'Abre' : 'Open'}
                      </Label>
                      <Input
                        id={`open_${day.value}`}
                        type="time"
                        value={dayData.open_time || ''}
                        onChange={(e) =>
                          handleDayChange(
                            day.value,
                            'open_time',
                            e.target.value
                          )
                        }
                        className="w-32"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Label htmlFor={`close_${day.value}`} className="text-sm">
                        {isSpanish ? 'Cierra' : 'Close'}
                      </Label>
                      <Input
                        id={`close_${day.value}`}
                        type="time"
                        value={dayData.close_time || ''}
                        onChange={(e) =>
                          handleDayChange(
                            day.value,
                            'close_time',
                            e.target.value
                          )
                        }
                        className="w-32"
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isSpanish ? 'Guardando...' : 'Saving...'}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isSpanish ? 'Guardar' : 'Save'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
