/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShineBorder } from '@/components/ui/shine-border';
import OrderProgress from '@/components/order/OrderProgress';
import AddressAutocomplete from '@/components/order/AddressAutocomplete';
import { MessageCircle, Upload, CreditCard, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Confetti, type ConfettiRef } from '@/components/Confetti';
import { validateOrderDateTime, formatHoursUntilEvent } from '@/lib/validation';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { uploadReferenceImage } from '@/lib/storage';
import { isValidImageType, isValidFileSize } from '@/lib/imageCompression';
import { calculateTotal, fetchCurrentPricing, formatPrice, type PricingBreakdown, type OrderDetails } from '@/lib/pricing';
import { useOptimizedPricing } from '@/lib/hooks/useOptimizedPricing';
import { useAvailableDates } from '@/lib/queries/capacity';
import { useIsMobile } from '@/hooks/use-mobile';
import { Camera } from 'lucide-react';
import { CameraCapture } from '@/components/mobile/CameraCapture';
import { BottomSheet } from '@/components/mobile/BottomSheet';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useShare } from '@/hooks/useShare';
import { useAuth } from '@/contexts/AuthContext';
import { Checkbox } from '@/components/ui/checkbox';
import { FoodSafetyDisclaimer } from '@/components/legal/FoodSafetyDisclaimer';

const STORAGE_KEY = 'bakery_order_draft';

