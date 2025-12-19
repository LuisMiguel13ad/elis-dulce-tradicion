/**
 * Business Settings Management Component
 * Admin UI for managing business configuration
 */

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBusinessSettings, useUpdateBusinessSettings } from '@/lib/hooks/useCMS';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';
import type { BusinessSettings } from '@/lib/cms';

export function BusinessSettingsManager() {
  const { t, language } = useLanguage();
  const isSpanish = language === 'es';
  const { data: settings, isLoading } = useBusinessSettings();
  const updateMutation = useUpdateBusinessSettings();

  const [formData, setFormData] = useState<Partial<BusinessSettings>>({});

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateMutation.mutateAsync(formData);
      toast.success(
        isSpanish ? 'Configuración guardada exitosamente' : 'Settings saved successfully'
      );
    } catch (error) {
      toast.error(
        isSpanish ? 'Error al guardar configuración' : 'Error saving settings'
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            {isSpanish ? 'General' : 'General'}
          </TabsTrigger>
          <TabsTrigger value="location">
            {isSpanish ? 'Ubicación' : 'Location'}
          </TabsTrigger>
          <TabsTrigger value="orders">
            {isSpanish ? 'Pedidos' : 'Orders'}
          </TabsTrigger>
          <TabsTrigger value="about">
            {isSpanish ? 'Sobre Nosotros' : 'About Us'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isSpanish ? 'Información General' : 'General Information'}</CardTitle>
              <CardDescription>
                {isSpanish
                  ? 'Configura la información básica de tu negocio'
                  : 'Configure your business basic information'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">
                  {isSpanish ? 'Nombre del Negocio (Inglés)' : 'Business Name (English)'}
                </Label>
                <Input
                  id="business_name"
                  value={formData.business_name || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, business_name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_name_es">
                  {isSpanish ? 'Nombre del Negocio (Español)' : 'Business Name (Spanish)'}
                </Label>
                <Input
                  id="business_name_es"
                  value={formData.business_name_es || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, business_name_es: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">
                  {isSpanish ? 'Eslogan (Inglés)' : 'Tagline (English)'}
                </Label>
                <Input
                  id="tagline"
                  value={formData.tagline || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, tagline: e.target.value })
                  }
                  placeholder={isSpanish ? 'Ej: Sabores que Celebran la Vida' : 'E.g., Flavors that Celebrate Life'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline_es">
                  {isSpanish ? 'Eslogan (Español)' : 'Tagline (Spanish)'}
                </Label>
                <Input
                  id="tagline_es"
                  value={formData.tagline_es || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, tagline_es: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo_url">
                  {isSpanish ? 'URL del Logo' : 'Logo URL'}
                </Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, logo_url: e.target.value })
                  }
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {isSpanish ? 'Teléfono' : 'Phone'}
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    {isSpanish ? 'Email' : 'Email'}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isSpanish ? 'Ubicación y Área de Servicio' : 'Location & Service Area'}</CardTitle>
              <CardDescription>
                {isSpanish
                  ? 'Configura la dirección y el área de entrega'
                  : 'Configure address and delivery area'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address_street">
                  {isSpanish ? 'Dirección' : 'Street Address'}
                </Label>
                <Input
                  id="address_street"
                  value={formData.address_street || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, address_street: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address_city">
                    {isSpanish ? 'Ciudad' : 'City'}
                  </Label>
                  <Input
                    id="address_city"
                    value={formData.address_city || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, address_city: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_state">
                    {isSpanish ? 'Estado' : 'State'}
                  </Label>
                  <Input
                    id="address_state"
                    value={formData.address_state || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, address_state: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_zip">
                    {isSpanish ? 'Código Postal' : 'ZIP Code'}
                  </Label>
                  <Input
                    id="address_zip"
                    value={formData.address_zip || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, address_zip: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_area_type">
                  {isSpanish ? 'Tipo de Área de Servicio' : 'Service Area Type'}
                </Label>
                <select
                  id="service_area_type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.service_area_type || 'radius'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      service_area_type: e.target.value as 'radius' | 'zipcodes',
                    })
                  }
                >
                  <option value="radius">
                    {isSpanish ? 'Radio (Millas)' : 'Radius (Miles)'}
                  </option>
                  <option value="zipcodes">
                    {isSpanish ? 'Códigos Postales' : 'ZIP Codes'}
                  </option>
                </select>
              </div>

              {formData.service_area_type === 'radius' && (
                <div className="space-y-2">
                  <Label htmlFor="service_radius_miles">
                    {isSpanish ? 'Radio de Servicio (Millas)' : 'Service Radius (Miles)'}
                  </Label>
                  <Input
                    id="service_radius_miles"
                    type="number"
                    min="1"
                    value={formData.service_radius_miles || 10}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        service_radius_miles: parseInt(e.target.value) || 10,
                      })
                    }
                  />
                </div>
              )}

              {formData.service_area_type === 'zipcodes' && (
                <div className="space-y-2">
                  <Label htmlFor="service_zipcodes">
                    {isSpanish ? 'Códigos Postales (separados por comas)' : 'ZIP Codes (comma-separated)'}
                  </Label>
                  <Input
                    id="service_zipcodes"
                    value={formData.service_zipcodes?.join(', ') || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        service_zipcodes: e.target.value
                          .split(',')
                          .map((z) => z.trim())
                          .filter((z) => z),
                      })
                    }
                    placeholder="19020, 19021, 19022"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isSpanish ? 'Configuración de Pedidos' : 'Order Settings'}</CardTitle>
              <CardDescription>
                {isSpanish
                  ? 'Configura los tiempos de anticipación para pedidos'
                  : 'Configure lead times for orders'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="minimum_lead_time_hours">
                  {isSpanish
                    ? 'Tiempo Mínimo de Anticipación (Horas)'
                    : 'Minimum Lead Time (Hours)'}
                </Label>
                <Input
                  id="minimum_lead_time_hours"
                  type="number"
                  min="1"
                  value={formData.minimum_lead_time_hours || 24}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimum_lead_time_hours: parseInt(e.target.value) || 24,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maximum_advance_days">
                  {isSpanish
                    ? 'Tiempo Máximo de Anticipación (Días)'
                    : 'Maximum Advance Time (Days)'}
                </Label>
                <Input
                  id="maximum_advance_days"
                  type="number"
                  min="1"
                  value={formData.maximum_advance_days || 90}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maximum_advance_days: parseInt(e.target.value) || 90,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isSpanish ? 'Contenido Sobre Nosotros' : 'About Us Content'}</CardTitle>
              <CardDescription>
                {isSpanish
                  ? 'Escribe el contenido para la página "Sobre Nosotros"'
                  : 'Write content for the About Us page'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="about_us_content">
                  {isSpanish ? 'Contenido (Inglés)' : 'Content (English)'}
                </Label>
                <Textarea
                  id="about_us_content"
                  rows={8}
                  value={formData.about_us_content || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, about_us_content: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="about_us_content_es">
                  {isSpanish ? 'Contenido (Español)' : 'Content (Spanish)'}
                </Label>
                <Textarea
                  id="about_us_content_es"
                  rows={8}
                  value={formData.about_us_content_es || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, about_us_content_es: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="min-w-[120px]"
        >
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
