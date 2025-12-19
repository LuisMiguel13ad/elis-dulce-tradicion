/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  MapPin, 
  Star, 
  Settings, 
  ShoppingBag, 
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  RefreshCw,
  Gift,
  Mail,
  MessageSquare
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/pricing';
import OrderHistory from '@/components/customer/OrderHistory';
import SavedAddresses from '@/components/customer/SavedAddresses';
import CustomerPreferences from '@/components/customer/CustomerPreferences';

const CustomerDashboard = () => {
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login?redirect=/customer-dashboard');
      return;
    }

    if (user.profile?.role !== 'customer') {
      navigate('/');
      return;
    }

    loadProfile();
  }, [user, authLoading, navigate]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCustomerProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error(t('Error al cargar perfil', 'Error loading profile'));
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-4xl font-bold text-gradient-gold mb-2">
                {t('Mi Cuenta', 'My Account')}
              </h1>
              <p className="text-muted-foreground">
                {t('Bienvenido de vuelta', 'Welcome back')}, {profile.full_name || user.email}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('Total de Pedidos', 'Total Orders')}
                  </CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile.total_orders || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('Total Gastado', 'Total Spent')}
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPrice(parseFloat(profile.total_spent || 0))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('Puntos de Lealtad', 'Loyalty Points')}
                  </CardTitle>
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile.loyalty_points || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('1 punto por cada dólar', '1 point per dollar')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="orders">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {t('Pedidos', 'Orders')}
                </TabsTrigger>
                <TabsTrigger value="addresses">
                  <MapPin className="mr-2 h-4 w-4" />
                  {t('Direcciones', 'Addresses')}
                </TabsTrigger>
                <TabsTrigger value="preferences">
                  <Settings className="mr-2 h-4 w-4" />
                  {t('Preferencias', 'Preferences')}
                </TabsTrigger>
                <TabsTrigger value="profile">
                  <Settings className="mr-2 h-4 w-4" />
                  {t('Perfil', 'Profile')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="space-y-4">
                <OrderHistory userId={user.id} />
              </TabsContent>

              <TabsContent value="addresses" className="space-y-4">
                <SavedAddresses userId={user.id} onAddressChange={loadProfile} />
              </TabsContent>

              <TabsContent value="preferences" className="space-y-4">
                <CustomerPreferences 
                  profile={profile} 
                  onUpdate={loadProfile}
                />
              </TabsContent>

              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('Información del Perfil', 'Profile Information')}</CardTitle>
                    <CardDescription>
                      {t('Actualiza tu información personal', 'Update your personal information')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{t('Nombre Completo', 'Full Name')}</Label>
                        <Input value={profile.full_name || ''} disabled />
                        <p className="text-xs text-muted-foreground">
                          {t('Contacta al soporte para cambiar', 'Contact support to change')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('Email', 'Email')}</Label>
                        <Input value={user.email || ''} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('Teléfono', 'Phone')}</Label>
                        <Input value={profile.phone || ''} disabled />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {t('Notificaciones por Email', 'Email Notifications')}:
                        </span>
                        <Badge variant={profile.email_notifications_enabled ? 'default' : 'outline'}>
                          {profile.email_notifications_enabled 
                            ? t('Activadas', 'Enabled') 
                            : t('Desactivadas', 'Disabled')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {t('Notificaciones por SMS', 'SMS Notifications')}:
                        </span>
                        <Badge variant={profile.sms_notifications_enabled ? 'default' : 'outline'}>
                          {profile.sms_notifications_enabled 
                            ? t('Activadas', 'Enabled') 
                            : t('Desactivadas', 'Disabled')}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerDashboard;
