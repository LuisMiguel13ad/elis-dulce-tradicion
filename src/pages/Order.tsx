/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLanguage } from '@/contexts/LanguageContext';
import { Upload, Check, Clock, User, Camera, X, Loader2, AlertCircle, ShoppingBag, Calendar, Sparkles, MapPin, ChevronRight, ChevronLeft, Star } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { validateLeadTime, validateOrderDateTimeComplete } from '@/lib/validation';
import { useNavigate } from 'react-router-dom';
import { uploadReferenceImage } from '@/lib/storage';
import { isValidImageType, isValidFileSize } from '@/lib/imageCompression';
import { useOptimizedPricing } from '@/lib/hooks/useOptimizedPricing';
import { useIsMobile } from '@/hooks/use-mobile';
import { CameraCapture } from '@/components/mobile/CameraCapture';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/pricing';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'bakery_order_draft';

// --- CONSTANTS ---
const CAKE_SIZES = [
  { value: 'quarter-sheet', label: '1/4 Sheet', labelEs: '1/4 Plancha', price: 45, serves: '20-25', featured: false },
  { value: 'half-sheet', label: '1/2 Sheet', labelEs: '1/2 Plancha', price: 75, serves: '40-50', featured: true },
  { value: 'full-sheet', label: 'Full Sheet', labelEs: 'Plancha Completa', price: 140, serves: '90-100', featured: false },
  { value: '8-round', label: '8" Round', labelEs: '8" Redondo', price: 35, serves: '10-12', featured: false },
  { value: '10-round', label: '10" Round', labelEs: '10" Redondo', price: 50, serves: '20-25', featured: false },
  { value: '12-round', label: '12" Round', labelEs: '12" Redondo', price: 65, serves: '30-35', featured: false },
];

const BREAD_TYPES = [
  { value: 'tres-leches', label: '3 Leches', desc: 'Moist & Traditional' },
  { value: 'chocolate', label: 'Chocolate', desc: 'Rich & Decadent' },
  { value: 'vanilla', label: 'Regular', desc: 'Classic Vanilla' },
];

const FILLINGS = [
  { value: 'strawberry', label: 'Fresa', sub: 'Strawberry' },
  { value: 'chocolate-chip', label: 'Choco Chip', sub: 'Dark Chocolate' },
  { value: 'mocha', label: 'Mocha', sub: 'Coffee Blend' },
  { value: 'mousse', label: 'Mousse', sub: 'Whipped' },
  { value: 'napolitano', label: 'Napolitano', sub: 'Mix' },
  { value: 'pecan', label: 'Nuez', sub: 'Pecan' },
  { value: 'coconut', label: 'Coco', sub: 'Coconut' },
  { value: 'pineapple', label: 'Piña', sub: 'Pineapple' },
  { value: 'pina-colada', label: 'Piña Colada', sub: 'Tropical' },
  { value: 'peach', label: 'Durazno', sub: 'Peach' },
  { value: 'tiramisu', label: 'Tiramisu', sub: 'Italian Style' },
  { value: 'oreo', label: 'Oreo', sub: 'Cookies & Cream' },
  { value: 'red-velvet', label: 'Red Velvet', sub: 'Cream Cheese' },
];

const TIME_OPTIONS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00'
];

const formatTimeDisplay = (time: string) => {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

// --- ANIMATION VARIANTS ---
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
    position: 'absolute' as const,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    position: 'relative' as const,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    position: 'absolute' as const,
  })
};

