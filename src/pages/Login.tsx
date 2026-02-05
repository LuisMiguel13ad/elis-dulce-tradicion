import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, AlertCircle, Store } from 'lucide-react';
// Fixed import pointing to the correct logo location
import TransparentLogo from '../assets/brand/logo.png';

const Login = () => {
  const { t } = useLanguage();
  const { signIn, user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const message = location.state?.message;

  // Auto-redirect authenticated users to their dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const role = user.profile?.role;
      if (role === 'owner') navigate('/owner-dashboard', { replace: true });
      else if (role === 'baker') navigate('/front-desk', { replace: true });
      else if (role) navigate('/', { replace: true });
      // If role is undefined/null, do nothing — wait for profile to load
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn(formData.email, formData.password);

      if (result.success) {
        // Use the returned role for immediate navigation
        // Fallback to user state if needed (though user state might be stale)
        const role = result.role || user?.profile?.role;

        if (role === 'owner') {
          navigate('/owner-dashboard');
        } else if (role === 'baker') {
          navigate('/front-desk');
        } else {
          // If no role is found yet, maybe wait or go to home.
          // For now, let's assume if success=true, we should have a role.
          // If we don't, it might be a race condition.
          // BUT, we know we just fetched it in signIn.
          if (role) {
            navigate('/');
          } else {
            // Emergency fallback if role fetch failed but auth succeeded
            navigate('/');
          }
        }
      } else {
        setError(result.error || t('Error al iniciar sesión', 'Error signing in'));
      }
    } catch (err) {
      setError(t('Ocurrió un error inesperado', 'An unexpected error occurred'));
    } finally {
      setIsSubmitting(false);
    }
  };



  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-[#C6A649]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white flex items-center justify-center relative overflow-hidden px-4 selection:bg-[#C6A649]/30">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#C6A649]/5 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/40 hover:text-[#C6A649] transition-all z-20 group">
        <Store className="h-5 w-5 group-hover:scale-110 transition-transform" />
        <span className="text-sm font-black uppercase tracking-widest">{t('Volver al Inicio', 'Back to Home')}</span>
      </Link>

      <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative z-10 transition-all duration-500 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="space-y-2 text-center pb-6 pt-12 px-8">
          <div className="flex justify-center mb-10 group">
            <div className="relative">
              <div className="absolute -inset-4 bg-[#C6A649]/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img src={TransparentLogo} alt="Eli's Logo" className="h-24 object-contain drop-shadow-2xl relative z-10 transition-transform duration-700 group-hover:scale-110" />
            </div>
          </div>
          <span className="text-xs font-black tracking-[0.4em] text-[#C6A649] uppercase block mb-2">{t('Dulce Tradición', 'Sweet Tradition')}</span>
          <CardTitle className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
            {t('Bienvenido', 'Welcome Back')}
          </CardTitle>
          <CardDescription className="text-gray-400 text-lg font-light italic font-serif">
            {t(
              'Ingresa a tu cuenta para administrar',
              'Access your dashboard to manage'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-10 pb-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <Alert className="bg-[#C6A649]/10 border-[#C6A649]/30 text-[#C6A649] rounded-2xl">
                <AlertDescription className="font-bold uppercase tracking-wide text-xs">{message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-200 rounded-2xl">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="font-bold uppercase tracking-wide text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-gray-500 ml-4">
                  {t('Email', 'Email Address')}
                </Label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-[#C6A649]/5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C6A649] transition-colors z-10" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('ejemplo@email.com', 'example@email.com')}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#C6A649]/50 focus:ring-[#C6A649]/20 transition-all h-14 rounded-2xl font-bold"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-4">
                  <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-gray-500">
                    {t('Contraseña', 'Password')}
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-[10px] font-black uppercase tracking-widest text-[#C6A649] hover:text-white transition-colors"
                  >
                    {t('¿Olvidaste tu contraseña?', 'Forgot?')}
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-[#C6A649]/5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C6A649] transition-colors z-10" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('Ingresa tu contraseña', 'Enter your password')}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#C6A649]/50 focus:ring-[#C6A649]/20 transition-all h-14 rounded-2xl font-bold"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#C6A649] text-black hover:bg-white font-black uppercase tracking-widest h-14 text-base shadow-[0_10px_30px_rgba(198,166,73,0.3)] hover:shadow-[0_15px_40px_rgba(198,166,73,0.4)] transition-all rounded-2xl hover:scale-105"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  {t('Iniciando sesión...', 'Signing in...')}
                </>
              ) : (
                t('Iniciar Sesión', 'Authorize & Sign In')
              )}
            </Button>

            <div className="text-center text-xs font-bold uppercase tracking-widest text-gray-500">
              {t('¿No tienes una cuenta?', "Don't have an account?")}{' '}
              <Link
                to="/signup"
                className="text-[#C6A649] hover:text-white transition-colors"
              >
                {t('Regístrate', 'Create Account')}
              </Link>
            </div>
          </form>

          {/* DEV: SEED ORDERS BUTTON */}
          <div className="pt-4 border-t border-white/10 mt-6">
            <Button
              type="button"
              variant="outline"
              className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10 font-bold uppercase tracking-widest h-12 rounded-xl"
              onClick={async () => {
                try {
                  const { api } = await import('@/lib/api');
                  const toast = (await import('sonner')).toast;

                  toast.info('Seeding 4 test orders...');

                  const orders = [
                    {
                      customer_name: 'Match Test 1',
                      customer_email: 'test1@example.com',
                      customer_phone: '555-555-5555',
                      date_needed: '2026-05-30',
                      time_needed: '10:00',
                      cake_size: '6" Round (6-8 ppl)',
                      filling: 'Strawberry',
                      theme: 'Standard',
                      delivery_option: 'pickup',
                      total_amount: 45.00,
                      order_details: 'Match Test 1',
                      payment_status: 'paid',
                      status: 'pending'
                    },
                    {
                      customer_name: 'Spanish Delivery',
                      customer_email: 'test2@example.com',
                      customer_phone: '555-555-5556',
                      date_needed: '2026-06-01',
                      time_needed: '14:00',
                      cake_size: '10" Round (20-25 ppl)',
                      filling: 'Chocolate',
                      theme: 'Standard',
                      delivery_option: 'delivery',
                      total_amount: 85.00,
                      order_details: 'Spanish Delivery Order',
                      payment_status: 'paid',
                      status: 'pending'
                    },
                    {
                      customer_name: 'English Delivery',
                      customer_email: 'test3@example.com',
                      customer_phone: '555-555-5557',
                      date_needed: '2026-06-15',
                      time_needed: '09:00',
                      cake_size: 'Half Sheet (40-50 ppl)',
                      filling: 'Vanilla',
                      theme: 'Standard',
                      delivery_option: 'delivery',
                      total_amount: 150.00,
                      order_details: 'English Delivery Order',
                      payment_status: 'paid',
                      status: 'pending'
                    },
                    {
                      customer_name: 'Spanish Pickup',
                      customer_email: 'test4@example.com',
                      customer_phone: '555-555-5558',
                      date_needed: '2026-07-20',
                      time_needed: '16:00',
                      cake_size: 'Quarter Sheet (20-25 ppl)',
                      filling: 'Pineapple',
                      theme: 'Standard',
                      delivery_option: 'pickup',
                      total_amount: 65.00,
                      order_details: 'Spanish Pickup Order',
                      payment_status: 'paid',
                      status: 'pending'
                    }
                  ];

                  for (const order of orders) {
                    // Generate a random order number for the seed
                    const orderNum = 'ORD-' + Math.floor(Math.random() * 100000);
                    await api.createOrder({ ...order, order_number: orderNum });
                  }

                  toast.success('Orders Seeded Successfully!');
                } catch (err) {
                  console.error(err);
                  alert('Error seeding orders (check console)');
                }
              }}
            >
              DEV: SEED TEST ORDERS
            </Button>
          </div>


        </CardContent>
      </Card>

      <div className="absolute bottom-8 w-full text-center text-white/10 text-[10px] font-black tracking-[0.5em] uppercase pointer-events-none">
        Eli's Dulce Tradición • Est. 2024 • Admin Portal
      </div>
    </div>
  );
};

export default Login;
