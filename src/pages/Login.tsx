import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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

  // Get redirect message from location state
  const message = location.state?.message;

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const role = user.profile?.role;
      if (role === 'owner') {
        navigate('/owner-dashboard', { replace: true });
      } else if (role === 'baker') {
        navigate('/kitchen-display', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

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
          navigate('/kitchen-display');
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              {t('Iniciar Sesión', 'Sign In')}
            </CardTitle>
            <CardDescription>
              {t(
                'Ingresa a tu cuenta para continuar',
                'Enter your account to continue'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">
                  {t('Email', 'Email')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('ejemplo@email.com', 'example@email.com')}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-10"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">
                    {t('Contraseña', 'Password')}
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    {t('¿Olvidaste tu contraseña?', 'Forgot password?')}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('Ingresa tu contraseña', 'Enter your password')}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="pl-10"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
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

              <div className="text-center text-sm text-muted-foreground">
                {t('¿No tienes una cuenta?', "Don't have an account?")}{' '}
                <Link
                  to="/signup"
                  className="font-medium text-primary hover:underline"
                >
                  {t('Regístrate', 'Sign Up')}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