// --- CUSTOM COMPONENTS ---
const FloatingInput = ({ label, value, onChange, type = "text", placeholder, icon: Icon, maxLength, className }: any) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`relative group ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-r from-amber-200/20 to-orange-100/20 rounded-2xl transition-all duration-300 ${focused ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} />
      <div className={`relative bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm rounded-2xl overflow-hidden transition-all duration-300 group-hover:shadow-md ${focused ? 'ring-2 ring-amber-400/50 shadow-lg shadow-amber-100' : 'hover:border-amber-200/50'}`}>
        <label className={`absolute left-10 transition-all duration-200 pointer-events-none text-gray-500 font-medium ${focused || value ? 'top-2 text-[10px] text-amber-600 font-bold tracking-wider uppercase' : 'top-4 text-sm'}`}>
          {label}
        </label>
        {Icon && (
          <div className={`absolute left-3 top-4 transition-colors duration-300 ${focused ? 'text-amber-500' : 'text-gray-400'}`}>
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={maxLength}
          className="w-full bg-transparent p-4 pl-10 pt-5 text-gray-800 font-semibold placeholder-transparent focus:outline-none min-h-[60px]"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const Order = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isSpanish = language === 'es';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Steps definition
  const STEPS = [
    { id: 'date', title: t('Fecha', 'Date'), subtitle: t('¿Cuándo lo necesitas?', 'When needed?') },
    { id: 'size', title: t('Tamaño', 'Size'), subtitle: t('¿Para cuántas personas?', 'How many people?') },
    { id: 'flavor', title: t('Sabor', 'Flavor'), subtitle: t('Pan y Relleno', 'Bread & Filling') },
    { id: 'details', title: t('Detalles', 'Details'), subtitle: t('Personalización', 'Customization') },
    { id: 'info', title: t('Contacto', 'Contact'), subtitle: t('Tus datos', 'Your info') },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const [formData, setFormData] = useState({
    dateNeeded: '',
    timeNeeded: '',
    customerName: '',
    phone: '',
    email: '',
    pickupType: 'pickup',
    cakeSize: '',
    breadType: 'tres-leches',
    filling: '',
    theme: '',
    dedication: '',
  });

  const [selectedFillings, setSelectedFillings] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  // --- LOGIC HOOKS ---
  useEffect(() => {
    if (user && user.profile) {
      setFormData(prev => ({
        ...prev,
        customerName: user.profile.full_name || prev.customerName,
        email: user.email || prev.email,
        phone: user.profile.phone || prev.phone,
      }));
    }
  }, [user]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
        if (parsed.selectedFillings) setSelectedFillings(parsed.selectedFillings);
        // Note: We don't restore currentStep to avoid confusion, user starts fresh or at beginning
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const dataToSave = { ...formData, selectedFillings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData, selectedFillings]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const { pricingBreakdown, isLoading: isCalculatingPrice } = useOptimizedPricing({
    size: formData.cakeSize,
    filling: formData.breadType,
    theme: formData.theme || 'custom',
    deliveryOption: formData.pickupType as 'pickup' | 'delivery',
  });

  const getBasePrice = () => {
    const size = CAKE_SIZES.find(s => s.value === formData.cakeSize);
    return size?.price || 0;
  };

  const getTotal = () => {
    if (pricingBreakdown) return pricingBreakdown.total;
    return getBasePrice();
  };

  const toggleFilling = (filling: string) => {
    setSelectedFillings(prev => {
      if (prev.includes(filling)) return prev.filter(f => f !== filling);
      return [...prev, filling];
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    let formatted = '';
    if (digits.length > 0) formatted = '(' + digits.slice(0, 3);
    if (digits.length > 3) formatted += ') ' + digits.slice(3, 6);
    if (digits.length > 6) formatted += '-' + digits.slice(6, 10);
    setFormData({ ...formData, phone: formatted });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (!isValidImageType(file)) {
      toast.error(t('Tipo de archivo no válido. Solo JPG, PNG o WebP.', 'Invalid file type. Only JPG, PNG or WebP.'));
      return;
    }
    if (!isValidFileSize(file)) {
      toast.error(t('Archivo muy grande. Máximo 5MB.', 'File too large. Max 5MB.'));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
    setIsUploadingImage(true);

    try {
      const result = await uploadReferenceImage(file);
      if (result.success && result.url) {
        setUploadedImageUrl(result.url);
        toast.success(t('Imagen subida', 'Image uploaded'));
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(t('Error al subir imagen', 'Error uploading image'));
      setImagePreviewUrl(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagePreviewUrl(null);
    setUploadedImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- NAVIGATION VALIDATION ---
  const validateStep = async (stepIndex: number): Promise<boolean> => {
    setValidationError(null);
    const stepId = STEPS[stepIndex].id;

    if (stepId === 'date') {
      if (!formData.dateNeeded || !formData.timeNeeded) {
        setValidationError(t('Selecciona fecha y hora', 'Select date and time'));
        return false;
      }
      const validation = await validateOrderDateTimeComplete(formData.dateNeeded, formData.timeNeeded);
      if (!validation.isValid) {
        setValidationError(validation.errors.join(', '));
        return false;
      }
    }

    if (stepId === 'size') {
      if (!formData.cakeSize) {
        setValidationError(t('Debes seleccionar un tamaño', 'Must select a size'));
        return false;
      }
    }

    if (stepId === 'info') {
      if (!formData.customerName.trim()) {
        setValidationError(t('Tu nombre es requerido', 'Name is required'));
        return false;
      }
      if (formData.phone.replace(/\D/g, '').length !== 10) {
        setValidationError(t('Teléfono incompleto', 'Phone incomplete'));
        return false;
      }
      if (!consentGiven) {
        setValidationError(t('Marca la casilla de confirmación', 'Check the confirmation box'));
        return false;
      }
    }

    return true;
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      if (currentStep < STEPS.length - 1) {
        setDirection(1);
        setCurrentStep(c => c + 1);
      } else {
        handleSubmit();
      }
    } else {
      // Shake animation triggering could be added here
      toast.error(validationError || t('Completa este paso', 'Complete this step'));
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(c => c - 1);
      setValidationError(null);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      const selectedSize = CAKE_SIZES.find(s => s.value === formData.cakeSize);

      const orderData = {
        customer_name: formData.customerName,
        customer_email: formData.email || undefined,
        customer_phone: `+1${cleanPhone}`,
        customer_language: language,
        date_needed: formData.dateNeeded,
        time_needed: formData.timeNeeded,
        cake_size: selectedSize?.label || formData.cakeSize,
        filling: selectedFillings.join(', ') || formData.breadType,
        theme: formData.theme || 'Custom',
        dedication: formData.dedication || '',
        reference_image_path: uploadedImageUrl || '',
        delivery_option: formData.pickupType,
        consent_given: true,
        consent_timestamp: new Date().toISOString(),
        total_amount: getTotal(),
        user_id: user?.id || null,
      };

      sessionStorage.setItem('pendingOrder', JSON.stringify(orderData));
      localStorage.removeItem(STORAGE_KEY);
      navigate('/payment-checkout');
    } catch (error: any) {
      console.error('Error preparing payment:', error);
      toast.error(t('Error del sistema', 'System error'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen font-sans pb-32 relative bg-[#FDFBF7] flex flex-col">

      {/* --- BACKGROUND ANIMATION --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.08),transparent_70%)]"
        />
        <motion.div
          animate={{ y: [0, -50, 0], x: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_50%_50%,rgba(255,165,0,0.05),transparent_60%)] filter blur-3xl opacity-60"
        />
      </div>

      {/* --- TOP BAR --- */}
      <div className="h-1.5 w-full flex sticky top-0 z-50 shadow-sm opacity-90">
        <div className="h-full w-1/3 bg-green-600/90 backdrop-blur-sm"></div>
        <div className="h-full w-1/3 bg-white/90 backdrop-blur-sm"></div>
        <div className="h-full w-1/3 bg-red-600/90 backdrop-blur-sm"></div>
      </div>

      {/* --- HEADER --- */}
      <header className="bg-white/80 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.03)] p-4 sticky top-1.5 z-40 border-b border-white/50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => currentStep > 0 ? prevStep() : navigate('/')}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft size={20} strokeWidth={3} />
            </button>
            <button className="cursor-pointer group text-left" onClick={() => navigate('/')}>
              <h1 className="text-lg font-black tracking-tight text-gray-900 group-hover:text-amber-600 transition-colors flex items-center gap-2">
                ELI'S BAKERY <Sparkles size={14} className="text-amber-400 fill-amber-400" />
              </h1>
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 w-3 sm:w-6 rounded-full transition-all duration-300 ${i <= currentStep ? 'bg-amber-500' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
      </header>

      {/* --- CONTENT WIZARD --- */}
      <main className="flex-1 flex flex-col justify-center items-center p-5 relative z-10 w-full max-w-md mx-auto min-h-[60vh]">

        {/* Step Title */}
        <div className="w-full mb-8 text-center">
          <motion.div
            key={currentStep}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-block"
          >
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{STEPS[currentStep].title}</h2>
            <p className="text-gray-500 font-medium">{STEPS[currentStep].subtitle}</p>
          </motion.div>
        </div>

        {/* Validation Error */}
        <AnimatePresence>
          {validationError && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 20 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="w-full flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-red-700 backdrop-blur-md"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-bold">{validationError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 min-h-[300px] flex flex-col justify-center"
          >
            {/* --- STEP 1: DATE --- */}
            {STEPS[currentStep].id === 'date' && (
              <div className="space-y-6">
                <div className="relative">
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    value={formData.dateNeeded}
                    onChange={(e) => setFormData({ ...formData, dateNeeded: e.target.value })}
                    className="w-full bg-white/50 border-2 border-transparent focus:border-amber-400 hover:bg-white transition-all rounded-2xl p-4 text-center text-lg font-bold text-gray-800 outline-none shadow-inner"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500">
                    <Calendar size={20} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block text-center">{t('Hora de Entrega', 'Pickup Time')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_OPTIONS.map(time => (
                      <button
                        key={time}
                        onClick={() => setFormData({ ...formData, timeNeeded: time })}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${formData.timeNeeded === time
                          ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-500/30'
                          : 'bg-white border-gray-100 text-gray-600 hover:border-amber-200 hover:bg-amber-50'
                          }`}
                      >
                        {formatTimeDisplay(time)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lead Time Display */}
                {formData.dateNeeded && formData.timeNeeded && (
                  <div className="flex justify-center">
                    {(() => {
                      const leadTime = validateLeadTime(formData.dateNeeded, formData.timeNeeded);
                      if (leadTime.isValid && leadTime.hoursUntilEvent) {
                        const days = Math.floor(leadTime.hoursUntilEvent / 24);
                        return (
                          <div className="flex items-center gap-2 text-green-600 text-xs font-bold bg-green-50 px-3 py-1 rounded-full">
                            <Check size={12} strokeWidth={3} /> {days} {t('días para preparar', 'days to prepare')}
                          </div>
                        )
                      }
                      return (
                        <div className="flex items-center gap-2 text-amber-600 text-xs font-bold bg-amber-50 px-3 py-1 rounded-full">
                          <Clock size={12} strokeWidth={3} /> {t('Mínimo 48h requerido', 'Min 48h required')}
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* --- STEP 2: SIZE --- */}
            {STEPS[currentStep].id === 'size' && (
              <div className="grid grid-cols-2 gap-3">
                {CAKE_SIZES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setFormData({ ...formData, cakeSize: s.value })}
                    className={`relative p-4 rounded-2xl text-left transition-all border-2 overflow-hidden ${formData.cakeSize === s.value
                      ? 'bg-gradient-to-br from-amber-50 to-white border-amber-400 shadow-lg shadow-amber-200/50'
                      : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50 shadow-sm'
                      }`}
                  >
                    {s.featured && (
                      <div className="absolute top-0 right-0 bg-amber-400 text-[9px] font-black text-white px-2 py-0.5 rounded-bl-lg uppercase tracking-wide">
                        Popular
                      </div>
                    )}
                    <div className="text-xs text-gray-400 font-bold mb-1">{s.serves} {t('pers', 'ppl')}</div>
                    <div className="font-black text-gray-800 text-sm mb-2 leading-tight">{isSpanish ? s.labelEs : s.label}</div>
                    <div className={`text-lg font-black ${formData.cakeSize === s.value ? 'text-amber-600' : 'text-gray-900'}`}>${s.price}</div>

                    {formData.cakeSize === s.value && (
                      <div className="absolute bottom-3 right-3 text-amber-500">
                        <Check size={20} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* --- STEP 3: FLAVOR --- */}
            {STEPS[currentStep].id === 'flavor' && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">{t('Tipo de Pan', 'Bread Type')}</label>
                  <div className="flex flex-col gap-2">
                    {BREAD_TYPES.map(type => (
                      <button
                        key={type.value}
                        onClick={() => setFormData({ ...formData, breadType: type.value })}
                        className={`p-4 rounded-2xl flex items-center justify-between border-2 transition-all ${formData.breadType === type.value
                          ? 'bg-gray-800 border-gray-800 text-white shadow-lg shadow-gray-400/30'
                          : 'bg-white border-transparent text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        <div className="text-left">
                          <div className="font-bold">{type.label}</div>
                          <div className={`text-xs ${formData.breadType === type.value ? 'text-gray-400' : 'text-gray-400'}`}>{type.desc}</div>
                        </div>
                        {formData.breadType === type.value && <Check size={18} className="text-amber-400" strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">{t('Relleno', 'Filling')} <span className="text-gray-300 font-normal">(Optional)</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {FILLINGS.map(f => {
                      const isSelected = selectedFillings.includes(f.value);
                      return (
                        <button
                          key={f.value}
                          onClick={() => toggleFilling(f.value)}
                          className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${isSelected
                            ? 'bg-amber-50 border-amber-400 text-amber-900'
                            : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'
                            }`}
                        >
                          <div className="relative z-10">
                            <div className="text-xs font-bold mb-0.5">{f.label}</div>
                            <div className="text-[10px] opacity-70 leading-none">{f.sub}</div>
                          </div>
                          {isSelected && <div className="absolute inset-0 bg-amber-100/50 z-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* --- STEP 4: DETAILS --- */}
            {STEPS[currentStep].id === 'details' && (
              <div className="space-y-4">
                <FloatingInput
                  label={t('Tema', 'Theme')}
                  value={formData.theme}
                  onChange={(e: any) => setFormData({ ...formData, theme: e.target.value })}
                  icon={Sparkles}
                  placeholder="e.g. Birthday, Wedding..."
                />
                <FloatingInput
                  label={t('Dedicatoria', 'Message')}
                  value={formData.dedication}
                  onChange={(e: any) => setFormData({ ...formData, dedication: e.target.value })}
                  icon={Star}
                  placeholder="e.g. Happy Birthday!"
                />

                {/* Photo Upload */}
                <div className="relative mt-4">
                  {!imagePreviewUrl ? (
                    <div className="grid grid-cols-2 gap-3">
                      {isMobile && (
                        <button
                          onClick={() => setShowCamera(true)}
                          className="bg-amber-50/50 border-2 border-dashed border-amber-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-amber-100/50 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center">
                            <Camera size={24} />
                          </div>
                          <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">{t('Cámara', 'Camera')}</span>
                        </button>
                      )}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors ${!isMobile ? 'col-span-2' : ''
                          }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-white border border-gray-200 text-gray-400 flex items-center justify-center">
                          <Upload size={24} />
                        </div>
                        <div className="text-center">
                          <span className="text-xs font-bold text-gray-600 uppercase tracking-wide block">{t('Subir Foto', 'Upload')}</span>
                          <span className="text-[9px] text-gray-400 uppercase tracking-wider">JPG, PNG</span>
                        </div>
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden shadow-lg group h-48">
                      <img src={imagePreviewUrl} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={handleRemoveImage} className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-red-500/80 transition-all">
                          <X size={24} />
                        </button>
                      </div>
                      {isUploadingImage && (
                        <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                          <Loader2 className="animate-spin text-amber-500" size={32} />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {showCamera && (
                  <CameraCapture
                    onCapture={(file) => {
                      const fake = { target: { files: [file], value: '' } } as unknown as React.ChangeEvent<HTMLInputElement>;
                      handleImageChange(fake);
                      setShowCamera(false);
                    }}
                    onCancel={() => setShowCamera(false)}
                  />
                )}
              </div>
            )}

            {/* --- STEP 5: CONTACT INFO --- */}
            {STEPS[currentStep].id === 'info' && (
              <div className="space-y-4">
                <FloatingInput
                  label={t('Nombre', 'Name')}
                  icon={User}
                  value={formData.customerName}
                  onChange={(e: any) => setFormData({ ...formData, customerName: e.target.value })}
                />
                <FloatingInput
                  label={t('Teléfono', 'Phone')}
                  type="tel"
                  icon={null}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  maxLength={14}
                  placeholder="(555) 555-5555"
                />

                <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex gap-2">
                  <button
                    onClick={() => setFormData({ ...formData, pickupType: 'pickup' })}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${formData.pickupType === 'pickup'
                      ? 'bg-green-100 text-green-700 shadow-none'
                      : 'text-gray-400 hover:bg-gray-50'
                      }`}
                  >
                    <ShoppingBag size={16} /> Pickup
                  </button>
                  <div className="w-px bg-gray-100 my-2"></div>
                  <button
                    disabled
                    className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-gray-300 cursor-not-allowed"
                  >
                    <MapPin size={16} /> Delivery
                  </button>
                </div>

                <label className="flex items-center gap-4 cursor-pointer group p-2">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${consentGiven ? 'bg-amber-500 border-amber-500 text-white' : 'border-gray-300 group-hover:border-amber-400'
                    }`}>
                    <Check size={14} strokeWidth={4} />
                  </div>
                  <input type="checkbox" checked={consentGiven} onChange={e => setConsentGiven(e.target.checked)} className="hidden" />
                  <div className="text-xs text-gray-500 font-medium">
                    {t('Acepto los términos y confirmo que los detalles son correctos.', 'I accept terms and confirm details are correct.')}
                  </div>
                </label>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* --- WIZARD NAVIGATION --- */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-md mx-auto bg-gray-900 rounded-3xl p-4 shadow-2xl shadow-gray-900/40 flex justify-between items-center pr-3">
          <div className="flex flex-col pl-2">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('Total', 'Total')}</span>
            <span className="text-xl font-black text-white tracking-tight">
              {isCalculatingPrice ? <Loader2 className="inline animate-spin text-amber-400" size={16} /> : formatPrice(getTotal())}
            </span>
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="w-12 h-12 rounded-2xl bg-gray-800 text-gray-400 flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft size={20} strokeWidth={3} />
              </button>
            )}

            <button
              onClick={nextStep}
              disabled={isSubmitting || isUploadingImage}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wide flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all min-w-[120px] justify-center"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                currentStep === STEPS.length - 1 ? (
                  <>{t('Ordenar', 'Order')} <Check size={16} strokeWidth={4} /></>
                ) : (
                  <>{t('Siguiente', 'Next')} <ChevronRight size={16} strokeWidth={4} /></>
                )
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
