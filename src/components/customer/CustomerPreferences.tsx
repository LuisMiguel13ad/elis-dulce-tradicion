/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CustomerPreferencesProps {
  profile: any;
  onUpdate: () => void;
}

const CustomerPreferences = ({ profile, onUpdate }: CustomerPreferencesProps) => {
  const { t } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    favorite_cake_size: profile.favorite_cake_size || '',
    favorite_filling: profile.favorite_filling || '',
    favorite_theme: profile.favorite_theme || '',
    email_notifications_enabled: profile.email_notifications_enabled !== false,
    sms_notifications_enabled: profile.sms_notifications_enabled || false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateCustomerPreferences(preferences);
      toast.success(t('Preferencias guardadas', 'Preferences saved'));
      onUpdate();
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error(t('Error al guardar preferencias', 'Error saving preferences'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Preferencias', 'Preferences')}</CardTitle>
        <CardDescription>
          {t('Personaliza tu experiencia de compra', 'Customize your shopping experience')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Favorite Options */}
        <div className="space-y-4">
          <h3 className="font-semibold">{t('Opciones Favoritas', 'Favorite Options')}</h3>
          
          <div className="space-y-2">
            <Label>{t('Tamaño Favorito', 'Favorite Size')}</Label>
            <Select
              value={preferences.favorite_cake_size}
              onValueChange={(value) => setPreferences({ ...preferences, favorite_cake_size: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('Seleccionar tamaño', 'Select size')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('Ninguno', 'None')}</SelectItem>
                <SelectItem value="Small (6&quot;)">Small (6&quot;)</SelectItem>
                <SelectItem value="Medium (8&quot;)">Medium (8&quot;)</SelectItem>
                <SelectItem value="Large (10&quot;)">Large (10&quot;)</SelectItem>
                <SelectItem value="X-Large (12&quot;)">X-Large (12&quot;)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('Relleno Favorito', 'Favorite Filling')}</Label>
            <Select
              value={preferences.favorite_filling}
              onValueChange={(value) => setPreferences({ ...preferences, favorite_filling: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('Seleccionar relleno', 'Select filling')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('Ninguno', 'None')}</SelectItem>
                <SelectItem value="Vanilla">Vanilla</SelectItem>
                <SelectItem value="Chocolate">Chocolate</SelectItem>
                <SelectItem value="Strawberry">Strawberry</SelectItem>
                <SelectItem value="Tres Leches">Tres Leches</SelectItem>
                <SelectItem value="Caramel">Caramel</SelectItem>
                <SelectItem value="Lemon">Lemon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('Tema Favorito', 'Favorite Theme')}</Label>
            <Select
              value={preferences.favorite_theme}
              onValueChange={(value) => setPreferences({ ...preferences, favorite_theme: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('Seleccionar tema', 'Select theme')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('Ninguno', 'None')}</SelectItem>
                <SelectItem value="Simple">Simple</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Elaborate">Elaborate</SelectItem>
                <SelectItem value="Custom Design">Custom Design</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold">{t('Preferencias de Notificaciones', 'Notification Preferences')}</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('Notificaciones por Email', 'Email Notifications')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('Recibe actualizaciones de pedidos por email', 'Receive order updates via email')}
              </p>
            </div>
            <Switch
              checked={preferences.email_notifications_enabled}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, email_notifications_enabled: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('Notificaciones por SMS', 'SMS Notifications')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('Recibe actualizaciones de pedidos por SMS', 'Receive order updates via SMS')}
              </p>
            </div>
            <Switch
              checked={preferences.sms_notifications_enabled}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, sms_notifications_enabled: checked })
              }
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('Guardando...', 'Saving...')}
              </>
            ) : (
              t('Guardar Preferencias', 'Save Preferences')
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerPreferences;
