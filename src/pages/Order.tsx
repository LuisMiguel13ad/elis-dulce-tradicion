import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const Order = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    dateNeeded: '',
    timeNeeded: '',
    customerName: '',
    phone: '',
    size: '',
    filling: '',
    theme: '',
    dedication: '',
    deliveryOption: 'pickup',
  });

  const sizes = ['8"', '10"', '12"', '14"', '16"', '18"', '1/4 Sheet', '1/2 Sheet', 'Full Sheet'];
  
  const fillings = [
    'Fresa', 'Chocolate Chip', 'Mocha', 'Chocolate Mousse', 'Napolitano', 'Nuez', 
    'Coco', 'Piña', 'Piña Colada', 'Durazno', 'Tiramisu', 'Envinado', 
    'Carrot', 'Red Velvet', 'Oreo', 'Rompope', "Eli's Signature Cake"
  ];

  const themes = [
    { es: 'Baby Shower', en: 'Baby Shower' },
    { es: 'Boda', en: 'Wedding' },
    { es: '15 Años', en: 'Quinceañera' },
    { es: 'Bautizo', en: 'Baptism' },
    { es: 'Niño/Niña', en: 'Boy/Girl' },
    { es: 'Adulto', en: 'Adult' },
    { es: 'Cumpleaños', en: 'Birthday' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const message = `
*Nueva Orden de Pastel*
Fecha: ${formData.dateNeeded} ${formData.timeNeeded}
Nombre: ${formData.customerName}
Teléfono: ${formData.phone}
Tamaño: ${formData.size}
Relleno: ${formData.filling}
Tema: ${formData.theme}
Dedicatoria: ${formData.dedication}
Entrega: ${formData.deliveryOption === 'delivery' ? 'Delivery' : 'Pickup'}
    `.trim();

    const whatsappUrl = `https://wa.me/16109109067?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast.success(t('Redirigiendo a WhatsApp...', 'Redirecting to WhatsApp...'));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <h1 className="mb-4 font-display text-4xl font-bold text-gradient-gold md:text-5xl">
                {t('Orden de Pastel Personalizado', 'Custom Cake Order')}
              </h1>
              <div className="mx-auto mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent" />
              <p className="font-sans text-lg text-muted-foreground">
                {t(
                  'Por favor complete el siguiente formulario o envíe su foto de referencia al:',
                  'Please fill out the form below or send us your reference photo:'
                )}
              </p>
              <p className="mt-2 font-sans text-xl font-bold text-primary">📱 610-910-9067</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-8 shadow-elegant">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateNeeded">{t('Fecha Necesaria', 'Date Needed')} *</Label>
                  <Input
                    id="dateNeeded"
                    type="date"
                    required
                    value={formData.dateNeeded}
                    onChange={(e) => setFormData({ ...formData, dateNeeded: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeNeeded">{t('Hora', 'Time')} *</Label>
                  <Input
                    id="timeNeeded"
                    type="time"
                    required
                    value={formData.timeNeeded}
                    onChange={(e) => setFormData({ ...formData, timeNeeded: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerName">{t('Nombre Completo', 'Full Name')} *</Label>
                <Input
                  id="customerName"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('Teléfono', 'Phone')} *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">{t('Tamaño del Pastel', 'Cake Size')} *</Label>
                <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Seleccionar tamaño', 'Select size')} />
                  </SelectTrigger>
                  <SelectContent>
                    {sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filling">{t('Sabor de Relleno', 'Filling Flavor')} *</Label>
                <Select value={formData.filling} onValueChange={(value) => setFormData({ ...formData, filling: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Seleccionar sabor', 'Select flavor')} />
                  </SelectTrigger>
                  <SelectContent>
                    {fillings.map((filling) => (
                      <SelectItem key={filling} value={filling}>
                        {filling}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">{t('Tema del Pastel', 'Cake Theme')} *</Label>
                <Select value={formData.theme} onValueChange={(value) => setFormData({ ...formData, theme: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Seleccionar tema', 'Select theme')} />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme.en} value={theme.en}>
                        {t(theme.es, theme.en)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dedication">{t('Dedicatoria', 'Dedication Text')}</Label>
                <Textarea
                  id="dedication"
                  placeholder={t('Ej: Feliz Cumpleaños María!', 'E.g: Happy Birthday Maria!')}
                  rows={3}
                  value={formData.dedication}
                  onChange={(e) => setFormData({ ...formData, dedication: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('Entrega', 'Delivery Option')} *</Label>
                <div className="flex gap-4">
                  <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border-2 border-border p-4 transition-smooth hover:border-primary">
                    <input
                      type="radio"
                      name="delivery"
                      value="pickup"
                      checked={formData.deliveryOption === 'pickup'}
                      onChange={(e) => setFormData({ ...formData, deliveryOption: e.target.value })}
                      className="text-primary"
                    />
                    <span className="font-sans font-semibold">{t('Recoger', 'Pickup')}</span>
                  </label>
                  <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border-2 border-border p-4 transition-smooth hover:border-primary">
                    <input
                      type="radio"
                      name="delivery"
                      value="delivery"
                      checked={formData.deliveryOption === 'delivery'}
                      onChange={(e) => setFormData({ ...formData, deliveryOption: e.target.value })}
                      className="text-primary"
                    />
                    <span className="font-sans font-semibold">{t('Entrega a Domicilio', 'Delivery')}</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">{t('Foto de Referencia (Opcional)', 'Reference Photo (Optional)')}</Label>
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 text-center transition-smooth hover:border-primary">
                  <div className="space-y-2">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="font-sans text-sm text-muted-foreground">
                      {t(
                        'Puede enviar su foto de referencia directamente por WhatsApp',
                        'You can send your reference photo directly via WhatsApp'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full rounded-full bg-primary py-6 font-sans text-lg font-bold text-secondary shadow-glow transition-smooth hover:scale-105"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                {t('Enviar Orden por WhatsApp', 'Send Order via WhatsApp')}
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Order;
