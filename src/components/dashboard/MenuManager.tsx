import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Product {
  id: number;
  name_es: string;
  name_en: string;
  description_es: string;
  description_en: string;
  price: number;
  image_url: string | null;
  category: string;
  is_active: number;
}

const MenuManager = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name_es: '',
    name_en: '',
    description_es: '',
    description_en: '',
    price: '',
    category: 'cakes',
    image_url: '',
  });

  useEffect(() => {
    loadProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await api.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error(t('Error al cargar productos', 'Error loading products'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name_es || !formData.name_en || !formData.price) {
      toast.error(t('Por favor complete todos los campos requeridos', 'Please fill in all required fields'));
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = formData.image_url;

      // Upload image if a new file was selected
      if (imageFile) {
        const uploadResult = await api.uploadFile(imageFile);
        imageUrl = uploadResult.path;
      }

      const productData = {
        name_es: formData.name_es,
        name_en: formData.name_en,
        description_es: formData.description_es,
        description_en: formData.description_en,
        price: parseFloat(formData.price),
        category: formData.category,
        image_url: imageUrl,
      };

      if (editingProduct) {
        // Update existing product
        await api.updateProduct(editingProduct.id, productData);
        toast.success(t('Producto actualizado exitosamente', 'Product updated successfully'));
      } else {
        // Create new product
        await api.createProduct(productData);
        toast.success(t('Producto creado exitosamente', 'Product created successfully'));
      }

      // Reset form and close dialog
      resetForm();
      setIsDialogOpen(false);
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(t('Error al guardar producto', 'Error saving product'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name_es: product.name_es,
      name_en: product.name_en,
      description_es: product.description_es || '',
      description_en: product.description_en || '',
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url || '',
    });
    setImagePreview(product.image_url ? getImageUrl(product.image_url) : null);
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('¿Está seguro de que desea eliminar este producto?', 'Are you sure you want to delete this product?'))) {
      return;
    }

    try {
      await api.deleteProduct(id);
      toast.success(t('Producto eliminado exitosamente', 'Product deleted successfully'));
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(t('Error al eliminar producto', 'Error deleting product'));
    }
  };

  const resetForm = () => {
    setFormData({
      name_es: '',
      name_en: '',
      description_es: '',
      description_en: '',
      price: '',
      category: 'cakes',
      image_url: '',
    });
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, { es: string; en: string }> = {
      cakes: { es: 'Pasteles', en: 'Cakes' },
      bread: { es: 'Pan Dulce', en: 'Sweet Bread' },
      other: { es: 'Otros', en: 'Other' },
    };
    return categories[category] || { es: category, en: category };
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    return `${baseUrl}${imageUrl}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Menu Manager</h2>
          <p className="text-muted-foreground mt-1">
            {t('Gestiona los productos del menú', 'Manage menu products')}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('Agregar Producto', 'Add Product')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct
                  ? t('Editar Producto', 'Edit Product')
                  : t('Nuevo Producto', 'New Product')}
              </DialogTitle>
              <DialogDescription>
                {t('Complete la información del producto', 'Fill in the product information')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name_es">
                    {t('Nombre (Español)', 'Name (Spanish)')} *
                  </Label>
                  <Input
                    id="name_es"
                    value={formData.name_es}
                    onChange={(e) => setFormData({ ...formData, name_es: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_en">
                    {t('Nombre (Inglés)', 'Name (English)')} *
                  </Label>
                  <Input
                    id="name_en"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description_es">
                    {t('Descripción (Español)', 'Description (Spanish)')}
                  </Label>
                  <Textarea
                    id="description_es"
                    value={formData.description_es}
                    onChange={(e) => setFormData({ ...formData, description_es: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description_en">
                    {t('Descripción (Inglés)', 'Description (English)')}
                  </Label>
                  <Textarea
                    id="description_en"
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    {t('Precio', 'Price')} ($) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">
                    {t('Categoría', 'Category')} *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cakes">
                        {t('Pasteles', 'Cakes')}
                      </SelectItem>
                      <SelectItem value="bread">
                        {t('Pan Dulce', 'Sweet Bread')}
                      </SelectItem>
                      <SelectItem value="other">
                        {t('Otros', 'Other')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">
                  {t('Imagen del Producto', 'Product Image')}
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                  )}
                </div>
                {formData.image_url && !imagePreview && (
                  <img
                    src={getImageUrl(formData.image_url) || ''}
                    alt="Current"
                    className="w-20 h-20 object-cover rounded-md border mt-2"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={isSubmitting}
                >
                  {t('Cancelar', 'Cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('Guardando...', 'Saving...')}
                    </>
                  ) : (
                    editingProduct
                      ? t('Actualizar', 'Update')
                      : t('Crear', 'Create')
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('Productos', 'Products')}</CardTitle>
          <CardDescription>
            {t('Lista de todos los productos del menú', 'List of all menu products')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('No hay productos aún', 'No products yet')}</p>
              <p className="text-sm mt-2">
                {t('Haz clic en "Agregar Producto" para comenzar', 'Click "Add Product" to get started')}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Imagen', 'Image')}</TableHead>
                  <TableHead>{t('Nombre', 'Name')}</TableHead>
                  <TableHead>{t('Categoría', 'Category')}</TableHead>
                  <TableHead>{t('Precio', 'Price')}</TableHead>
                  <TableHead>{t('Descripción', 'Description')}</TableHead>
                  <TableHead className="text-right">{t('Acciones', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const categoryLabel = getCategoryLabel(product.category);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.image_url ? (
                          <img
                            src={getImageUrl(product.image_url) || ''}
                            alt={product.name_en}
                            className="w-16 h-16 object-cover rounded-md border"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name_en}</div>
                          <div className="text-sm text-muted-foreground">{product.name_es}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {t(categoryLabel.es, categoryLabel.en)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${product.price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="text-sm line-clamp-2">{product.description_en || '-'}</div>
                          {product.description_es && (
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {product.description_es}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuManager;

