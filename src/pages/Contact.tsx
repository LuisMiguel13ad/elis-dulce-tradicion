/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageCircle, Upload, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useSubmitContactForm } from '@/lib/hooks/useSupport';
import { uploadReferenceImage } from '@/lib/storage';
import { isValidImageType, isValidFileSize } from '@/lib/imageCompression';

const Contact = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSpanish = language === 'es';
  
  // Pre-fill from URL params (for order-specific help)
  const orderNumber = searchParams.get('orderNumber') || '';
  const prefillSubject = searchParams.get('subject') || '';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: (prefillSubject || 'General') as 'General' | 'Order Issue' | 'Custom Request' | 'Feedback',
    message: '',
    honeypot: '', // Spam protection - hidden field
  });
  
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const submitMutation = useSubmitContactForm();
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!isValidImageType(file)) {
      toast.error(
        t(
          'Tipo de archivo no válido. Solo se permiten imágenes.',
          'Invalid file type. Only images are allowed.'
        )
      );
      return;
    }
    
    // Validate file size (max 5MB)
    if (!isValidFileSize(file, 5 * 1024 * 1024)) {
      toast.error(
        t(
          'El archivo es demasiado grande. Tamaño máximo: 5MB',
          'File is too large. Maximum size: 5MB'
        )
      );
      return;
    }
    
    setAttachment(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachmentPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error(t('Por favor ingrese su nombre', 'Please enter your name'));
      return;
    }
    
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error(t('Por favor ingrese un email válido', 'Please enter a valid email'));
      return;
    }
    
    if (!formData.message.trim()) {
      toast.error(t('Por favor ingrese un mensaje', 'Please enter a message'));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload attachment if present
      let attachmentUrl: string | undefined;
      if (attachment) {
        setIsUploading(true);
        try {
          attachmentUrl = await uploadReferenceImage(attachment, 'contact-attachments');
          setIsUploading(false);
        } catch (error) {
          console.error('Error uploading attachment:', error);
          toast.error(
            t(
              'Error al subir el archivo. Puede continuar sin él.',
              'Error uploading file. You can continue without it.'
            )
          );
          setIsUploading(false);
        }
      }
      
      // Submit form
      const submission = await submitMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.subject,
        message: formData.message,
        attachment_url: attachmentUrl,
        order_number: orderNumber || undefined,
        honeypot: formData.honeypot,
      });
      
      if (submission) {
        toast.success(
          t(
            '¡Mensaje enviado! Nos pondremos en contacto pronto.',
            'Message sent! We\'ll get back to you soon.'
          )
        );
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'General',
          message: '',
          honeypot: '',
        });
        removeAttachment();
        
        // Navigate after a short delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      toast.error(
        error.message ||
          t(
            'Error al enviar el mensaje. Por favor intente nuevamente.',
            'Error sending message. Please try again.'
          )
      );
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="mb-4 font-display text-4xl font-bold text-gradient-gold md:text-5xl">
                {t('Contáctanos', 'Contact Us')}
              </h1>
              <div className="mx-auto mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent" />
              <p className="font-sans text-lg text-muted-foreground">
                {t(
                  'Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos pronto.',
                  'We\'re here to help. Send us a message and we\'ll get back to you soon.'
                )}
              </p>
            </div>
            
            {orderNumber && (
              <Card className="mb-6 border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">
                        {t('Ayuda con tu pedido', 'Help with your order')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          'Número de orden: ',
                          'Order number: '
                        )}
                        <span className="font-mono font-bold">{orderNumber}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>{t('Formulario de Contacto', 'Contact Form')}</CardTitle>
                <CardDescription>
                  {t(
                    'Completa el formulario y nos pondremos en contacto contigo lo antes posible.',
                    'Fill out the form and we\'ll get back to you as soon as possible.'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Honeypot field - hidden from users */}
                  <div className="hidden">
                    <Label htmlFor="honeypot">{t('No completar este campo', 'Do not fill this field')}</Label>
                    <Input
                      id="honeypot"
                      type="text"
                      value={formData.honeypot}
                      onChange={(e) => handleInputChange('honeypot', e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="name">
                        {t('Nombre', 'Name')} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder={t('Tu nombre completo', 'Your full name')}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">
                        {t('Email', 'Email')} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">{t('Teléfono', 'Phone')} ({t('opcional', 'optional')})</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(610) 910-9067"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">
                      {t('Asunto', 'Subject')} <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value: any) => handleInputChange('subject', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">
                          {t('General', 'General')}
                        </SelectItem>
                        <SelectItem value="Order Issue">
                          {t('Problema con Pedido', 'Order Issue')}
                        </SelectItem>
                        <SelectItem value="Custom Request">
                          {t('Solicitud Personalizada', 'Custom Request')}
                        </SelectItem>
                        <SelectItem value="Feedback">
                          {t('Comentarios', 'Feedback')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="message">
                      {t('Mensaje', 'Message')} <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder={t(
                        'Escribe tu mensaje aquí...',
                        'Write your message here...'
                      )}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="attachment">
                      {t('Adjuntar Imagen', 'Attach Image')} ({t('opcional', 'optional')})
                    </Label>
                    <div className="mt-2 space-y-3">
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading || isSubmitting}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {t('Seleccionar Archivo', 'Select File')}
                        </Button>
                        {attachment && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeAttachment}
                            disabled={isUploading || isSubmitting}
                          >
                            {t('Eliminar', 'Remove')}
                          </Button>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="attachment"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isUploading || isSubmitting}
                      />
                      {attachmentPreview && (
                        <div className="relative inline-block">
                          <img
                            src={attachmentPreview}
                            alt="Preview"
                            className="h-32 w-32 rounded-lg object-cover border"
                          />
                        </div>
                      )}
                      {isUploading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t('Subiendo archivo...', 'Uploading file...')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting || isUploading}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('Enviando...', 'Sending...')}
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          {t('Enviar Mensaje', 'Send Message')}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            {/* Contact Information Card */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>{t('Otras Formas de Contacto', 'Other Ways to Contact Us')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">
                      {t('Teléfono', 'Phone')}
                    </p>
                    <a
                      href="tel:+16102796200"
                      className="font-sans text-lg font-bold text-primary hover:opacity-80 transition-smooth"
                    >
                      📱 (610) 279-6200
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">
                      WhatsApp
                    </p>
                    <a
                      href="https://wa.me/16102796200"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-lg font-bold text-primary hover:opacity-80 transition-smooth"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">
                      {t('Dirección', 'Address')}
                    </p>
                    <p className="font-sans">
                      324 W Marshall St<br />
                      Norristown, PA 19401
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">
                      {t('Horario', 'Hours')}
                    </p>
                    <p className="font-sans">
                      {t('Abierto Diario: 5:00 AM - 10:00 PM', 'Open Daily: 5:00 AM - 10:00 PM')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;

