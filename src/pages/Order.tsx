import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShineBorder } from '@/components/ui/shine-border';
import { MessageCircle, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Confetti, type ConfettiRef } from '@/components/Confetti';

const Order = () => {
  const { t } = useLanguage();
  const confettiRef = useRef<ConfettiRef>(null);
  const [formData, setFormData] = useState({
    dateNeeded: '',
    timeNeeded: '',
    customerName: '',
    phone: '',
    email: '',
    size: '',
    filling: '',
    theme: '',
    dedication: '',
    deliveryOption: 'pickup',
    address: '',
    apartment: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate delivery address if delivery is selected
    if (formData.deliveryOption === 'delivery') {
      if (!formData.address.trim()) {
        toast.error(
          t(
            'Por favor ingrese su dirección de entrega.',
            'Please enter your delivery address.'
          )
        );
        return;
      }
    }
    
    // Trigger confetti animation for any form submission
    confettiRef.current?.fire({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f8cc4a', '#fbe089', '#c99e2a', '#ffd700', '#ffed4e'],
    });
    
    let deliveryInfo = formData.deliveryOption === 'delivery' ? 'Delivery' : 'Pickup';
    if (formData.deliveryOption === 'delivery') {
      deliveryInfo = `Delivery\nDirección: ${formData.address}`;
      if (formData.apartment.trim()) {
        deliveryInfo += `\n${t('Apartamento', 'Apartment')}: ${formData.apartment}`;
      }
    }
    
    const message = `
*Nueva Orden de Pastel*
Fecha: ${formData.dateNeeded} ${formData.timeNeeded}
Nombre: ${formData.customerName}
Teléfono: ${formData.phone}
Email: ${formData.email}
Tamaño: ${formData.size}
Relleno: ${formData.filling}
Tema: ${formData.theme}
Dedicatoria: ${formData.dedication}
Entrega: ${deliveryInfo}
    `.trim();

    // Send data to webhook (non-blocking)
    try {
      await fetch('https://hook.us2.make.com/dhclyi2vuimu4coykd1fwdli7ym2u9kz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submittedAt: new Date().toISOString(),
          source: 'elis-bakery-site',
          form: {
            dateNeeded: formData.dateNeeded,
            timeNeeded: formData.timeNeeded,
            customerName: formData.customerName,
            phone: formData.phone,
            email: formData.email,
            size: formData.size,
            filling: formData.filling,
            theme: formData.theme,
            dedication: formData.dedication,
            deliveryOption: formData.deliveryOption,
            address: formData.address,
            apartment: formData.apartment,
          },
          whatsappPreview: message,
        }),
      });
    } catch (err) {
      console.error('Webhook submission failed', err);
      // Continue regardless; user still goes to WhatsApp
    }

    const whatsappUrl = `https://wa.me/16109109067?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast.success(t('Redirigiendo a WhatsApp...', 'Redirecting to WhatsApp...'));
  };

  return (
    <div className="min-h-screen bg-background relative">
      <Confetti
        ref={confettiRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
      />
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

            <ShineBorder
              borderRadius={16}
              borderWidth={2}
              duration={10}
              color={['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3']}
              className="bg-transparent p-0"
            >
              <form onSubmit={handleSubmit} className="relative z-10 space-y-6 rounded-2xl bg-card p-8">
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
                <Label htmlFor="email">{t('Email', 'Email')} *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('ejemplo@email.com', 'example@email.com')}
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

              {/* Address Fields - Only show when delivery is selected */}
              {formData.deliveryOption === 'delivery' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="address">{t('Dirección de Entrega', 'Delivery Address')} *</Label>
                    <Input
                      id="address"
                      required={formData.deliveryOption === 'delivery'}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder={t(
                        'Ej: 123 Main St, Philadelphia, PA 19020',
                        'E.g: 123 Main St, Philadelphia, PA 19020'
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apartment">
                      {t('Apartamento/Unidad', 'Apartment/Unit')} ({t('Opcional', 'Optional')})
                    </Label>
                    <Input
                      id="apartment"
                      value={formData.apartment}
                      onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                      placeholder={t('Apt 4B, Unit 12, etc.', 'Apt 4B, Unit 12, etc.')}
                    />
                  </div>
                </>
              )}

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
            </ShineBorder>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Order;