const Order = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSpanish = language === 'es';
  const confettiRef = useRef<ConfettiRef>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [pricingBreakdown, setPricingBreakdown] = useState<PricingBreakdown | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<Array<{ date: string; available: boolean; current_orders: number; max_orders: number; reason: string }>>([]);
  const [dateCapacity, setDateCapacity] = useState<{ current: number; max: number } | null>(null);
  const [isCheckingCapacity, setIsCheckingCapacity] = useState(false);
  const [deliveryZone, setDeliveryZone] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [saveAddress, setSaveAddress] = useState(false);
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
    referenceImage: null as File | null,
    deliveryOption: 'pickup',
    address: '',
    apartment: '',
    zipCode: '',
  });
  const [consentGiven, setConsentGiven] = useState(false);

  // Fetch available dates using React Query (cached, auto-refetch)
  const { data: availableDatesData = [] } = useAvailableDates(90);
  
  useEffect(() => {
    if (availableDatesData) {
      setAvailableDates(availableDatesData);
    }
  }, [availableDatesData]);

  // Load saved addresses if user is logged in
  useEffect(() => {
    const loadAddresses = async () => {
      if (user && user.profile?.role === 'customer') {
        try {
          const addresses = await api.getCustomerAddresses();
          setSavedAddresses(addresses);
          
          // Pre-fill from default address
          const defaultAddress = addresses.find((a: any) => a.is_default);
          if (defaultAddress && formData.deliveryOption === 'delivery') {
            setFormData(prev => ({
              ...prev,
              address: defaultAddress.address,
              apartment: defaultAddress.apartment || '',
              zipCode: defaultAddress.zip_code || '',
            }));
            setSelectedAddressId(defaultAddress.id);
          }
        } catch (error) {
          console.error('Error loading addresses:', error);
        }
      }
    };
    loadAddresses();
  }, [user]);

  // Pre-fill customer info from profile
  useEffect(() => {
    if (user && user.profile) {
      setFormData(prev => ({
        ...prev,
        customerName: user.profile.full_name || prev.customerName,
        email: user.email || prev.email,
        phone: user.profile.phone || prev.phone,
        size: user.profile.favorite_cake_size || prev.size,
        filling: user.profile.favorite_filling || prev.filling,
        theme: user.profile.favorite_theme || prev.theme,
      }));
    }
  }, [user]);

  // Check capacity when date changes
  useEffect(() => {
    const checkCapacity = async () => {
      if (!formData.dateNeeded) {
        setDateCapacity(null);
        return;
      }

      setIsCheckingCapacity(true);
      try {
        const capacity = await api.getCapacityByDate(formData.dateNeeded);
        setDateCapacity({
          current: capacity.current_orders || 0,
          max: capacity.max_orders || 10,
        });
      } catch (error) {
        console.error('Error checking capacity:', error);
      } finally {
        setIsCheckingCapacity(false);
      }
    };

    checkCapacity();
  }, [formData.dateNeeded]);

  // Load saved draft and prefill data on mount
  useEffect(() => {
    // Check for menu prefill first
    const prefill = sessionStorage.getItem('orderPrefill');
    if (prefill) {
      try {
        const parsed = JSON.parse(prefill);
        setFormData(prev => ({
          ...prev,
          filling: parsed.filling || prev.filling,
          size: parsed.size || prev.size,
          theme: parsed.theme || prev.theme,
        }));
        sessionStorage.removeItem('orderPrefill');
        toast.success(t('Información del producto cargada', 'Product information loaded'));
      } catch (e) {
        console.error('Error loading prefill:', e);
      }
    }
    
    // Then check for saved draft
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, [t]);

  // Auto-save form data (excluding File objects)
  useEffect(() => {
    const timer = setTimeout(() => {
      const dataToSave = { ...formData };
      // Don't save File object to localStorage
      if (dataToSave.referenceImage) {
        dataToSave.referenceImage = null;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const [configurator, setConfigurator] = useState<{
    attributes: any[];
    rules: any[];
  }>({ attributes: [], rules: [] });

  // Fetch configurator data
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await api.getAttributes();
        setConfigurator(data);
      } catch (error) {
        console.error('Error loading attributes:', error);
      }
    };
    loadConfig();
  }, []);

  // Optimized pricing calculation with debouncing and React Query caching
  const { pricingBreakdown: optimizedPricing, isLoading: isCalculatingPrice } = useOptimizedPricing({
    size: formData.size,
    filling: formData.filling,
    theme: formData.theme,
    deliveryOption: formData.deliveryOption,
    deliveryAddress: formData.deliveryOption === 'delivery' ? formData.address : undefined,
    zipCode: formData.deliveryOption === 'delivery' ? formData.zipCode : undefined,
    promoCode: promoCode || undefined,
  });

  // Update pricing breakdown when optimized pricing changes
  useEffect(() => {
    if (optimizedPricing) {
      setPricingBreakdown(optimizedPricing);
    }
  }, [optimizedPricing]);

  // Get current total for display
  const getCurrentTotal = (): number => {
    if (pricingBreakdown) {
      return pricingBreakdown.total;
    }
    // Fallback
    return formData.deliveryOption === 'delivery' ? 65 : 50;
  };

  const isOptionDisabled = (optionId: number) => {
    // Check against rules based on current selections
    // This requires mapping formData values back to option IDs
    // Simplified implementation for now
    return false;
  };

  // Validate current step
  const validateStep = async (step: number): Promise<boolean> => {
    setValidationError(null);
    
    if (step === 1) {
      if (!formData.dateNeeded || !formData.timeNeeded) {
        setValidationError(t('Por favor seleccione fecha y hora', 'Please select date and time'));
        return false;
      }

      // Comprehensive validation
      const validation = await validateOrderDateTimeComplete(formData.dateNeeded, formData.timeNeeded);
      
      if (!validation.isValid) {
        const errorMessage = validation.errors.join(', ');
        setValidationError(errorMessage);
        return false;
      }

      // Check capacity
      if (validation.capacity && !validation.capacity.available) {
        setValidationError(
          t(
            'Esta fecha está llena. Por favor seleccione otra fecha.',
            'This date is full. Please select another date.'
          )
        );
        return false;
      }

      if (!formData.customerName || !formData.phone || !formData.email) {
        setValidationError(t('Por favor complete todos los campos', 'Please fill all fields'));
        return false;
      }
      return true;
    }
    
    if (step === 2) {
      if (!formData.size || !formData.filling || !formData.theme) {
        setValidationError(t('Por favor seleccione tamaño, relleno y tema', 'Please select size, filling, and theme'));
        return false;
      }
      return true;
    }
    
    if (step === 3) {
      if (formData.deliveryOption === 'delivery' && !formData.address.trim()) {
        setValidationError(t('Por favor ingrese su dirección', 'Please enter your address'));
        return false;
      }
      return true;
    }
    
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setValidationError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (!file) {
      setFormData({ ...formData, referenceImage: null });
      setImagePreviewUrl(null);
      setUploadedImageUrl(null);
      return;
    }

    // Validate file type
    if (!isValidImageType(file)) {
      toast.error(
        t(
          'Tipo de archivo no válido. Por favor suba una imagen JPG, PNG o WebP.',
          'Invalid file type. Please upload a JPG, PNG, or WebP image.'
        )
      );
      e.target.value = ''; // Reset input
      return;
    }

    // Validate file size
    if (!isValidFileSize(file)) {
      toast.error(
        t(
          'El archivo es demasiado grande. Por favor suba una imagen menor a 5MB.',
          'File is too large. Please upload an image smaller than 5MB.'
        )
      );
      e.target.value = ''; // Reset input
      return;
    }

    // Set file and create preview
    setFormData({ ...formData, referenceImage: file });
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
    setUploadedImageUrl(null);

    // Auto-upload image
    setIsUploadingImage(true);
    setUploadProgress(0);

    try {
      // Simulate progress (Supabase doesn't provide progress callbacks)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const result = await uploadReferenceImage(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.url) {
        setUploadedImageUrl(result.url);
        toast.success(
          t('Imagen subida exitosamente', 'Image uploaded successfully')
        );
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(
        t(
          'Error al subir imagen. Por favor intente nuevamente.',
          'Error uploading image. Please try again.'
        )
      );
      setFormData({ ...formData, referenceImage: null });
      setImagePreviewUrl(null);
      e.target.value = ''; // Reset input
    } finally {
      setIsUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setFormData({ ...formData, referenceImage: null });
    setImagePreviewUrl(null);
    setUploadedImageUrl(null);
    // Reset file input
    const fileInput = document.getElementById('referenceImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateStep(4);
    if (!isValid) return;
    
    setIsSubmitting(true);
    setValidationError(null);
    
    try {
      const totalAmount = pricingBreakdown?.total || getCurrentTotal();
      
      let referenceImagePath = uploadedImageUrl || '';
      
      // If image was selected but not uploaded yet, upload it now
      if (formData.referenceImage && !uploadedImageUrl) {
        setIsUploadingImage(true);
        try {
          const uploadResult = await uploadReferenceImage(formData.referenceImage);
          if (uploadResult.success && uploadResult.url) {
            referenceImagePath = uploadResult.url;
          } else {
            throw new Error(uploadResult.error || 'Upload failed');
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast.error(
            t(
              'Error al subir imagen, continuando sin ella',
              'Error uploading image, continuing without it'
            )
          );
          // Continue without image
        } finally {
          setIsUploadingImage(false);
        }
      }

      const orderData = {
        customer_name: formData.customerName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_language: language, // Save customer's language preference
        date_needed: formData.dateNeeded,
        time_needed: formData.timeNeeded,
        cake_size: formData.size,
        filling: formData.filling,
        theme: formData.theme,
        dedication: formData.dedication || '',
        reference_image_path: referenceImagePath,
        delivery_option: formData.deliveryOption,
        consent_given: true,
        consent_timestamp: new Date().toISOString(),
        delivery_address: formData.deliveryOption === 'delivery' ? formData.address : '',
        delivery_apartment: formData.deliveryOption === 'delivery' ? formData.apartment : '',
        delivery_zone: formData.deliveryOption === 'delivery' ? deliveryZone : null,
        total_amount: totalAmount,
        promo_code: promoCode || null,
        user_id: user?.id || null,
        save_address: saveAddress && formData.deliveryOption === 'delivery' && user,
        address_label: saveAddress ? 'Last Used' : null,
      };
      
      // Store order data for payment checkout
      sessionStorage.setItem('pendingOrder', JSON.stringify(orderData));
      localStorage.removeItem(STORAGE_KEY);
      
      // Redirect to payment checkout page
      navigate('/payment-checkout');
      
    } catch (error: any) {
      console.error('Error preparing payment:', error);
      toast.error(
        t(
          'Error al preparar el pago. Por favor intente nuevamente.',
          'Error preparing payment. Please try again.'
        )
      );
      setIsSubmitting(false);
    }
  };

  // Step 1: Customer Info
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dateNeeded">{t('Fecha Necesaria', 'Date Needed')} *</Label>
          <Input
            id="dateNeeded"
            type="date"
            required
            min={new Date().toISOString().split('T')[0]}
            max={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            value={formData.dateNeeded}
            onChange={(e) => {
              setFormData({ ...formData, dateNeeded: e.target.value });
              setValidationError(null);
            }}
            onBlur={async () => await validateStep(1)}
            className={dateCapacity && dateCapacity.current >= dateCapacity.max ? 'border-red-500' : ''}
          />
          {dateCapacity && (
            <div className="text-sm">
              {dateCapacity.current >= dateCapacity.max ? (
                <p className="text-red-500 font-semibold">
                  {t('⚠️ Esta fecha está llena', '⚠️ This date is full')}
                </p>
              ) : (
                <p className="text-muted-foreground">
                  {t(
                    `${dateCapacity.max - dateCapacity.current} de ${dateCapacity.max} espacios disponibles`,
                    `${dateCapacity.max - dateCapacity.current} of ${dateCapacity.max} slots available`
                  )}
                </p>
              )}
            </div>
          )}
          {isCheckingCapacity && (
            <p className="text-xs text-muted-foreground">
              {t('Verificando disponibilidad...', 'Checking availability...')}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeNeeded">{t('Hora', 'Time')} *</Label>
          <Select
            value={formData.timeNeeded}
            onValueChange={(value) => {
              setFormData({ ...formData, timeNeeded: value });
              setValidationError(null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('Seleccionar hora', 'Select time')} />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {[
                '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
                '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
                '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
                '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
                '20:00', '20:30', '21:00', '21:30'
              ].map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {formData.dateNeeded && formData.timeNeeded && !validationError && (
        <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          {(() => {
            const leadTime = validateLeadTime(formData.dateNeeded, formData.timeNeeded);
            if (leadTime.isValid && leadTime.hoursUntilEvent) {
              return t(
                `Su pedido será para ${formatHoursUntilEvent(leadTime.hoursUntilEvent, true)}`,
                `Your order will be ready in ${formatHoursUntilEvent(leadTime.hoursUntilEvent, false)}`
              );
            }
            return null;
          })()}
        </div>
      )}

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
    </div>
  );

  // Step 2: Cake Details
  const renderStep2 = () => {
    if (!configurator.attributes.length) return <div>{t('Cargando opciones...', 'Loading options...')}</div>;

    return (
      <div className="space-y-6">
        {configurator.attributes.map((attr) => (
          <div key={attr.id} className="space-y-2">
            <Label htmlFor={attr.code}>{t(attr.name_es, attr.name_en)} *</Label>
            <Select
              value={formData[attr.code as keyof typeof formData] as string}
              onValueChange={(value) => setFormData({ ...formData, [attr.code]: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t(`Seleccionar ${attr.name_es}`, `Select ${attr.name_en}`)} />
              </SelectTrigger>
              <SelectContent>
                {attr.options.map((opt: any) => (
                  <SelectItem 
                    key={opt.id} 
                    value={opt.value}
                    disabled={isOptionDisabled(opt.id)}
                  >
                    {t(opt.label_es, opt.label_en)} 
                    {opt.price_adjustment > 0 && ` (+$${opt.price_adjustment})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        {/* Preview Layer (Simplified) */}
        <div className="relative h-64 w-full overflow-hidden rounded-lg border bg-muted/30">
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            {t('Vista Previa', 'Preview')}
          </div>
          {configurator.attributes.map((attr) => {
            if (!attr.is_visual) return null;
            const selectedValue = formData[attr.code as keyof typeof formData];
            const selectedOption = attr.options.find((o: any) => o.value === selectedValue);
            if (selectedOption?.image_layer_path) {
              return (
                <img
                  key={attr.id}
                  src={selectedOption.image_layer_path}
                  alt={attr.code}
                  className="absolute inset-0 h-full w-full object-contain"
                  style={{ zIndex: attr.sort_order }}
                />
              );
            }
            return null;
          })}
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
        <Label htmlFor="referenceImage">
          {t('Imagen de Referencia', 'Reference Image')}
          <span className="ml-2 text-sm text-muted-foreground">
            {t('(Opcional)', '(Optional)')}
          </span>
        </Label>
        <div className="flex flex-col gap-3">
          {/* Mobile: Show camera button */}
          {isMobile && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCamera(true)}
              className="w-full"
            >
              <Camera className="mr-2 h-4 w-4" />
              {t('Tomar Foto', 'Take Photo')}
            </Button>
          )}
          
          <div className="relative">
            <Input
              id="referenceImage"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              capture={isMobile ? 'environment' : undefined} // Use camera on mobile
              onChange={handleImageChange}
              disabled={isUploadingImage}
              className="cursor-pointer file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-secondary hover:file:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            />
          </div>
          
          {/* Camera capture modal */}
          {showCamera && (
            <CameraCapture
              onCapture={(file) => {
                setShowCamera(false);
                // Simulate file input change
                const fakeEvent = {
                  target: { files: [file], value: '' },
                } as React.ChangeEvent<HTMLInputElement>;
                handleImageChange(fakeEvent);
              }}
              onCancel={() => setShowCamera(false)}
            />
          )}

          {/* Upload Progress */}
          {isUploadingImage && (
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div className="flex-1">
                  <p className="font-sans text-sm font-medium text-foreground">
                    {t('Subiendo imagen...', 'Uploading image...')}
                  </p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {(formData.referenceImage || uploadedImageUrl) && !isUploadingImage && (
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {uploadedImageUrl ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Upload className="h-5 w-5 text-primary" />
                  )}
                  <div>
                    <p className="font-sans text-sm font-medium text-foreground">
                      {formData.referenceImage?.name || 'Image'}
                    </p>
                    {formData.referenceImage && (
                      <p className="font-sans text-xs text-muted-foreground">
                        {(formData.referenceImage.size / 1024).toFixed(1)} KB
                        {uploadedImageUrl && (
                          <span className="ml-2 text-green-600">
                            • {t('Subida', 'Uploaded')}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="h-8 w-8 p-0"
                  disabled={isUploadingImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3">
                <img
                  src={uploadedImageUrl || imagePreviewUrl || ''}
                  alt="Reference preview"
                  className="max-h-48 w-full rounded-lg object-contain"
                  onError={(e) => {
                    console.error('Image preview error');
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          <p className="font-sans text-xs text-muted-foreground">
            {t(
              'Sube una imagen de referencia para ayudarnos a crear tu pastel perfecto (JPG, PNG o WebP, máximo 5MB)',
              'Upload a reference image to help us create your perfect cake (JPG, PNG or WebP, max 5MB)'
            )}
          </p>
        </div>
      </div>
    </div>
  );
  };

  // Step 3: Pickup Information
  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Pickup Only - Delivery coming soon */}
      <div className="rounded-lg bg-primary/10 border border-primary/30 p-6 text-center">
        <h3 className="font-display text-xl font-bold mb-2">
          {t('📍 Recoger en Tienda', '📍 Store Pickup')}
        </h3>
        <p className="text-muted-foreground mb-4">
          {t(
            'Le notificaremos cuando su pedido esté listo para recoger.',
            'We will notify you when your order is ready for pickup.'
          )}
        </p>
        <div className="bg-card rounded-lg p-4 inline-block">
          <p className="font-semibold">{t('Dirección', 'Address')}:</p>
          <p className="text-muted-foreground">324 W Marshall St, Norristown, PA 19401</p>
          <p className="text-sm text-muted-foreground mt-2">
            {t('Horario de recogida', 'Pickup hours')}: 5:00 AM - 10:00 PM
          </p>
        </div>
      </div>

      {/* Hidden delivery option for future use */}
      <input type="hidden" value="pickup" />

      {/* Delivery coming soon notice */}
      <div className="rounded-lg bg-muted/50 border border-dashed p-4 text-center">
        <p className="text-sm text-muted-foreground">
          🚗 {t('Entrega a domicilio próximamente', 'Home delivery coming soon')}
        </p>
      </div>
    </div>
  );

  // Keep delivery code for future - just hide the UI
  const renderStep3_delivery_future = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{t('Entrega', 'Delivery Option')} *</Label>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg border-2 border-border p-4 transition-smooth hover:border-primary active:scale-[0.98]">
            <input
              type="radio"
              name="delivery"
              value="pickup"
              checked={formData.deliveryOption === 'pickup'}
              onChange={(e) => setFormData({ ...formData, deliveryOption: e.target.value })}
              className="h-4 w-4 text-primary"
            />
            <span className="font-sans font-semibold">{t('Recoger', 'Pickup')}</span>
          </label>
          <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg border-2 border-border p-4 transition-smooth hover:border-primary active:scale-[0.98]">
            <input
              type="radio"
              name="delivery"
              value="delivery"
              checked={formData.deliveryOption === 'delivery'}
              onChange={(e) => setFormData({ ...formData, deliveryOption: e.target.value })}
              className="h-4 w-4 text-primary"
            />
            <span className="font-sans font-semibold">{t('Entrega a Domicilio', 'Delivery')}</span>
          </label>
        </div>
      </div>

      {formData.deliveryOption === 'delivery' && (
        <>
          <div className="rounded-lg bg-accent/10 border border-accent/30 p-4 mb-4">
            <p className="text-sm font-semibold text-accent mb-2">
              🚗 {t('Área de Entrega', 'Delivery Area')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t(
                'Actualmente entregamos en Norristown y áreas cercanas (15 millas)',
                'We currently deliver to Norristown and surrounding areas (15 miles)'
              )}
            </p>
          </div>

          {/* Saved Addresses (if logged in) */}
          {user && savedAddresses.length > 0 && (
            <div className="space-y-2 mb-4">
              <Label>{t('Direcciones Guardadas', 'Saved Addresses')}</Label>
              <Select
                value={selectedAddressId?.toString() || ''}
                onValueChange={(value) => {
                  if (value === '') {
                    setSelectedAddressId(null);
                    setFormData(prev => ({
                      ...prev,
                      address: '',
                      apartment: '',
                      zipCode: '',
                    }));
                    return;
                  }
                  const addressId = parseInt(value);
                  const address = savedAddresses.find((a: any) => a.id === addressId);
                  if (address) {
                    setFormData(prev => ({
                      ...prev,
                      address: address.address,
                      apartment: address.apartment || '',
                      zipCode: address.zip_code || '',
                    }));
                    setSelectedAddressId(addressId);
                    setDeliveryZone(null); // Will be recalculated when address changes
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('Seleccionar dirección guardada', 'Select saved address')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('Nueva dirección', 'New address')}</SelectItem>
                  {savedAddresses.map((address: any) => (
                    <SelectItem key={address.id} value={address.id.toString()}>
                      {address.label} {address.is_default && `(${t('Predeterminada', 'Default')})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="address">{t('Dirección de Entrega', 'Delivery Address')} *</Label>
            <AddressAutocomplete
              value={formData.address}
              showDeliveryInfo={true}
              onChange={(value, isValid, placeDetails, deliveryInfo) => {
                let zipCode = formData.zipCode;
                if (isValid && placeDetails) {
                  // Extract zip code from place details
                  const zipComponent = placeDetails.address_components?.find(
                    (comp: any) => comp.types.includes('postal_code')
                  );
                  if (zipComponent) {
                    zipCode = zipComponent.long_name;
                  }
                  console.log('✅ Valid address selected:', placeDetails);
                  
                  if (deliveryInfo?.serviceable) {
                    setDeliveryZone(deliveryInfo.zone?.name || null);
                    toast.success(
                      t(
                        `✅ Dirección validada - ${deliveryInfo.zone?.name || 'Zona de entrega'}`,
                        `✅ Address validated - ${deliveryInfo.zone?.name || 'Delivery zone'}`
                      )
                    );
                  } else if (deliveryInfo && !deliveryInfo.serviceable) {
                    setDeliveryZone(null);
                    toast.error(
                      t(
                        '⚠️ Dirección fuera del área de entrega',
                        '⚠️ Address outside delivery area'
                      )
                    );
                  } else {
                    setDeliveryZone(null);
                    toast.success(
                      t(
                        '✅ Dirección validada con Google Maps',
                        '✅ Address validated with Google Maps'
                      )
                    );
                  }
                }
                setFormData({ ...formData, address: value, zipCode });
              }}
              placeholder={t(
                'Ej: 123 Main St, Philadelphia, PA 19020',
                'E.g: 123 Main St, Philadelphia, PA 19020'
              )}
              required={formData.deliveryOption === 'delivery'}
              className={
                formData.address && formData.address.length > 10 && !new RegExp(/^\d+.*[A-Za-z]+.*[A-Za-z]{2}/).test(formData.address)
                  ? 'border-red-500'
                  : ''
              }
            />
            {formData.address && formData.address.length > 10 && !new RegExp(/^\d+.*[A-Za-z]+.*[A-Za-z]{2}/).test(formData.address) && (
              <p className="text-xs text-red-500">
                {t(
                  'Por favor incluya: número, calle, ciudad, estado y código postal',
                  'Please include: number, street, city, state and zip code'
                )}
              </p>
            )}
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

          {/* Save Address Option (for logged-in users) */}
          {user && !selectedAddressId && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="saveAddress"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="saveAddress" className="cursor-pointer text-sm">
                {t('Guardar esta dirección para futuros pedidos', 'Save this address for future orders')}
              </Label>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Step 4: Review & Payment
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h3 className="font-display text-xl font-bold">{t('Resumen del Pedido', 'Order Summary')}</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground whitespace-nowrap mr-4">{t('Cliente', 'Customer')}:</span>
            <span className="font-semibold text-right">{formData.customerName}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground whitespace-nowrap mr-4">{t('Fecha', 'Date')}:</span>
            <span className="font-semibold text-right">{formData.dateNeeded} {formData.timeNeeded}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground whitespace-nowrap mr-4">{t('Tamaño', 'Size')}:</span>
            <span className="font-semibold text-right">{formData.size}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground whitespace-nowrap mr-4">{t('Relleno', 'Filling')}:</span>
            <span className="font-semibold text-right">{formData.filling}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground whitespace-nowrap mr-4">{t('Tema', 'Theme')}:</span>
            <span className="font-semibold text-right">{formData.theme}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground whitespace-nowrap mr-4">{t('Entrega', 'Delivery')}:</span>
            <span className="font-semibold text-right">
              {formData.deliveryOption === 'delivery' ? t('Entrega a Domicilio', 'Delivery') : t('Recoger', 'Pickup')}
            </span>
          </div>
        </div>

        {/* Promo Code */}
        <div className="pt-4 border-t">
          <Label htmlFor="promoCode">{t('Código Promocional', 'Promo Code')} (Opcional)</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="promoCode"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value.toUpperCase());
                setPromoCodeError(null);
              }}
              placeholder={t('Ingrese código', 'Enter code')}
              className="flex-1"
            />
            {promoCode && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setPromoCode('');
                  setPromoCodeError(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {promoCodeError && (
            <p className="mt-1 text-sm text-red-500">{promoCodeError}</p>
          )}
          {pricingBreakdown?.discount > 0 && (
            <p className="mt-1 text-sm text-green-600">
              {t('Descuento aplicado', 'Discount applied')}!
            </p>
          )}
        </div>

        {/* Price Breakdown */}
        {pricingBreakdown && (
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('Base', 'Base')}:</span>
              <span>{formatPrice(pricingBreakdown.basePrice)}</span>
            </div>
            {pricingBreakdown.fillingCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('Relleno', 'Filling')}:</span>
                <span>+{formatPrice(pricingBreakdown.fillingCost)}</span>
              </div>
            )}
            {pricingBreakdown.themeCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('Tema', 'Theme')}:</span>
                <span>+{formatPrice(pricingBreakdown.themeCost)}</span>
              </div>
            )}
            {pricingBreakdown.deliveryFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('Entrega', 'Delivery')}:</span>
                <span>+{formatPrice(pricingBreakdown.deliveryFee)}</span>
              </div>
            )}
            {pricingBreakdown.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('Impuestos', 'Tax')}:</span>
                <span>+{formatPrice(pricingBreakdown.tax)}</span>
              </div>
            )}
            {pricingBreakdown.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>{t('Descuento', 'Discount')}:</span>
                <span>-{formatPrice(pricingBreakdown.discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="font-sans text-lg font-semibold">
                {t('Total', 'Total')}:
              </span>
              <span className="font-display text-2xl font-bold text-primary">
                {isCalculatingPrice ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  formatPrice(pricingBreakdown.total)
                )}
              </span>
            </div>
          </div>
        )}
        
        {!pricingBreakdown && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="font-sans text-lg font-semibold">
                {t('Total Estimado', 'Estimated Total')}:
              </span>
              <span className="font-display text-2xl font-bold text-primary">
                {isCalculatingPrice ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  formatPrice(getCurrentTotal())
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center">
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="font-sans text-sm text-muted-foreground">
          {t(
            'Puede enviar su foto de referencia directamente por WhatsApp',
            'You can send your reference photo directly via WhatsApp'
          )}
        </p>
        <p className="mt-2 font-sans text-lg font-bold text-primary">📱 (610) 279-6200</p>
      </div>

      {/* Terms and Privacy Consent */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Checkbox
            id="consent"
            checked={consentGiven}
            onCheckedChange={(checked) => setConsentGiven(checked === true)}
            className="mt-1 min-h-[44px] min-w-[44px]"
            aria-required="true"
          />
          <Label
            htmlFor="consent"
            className="text-sm leading-relaxed cursor-pointer flex-1"
          >
            {isSpanish ? (
              <>
                Acepto los{' '}
                <a
                  href="/legal/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold"
                >
                  Términos de Servicio
                </a>{' '}
                y la{' '}
                <a
                  href="/legal/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold"
                >
                  Política de Privacidad
                </a>
                . Entiendo que mi información será procesada según se describe en estas políticas.
              </>
            ) : (
              <>
                I agree to the{' '}
                <a
                  href="/legal/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="/legal/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold"
                >
                  Privacy Policy
                </a>
                . I understand that my information will be processed as described in these policies.
              </>
            )}
          </Label>
        </div>
        {!consentGiven && currentStep === 4 && (
          <p className="text-sm text-destructive ml-11">
            {isSpanish
              ? 'Debe aceptar los términos para continuar'
              : 'You must agree to the terms to continue'}
          </p>
        )}
      </div>

      {/* Food Safety Disclaimer */}
      <FoodSafetyDisclaimer variant="compact" />
    </div>
  );

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
            <div className="mb-8 md:mb-12 text-center">
              <h1 className="mb-4 font-display text-3xl font-bold text-gradient-gold md:text-5xl">
                {t('Orden de Pastel Personalizado', 'Custom Cake Order')}
              </h1>
              <div className="mx-auto mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent" />
            </div>

            <OrderProgress currentStep={currentStep} totalSteps={4} />

            <ShineBorder
              borderRadius={16}
              borderWidth={2}
              duration={10}
              color={['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3']}
              className="bg-transparent p-0"
            >
              <div className="relative z-10 space-y-6 rounded-2xl bg-card p-4 md:p-8">
                {validationError && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm font-medium">{validationError}</p>
                  </div>
                )}

                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}

                <div className="flex flex-col-reverse gap-3 pt-6 border-t md:flex-row md:gap-4">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1 w-full md:w-auto"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {t('Atrás', 'Back')}
                    </Button>
                  )}
                  {currentStep < 4 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 w-full md:w-auto"
                    >
                      {t('Siguiente', 'Next')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting || isUploadingImage || !consentGiven}
                      className="flex-1 w-full md:w-auto bg-primary text-secondary"
                    >
                      {isSubmitting || isUploadingImage ? (
                        <>
                          <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
                          {isUploadingImage
                            ? t('Subiendo imagen...', 'Uploading image...')
                            : t('Procesando...', 'Processing...')}
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-5 w-5" />
                          {t('Continuar al Pago', 'Continue to Payment')}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </ShineBorder>
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Confetti celebration animation */}
      <Confetti ref={confettiRef} />
    </div>
  );
};

export default Order;
