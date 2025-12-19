/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import AddressAutocomplete from '@/components/order/AddressAutocomplete';

interface SavedAddressesProps {
  userId: string;
  onAddressChange?: () => void;
}

const SavedAddresses = ({ userId, onAddressChange }: SavedAddressesProps) => {
  const { t } = useLanguage();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip_code: '',
    is_default: false,
  });

  useEffect(() => {
    loadAddresses();
  }, [userId]);

  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCustomerAddresses();
      setAddresses(data);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast.error(t('Error al cargar direcciones', 'Error loading addresses'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      label: '',
      address: '',
      apartment: '',
      city: '',
      state: '',
      zip_code: '',
      is_default: false,
    });
  };

  const handleEdit = (address: any) => {
    setEditingId(address.id);
    setFormData({
      label: address.label,
      address: address.address,
      apartment: address.apartment || '',
      city: address.city || '',
      state: address.state || '',
      zip_code: address.zip_code || '',
      is_default: address.is_default || false,
    });
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (!formData.label || !formData.address) {
      toast.error(t('Label y dirección son requeridos', 'Label and address are required'));
      return;
    }

    try {
      if (editingId) {
        await api.updateCustomerAddress(editingId, formData);
        toast.success(t('Dirección actualizada', 'Address updated'));
      } else {
        await api.createCustomerAddress(formData);
        toast.success(t('Dirección guardada', 'Address saved'));
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({
        label: '',
        address: '',
        apartment: '',
        city: '',
        state: '',
        zip_code: '',
        is_default: false,
      });
      loadAddresses();
      onAddressChange?.();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error(t('Error al guardar dirección', 'Error saving address'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('¿Eliminar esta dirección?', 'Delete this address?'))) {
      return;
    }

    try {
      await api.deleteCustomerAddress(id);
      toast.success(t('Dirección eliminada', 'Address deleted'));
      loadAddresses();
      onAddressChange?.();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error(t('Error al eliminar dirección', 'Error deleting address'));
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      label: '',
      address: '',
      apartment: '',
      city: '',
      state: '',
      zip_code: '',
      is_default: false,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('Direcciones Guardadas', 'Saved Addresses')}</CardTitle>
              <CardDescription>
                {t('Gestiona tus direcciones de entrega', 'Manage your delivery addresses')}
              </CardDescription>
            </div>
            {!isAdding && (
              <Button onClick={handleAdd}>
                <Plus className="mr-2 h-4 w-4" />
                {t('Agregar Dirección', 'Add Address')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add/Edit Form */}
          {isAdding && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle>
                  {editingId ? t('Editar Dirección', 'Edit Address') : t('Nueva Dirección', 'New Address')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('Etiqueta', 'Label')} *</Label>
                  <Input
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder={t('Ej: Casa, Trabajo', 'E.g: Home, Work')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('Dirección', 'Address')} *</Label>
                  <AddressAutocomplete
                    value={formData.address}
                    showDeliveryInfo={false}
                    onChange={(value, isValid, placeDetails) => {
                      setFormData({ ...formData, address: value });
                      if (isValid && placeDetails) {
                        const zipComponent = placeDetails.address_components?.find(
                          (comp: any) => comp.types.includes('postal_code')
                        );
                        const cityComponent = placeDetails.address_components?.find(
                          (comp: any) => comp.types.includes('locality')
                        );
                        const stateComponent = placeDetails.address_components?.find(
                          (comp: any) => comp.types.includes('administrative_area_level_1')
                        );
                        
                        if (zipComponent) setFormData(prev => ({ ...prev, zip_code: zipComponent.long_name }));
                        if (cityComponent) setFormData(prev => ({ ...prev, city: cityComponent.long_name }));
                        if (stateComponent) setFormData(prev => ({ ...prev, state: stateComponent.short_name }));
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('Apartamento/Unidad', 'Apartment/Unit')}</Label>
                  <Input
                    value={formData.apartment}
                    onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                    placeholder={t('Opcional', 'Optional')}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is_default" className="cursor-pointer">
                    {t('Establecer como dirección predeterminada', 'Set as default address')}
                  </Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1">
                    {t('Guardar', 'Save')}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    {t('Cancelar', 'Cancel')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Addresses List */}
          <div className="space-y-3">
            {addresses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('No hay direcciones guardadas', 'No saved addresses')}</p>
              </div>
            ) : (
              addresses.map((address) => (
                <Card key={address.id} className={address.is_default ? 'border-primary' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{address.label}</h3>
                          {address.is_default && (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              {t('Predeterminada', 'Default')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{address.address}</p>
                        {address.apartment && (
                          <p className="text-sm text-muted-foreground">
                            {t('Apto/Unidad', 'Apt/Unit')}: {address.apartment}
                          </p>
                        )}
                        {(address.city || address.state || address.zip_code) && (
                          <p className="text-sm text-muted-foreground">
                            {[address.city, address.state, address.zip_code].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(address)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(address.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SavedAddresses;
