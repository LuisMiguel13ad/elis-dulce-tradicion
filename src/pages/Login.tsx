import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, AlertCircle, ChefHat, Crown, UtensilsCrossed, Store } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
// Fixed import pointing to the correct logo location
import TransparentLogo from '../assets/brand/logo.png';

const Login = () => {
  const { t } = useLanguage();
  const { signIn, signOut, user, isLoading, isAuthenticated, devLogin, isDevMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const message = location.state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn(formData.email, formData.password);

      if (result.success) {
        const role = user?.profile?.role;
        if (role === 'owner') {
          navigate('/owner-dashboard');
        } else if (role === 'baker') {
          navigate('/front-desk');
        } else {
          navigate('/');
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

  const handleDevLogin = (role: 'owner' | 'baker', destination?: string) => {
    devLogin(role);
    setTimeout(() => {
      if (destination) {
        navigate(destination);
      } else if (role === 'owner') {
        navigate('/owner-dashboard');
      } else {
        navigate('/baker-station');
      }
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-[#C6A649]" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    const role = user.profile?.role;
    const dashboardPath = role === 'owner' ? '/owner-dashboard' : '/front-desk';

    return (
      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C6A649]/5 rounded-full blur-[150px] pointer-events-none" />

        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/50 hover:text-[#C6A649] transition-all z-20 group">
          <Store className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-black uppercase tracking-widest">{t('Volver al Inicio', 'Back to Home')}</span>
        </Link>

        <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative z-10 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="space-y-4 text-center pb-8 pt-12">
            <CardTitle className="text-3xl font-black text-white uppercase tracking-tighter">
              {t('Ya has iniciado sesión', 'Already Logged In')}
            </CardTitle>
            <div className="h-1 w-20 bg-[#C6A649] mx-auto rounded-full" />
            <CardDescription className="text-gray-400 text-base font-light italic font-serif">
              {t('Conectado como', 'Logged in as')} <strong className="text-[#C6A649] font-black">{user.profile?.full_name || user.email}</strong>
              <span className="block text-xs mt-2 uppercase tracking-[0.2em] text-[#C6A649]/60">({user.profile?.role})</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-10 pb-12">
            <Button
              className="w-full bg-[#C6A649] text-black hover:bg-white font-black uppercase tracking-widest h-14 rounded-2xl shadow-[0_10px_30px_rgba(198,166,73,0.3)] transition-all hover:scale-105"
              onClick={() => navigate(dashboardPath)}
            >
              {t('Ir al Panel', 'Go to Dashboard')}
            </Button>
            <Button
              variant="outline"
              className="w-full border-white/10 text-white hover:bg-white/5 hover:text-white font-black uppercase tracking-widest h-14 rounded-2xl transition-all"
              onClick={async () => {
                await signOut();
              }}
            >
              {t('Cerrar Sesión', 'Logout')}
            </Button>

            {isDevMode && (
              <>
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-4 text-gray-500 font-bold tracking-widest">Switch Account</span></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDevLogin('owner')}
                    className="flex flex-col items-center gap-2 h-auto py-4 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/40 text-amber-200 rounded-2xl transition-all"
                  >
                    <Crown className="h-6 w-6 text-amber-400" />
                    <span className="text-[10px] uppercase font-black tracking-widest">Owner</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDevLogin('baker', '/front-desk')}
                    className="flex flex-col items-center gap-2 h-auto py-4 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40 text-blue-200 rounded-2xl transition-all"
                  >
                    <Store className="h-6 w-6 text-blue-400" />
                    <span className="text-[10px] uppercase font-black tracking-widest">Front</span>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
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

          {isDevMode && (
            <>
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
                <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-transparent px-4 text-gray-600 font-black tracking-[0.3em]">Developer Access</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDevLogin('owner')}
                  className="flex flex-col items-center gap-2 h-auto py-4 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/40 text-amber-200 rounded-2xl transition-all"
                >
                  <Crown className="h-6 w-6 text-amber-400" />
                  <span className="text-[10px] font-black tracking-widest uppercase">Owner</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDevLogin('baker', '/front-desk')}
                  className="flex flex-col items-center gap-2 h-auto py-4 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40 text-blue-200 rounded-2xl transition-all"
                >
                  <Store className="h-6 w-6 text-blue-400" />
                  <span className="text-[10px] font-black tracking-widest uppercase">Front</span>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="absolute bottom-8 w-full text-center text-white/10 text-[10px] font-black tracking-[0.5em] uppercase pointer-events-none">
        Eli's Dulce Tradición • Est. 2024 • Admin Portal
      </div>
    </div>
  );
};

export default Login;
