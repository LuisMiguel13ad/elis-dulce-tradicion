/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Save, 
  X, 
  TrendingDown,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

interface Ingredient {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  low_stock_threshold: number;
  category: string | null;
  supplier: string | null;
  last_updated: string;
}

const InventoryManager = () => {
  const { t } = useLanguage();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const [allItems, lowStock] = await Promise.all([
        api.getInventory(),
        api.getLowStockItems(),
      ]);
      setIngredients(Array.isArray(allItems) ? allItems : []);
      setLowStockItems(Array.isArray(lowStock) ? lowStock : []);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast.error(t('Error al cargar inventario', 'Error loading inventory'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingId(ingredient.id);
    setEditQuantity(ingredient.quantity.toString());
    setEditNotes('');
  };

  const handleSave = async (id: number) => {
    try {
      const quantity = parseFloat(editQuantity);
      if (isNaN(quantity) || quantity < 0) {
        toast.error(t('Cantidad inválida', 'Invalid quantity'));
        return;
      }

      await api.updateIngredient(id, quantity, editNotes);
      toast.success(t('Inventario actualizado', 'Inventory updated'));
      setEditingId(null);
      setEditQuantity('');
      setEditNotes('');
      loadInventory();
    } catch (error) {
      console.error('Error updating ingredient:', error);
      toast.error(t('Error al actualizar inventario', 'Error updating inventory'));
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditQuantity('');
    setEditNotes('');
  };

  const getStockStatus = (ingredient: Ingredient): 'low' | 'ok' => {
    return ingredient.quantity <= ingredient.low_stock_threshold ? 'low' : 'ok';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold">{t('Gestión de Inventario', 'Inventory Management')}</h2>
          <p className="text-muted-foreground mt-1">
            {t('Administra ingredientes y alertas de stock bajo', 'Manage ingredients and low stock alerts')}
          </p>
        </div>
        <Button onClick={loadInventory} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('Actualizar', 'Refresh')}
        </Button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('Alerta de Stock Bajo', 'Low Stock Alert')}:</strong>{' '}
            {t(
              `${lowStockItems.length} ingrediente(s) necesitan reabastecimiento`,
              `${lowStockItems.length} ingredient(s) need restocking`
            )}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            {t('Todos', 'All')} ({ingredients.length})
          </TabsTrigger>
          <TabsTrigger value="low-stock">
            {t('Stock Bajo', 'Low Stock')} ({lowStockItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ingredients.map((ingredient) => (
              <Card key={ingredient.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{ingredient.name}</CardTitle>
                      {ingredient.category && (
                        <CardDescription>{ingredient.category}</CardDescription>
                      )}
                    </div>
                    <Badge variant={getStockStatus(ingredient) === 'low' ? 'destructive' : 'default'}>
                      {getStockStatus(ingredient) === 'low' ? (
                        <AlertTriangle className="mr-1 h-3 w-3" />
                      ) : (
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                      )}
                      {getStockStatus(ingredient) === 'low' ? t('Bajo', 'Low') : t('OK', 'OK')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{t('Cantidad', 'Quantity')}:</span>
                      {editingId === ingredient.id ? (
                        <Input
                          type="number"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          className="w-24"
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        <span className="font-semibold text-lg">
                          {ingredient.quantity} {ingredient.unit}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {t('Umbral bajo', 'Low threshold')}: {ingredient.low_stock_threshold} {ingredient.unit}
                      </span>
                      {ingredient.quantity <= ingredient.low_stock_threshold && (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>

                  {ingredient.supplier && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t('Proveedor', 'Supplier')}:</span>{' '}
                      <span>{ingredient.supplier}</span>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    {t('Última actualización', 'Last updated')}: {formatDate(ingredient.last_updated)}
                  </div>

                  {editingId === ingredient.id ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSave(ingredient.id)}
                        className="flex-1"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {t('Guardar', 'Save')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(ingredient)}
                      className="w-full"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {t('Editar Cantidad', 'Edit Quantity')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-4">
          {lowStockItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-muted-foreground">
                  {t('No hay ingredientes con stock bajo', 'No low stock items')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lowStockItems.map((ingredient) => (
                <Card key={ingredient.id} className="border-red-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{ingredient.name}</CardTitle>
                        {ingredient.category && (
                          <CardDescription>{ingredient.category}</CardDescription>
                        )}
                      </div>
                      <Badge variant="destructive">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        {t('Bajo', 'Low')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{t('Cantidad Actual', 'Current Quantity')}:</span>
                        {editingId === ingredient.id ? (
                          <Input
                            type="number"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(e.target.value)}
                            className="w-24"
                            min="0"
                            step="0.01"
                          />
                        ) : (
                          <span className="font-semibold text-lg text-red-600">
                            {ingredient.quantity} {ingredient.unit}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t('Umbral', 'Threshold')}: {ingredient.low_stock_threshold} {ingredient.unit}
                      </div>
                    </div>

                    {editingId === ingredient.id ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(ingredient.id)}
                          className="flex-1"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {t('Guardar', 'Save')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleEdit(ingredient)}
                        className="w-full"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        {t('Actualizar Stock', 'Update Stock')}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryManager;
