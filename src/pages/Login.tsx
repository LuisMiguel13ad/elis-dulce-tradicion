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
import TransparentLogo from '../assets/TransparentLogo.png';

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

  // Get redirect message from location state
  const message = location.state?.message;

  // Note: We no longer auto-redirect so users can switch accounts or logout

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn(formData.email, formData.password);

      if (result.success) {
        // Navigation will happen automatically via useEffect
        const role = user?.profile?.role;
        if (role === 'owner') {
          navigate('/owner-dashboard');
        } else if (role === 'baker') {
          navigate('/baker-station');
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
    // Navigate after dev login
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If already logged in
  if (isAuthenticated && user) {
    const role = user.profile?.role;
    const dashboardPath = role === 'owner' ? '/owner-dashboard' : '/baker-station';

    return (
      <div className="min-h-screen w-full bg-[#1a1a1a] text-white flex items-center justify-center relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#C6A649]/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[100px]" />

        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/50 hover:text-[#C6A649] transition-colors z-20">
          <Store className="h-5 w-5" />
          <span className="text-sm font-medium tracking-wide">Back to Home</span>
        </Link>

        <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl relative z-10">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-white">
              {t('Ya has iniciado sesión', 'Already Logged In')}
            </CardTitle>
            <CardDescription className="text-white/60">
              {t('Conectado como', 'Logged in as')} <strong className="text-[#C6A649]">{user.profile?.full_name || user.email}</strong>
              <span className="block text-xs mt-1 capitalize text-white/40">({user.profile?.role})</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full bg-[#C6A649] text-white hover:bg-[#C6A649]/90 font-semibold"
              onClick={() => navigate(dashboardPath)}
            >
              {t('Ir al Panel', 'Go to Dashboard')}
            </Button>
            <Button
              variant="outline"
              className="w-full border-white/10 text-white hover:bg-white/5 hover:text-white"
              onClick={async () => {
                await signOut();
              }}
            >
              {t('Cerrar Sesión', 'Logout')}
            </Button>

            {/* Dev Mode Quick Switch */}
            {isDevMode && (
              <>
                <Separator className="my-4 bg-white/10" />
                <p className="text-center text-xs text-white/30 font-medium uppercase tracking-wide">
                  Dev Mode - Switch Account
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDevLogin('owner')}
                    className="flex flex-col items-center gap-1 h-auto py-3 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/50 text-amber-200"
                  >
                    <Crown className="h-5 w-5 text-amber-400" />
                    <span className="text-xs">Owner</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDevLogin('baker', '/baker-station')}
                    className="flex flex-col items-center gap-1 h-auto py-3 border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/50 text-purple-200"
                  >
                    <ChefHat className="h-5 w-5 text-purple-400" />
                    <span className="text-xs">Baker St.</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDevLogin('baker', '/front-desk')}
                    className="flex flex-col items-center gap-1 h-auto py-3 border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/50 text-blue-200"
                  >
                    <Store className="h-5 w-5 text-blue-400" />
                    <span className="text-xs">Front Desk</span>
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
    <div className="min-h-screen w-full bg-[#1a1a1a] text-white flex items-center justify-center relative overflow-hidden px-4">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#C6A649]/20 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[100px]" />

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/50 hover:text-[#C6A649] transition-colors z-20">
        <Store className="h-5 w-5" />
        <span className="text-sm font-medium tracking-wide">Back to Home</span>
      </Link>

      <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl relative z-10 transition-all duration-300">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="flex justify-center mb-6">
            <img src={TransparentLogo} alt="Eli's Logo" className="h-24 object-contain drop-shadow-2xl" />
          </div>
          <CardTitle className="text-3xl font-bold text-white tracking-tight">
            {t('Bienvenido', 'Welcome Back')}
          </CardTitle>
          <CardDescription className="text-white/60 text-base">
            {t(
              'Ingresa a tu cuenta para administrar',
              'Access your dashboard to manage orders'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <Alert className="bg-[#C6A649]/10 border-[#C6A649]/30 text-[#C6A649]">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">
                  {t('Email', 'Email')}
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 group-hover:text-[#C6A649] transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('ejemplo@email.com', 'example@email.com')}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#C6A649]/50 focus:ring-[#C6A649]/20 transition-all h-11"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white/80">
                    {t('Contraseña', 'Password')}
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#C6A649] hover:text-[#C6A649]/80 hover:underline"
                  >
                    {t('¿Olvidaste tu contraseña?', 'Forgot password?')}
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 group-hover:text-[#C6A649] transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('Ingresa tu contraseña', 'Enter your password')}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#C6A649]/50 focus:ring-[#C6A649]/20 transition-all h-11"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#C6A649] text-white hover:bg-[#C6A649]/90 font-semibold h-11 text-base shadow-lg shadow-[#C6A649]/20 hover:shadow-[#C6A649]/30 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('Iniciando sesión...', 'Signing in...')}
                </>
              ) : (
                t('Iniciar Sesión', 'Sign In')
              )}
            </Button>

            <div className="text-center text-sm text-white/40">
              {t('¿No tienes una cuenta?', "Don't have an account?")}{' '}
              <Link
                to="/signup"
                className="font-medium text-[#C6A649] hover:underline"
              >
                {t('Regístrate', 'Sign Up')}
              </Link>
            </div>
          </form>

          {/* Dev Mode Quick Login */}
          {isDevMode && (
            <>
              <Separator className="my-6 bg-white/10" />
              <div className="space-y-3">
                <p className="text-center text-xs text-white/30 font-medium uppercase tracking-wide">
                  Dev Mode - Quick Login
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDevLogin('owner')}
                    className="flex flex-col items-center gap-1 h-auto py-3 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/50 text-amber-200"
                  >
                    <Crown className="h-5 w-5 text-amber-400" />
                    <span className="text-xs">Owner</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDevLogin('baker', '/baker-station')}
                    className="flex flex-col items-center gap-1 h-auto py-3 border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/50 text-purple-200"
                  >
                    <ChefHat className="h-5 w-5 text-purple-400" />
                    <span className="text-xs">Baker St.</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDevLogin('baker', '/front-desk')}
                    className="flex flex-col items-center gap-1 h-auto py-3 border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/50 text-blue-200"
                  >
                    <Store className="h-5 w-5 text-blue-400" />
                    <span className="text-xs">Front Desk</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Decorative Bottom Text for Owner feeling */}
      <div className="absolute bottom-6 w-full text-center text-white/20 text-xs tracking-widest uppercase">
        Eli's Dulce Tradición • Admin Portal
      </div>
    </div>
  );
};


export default Login;
