/**
 * Announcement Management Component
 * Admin UI for managing site-wide announcements
 */

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
} from '@/lib/hooks/useCMS';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import type { Announcement } from '@/lib/cms';

export function AnnouncementManager() {
  const { t, language } = useLanguage();
  const isSpanish = language === 'es';
  const { data: announcements = [], isLoading } = useAnnouncements();
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title_en: '',
    title_es: '',
    message_en: '',
    message_es: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'holiday',
    is_active: false,
    is_dismissible: true,
    start_date: '',
    end_date: '',
    display_order: 0,
  });

  const handleOpenDialog = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({
        title_en: announcement.title_en,
        title_es: announcement.title_es,
        message_en: announcement.message_en,
        message_es: announcement.message_es,
        type: announcement.type,
        is_active: announcement.is_active,
        is_dismissible: announcement.is_dismissible,
        start_date: announcement.start_date
          ? new Date(announcement.start_date).toISOString().slice(0, 16)
          : '',
        end_date: announcement.end_date
          ? new Date(announcement.end_date).toISOString().slice(0, 16)
          : '',
        display_order: announcement.display_order,
      });
    } else {
      setEditingAnnouncement(null);
      setFormData({
        title_en: '',
        title_es: '',
        message_en: '',
        message_es: '',
        type: 'info',
        is_active: false,
        is_dismissible: true,
        start_date: '',
        end_date: '',
        display_order: announcements.length,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAnnouncement(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = {
        ...formData,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
      };

      if (editingAnnouncement) {
        await updateMutation.mutateAsync({
          id: editingAnnouncement.id,
          updates: submitData,
        });
        toast.success(
          isSpanish
            ? 'Anuncio actualizado exitosamente'
            : 'Announcement updated successfully'
        );
      } else {
        await createMutation.mutateAsync(submitData);
        toast.success(
          isSpanish
            ? 'Anuncio creado exitosamente'
            : 'Announcement created successfully'
        );
      }
      handleCloseDialog();
    } catch (error) {
      toast.error(
        isSpanish ? 'Error al guardar anuncio' : 'Error saving announcement'
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        isSpanish
          ? '¿Estás seguro de que quieres eliminar este anuncio?'
          : 'Are you sure you want to delete this announcement?'
      )
    ) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast.success(
        isSpanish
          ? 'Anuncio eliminado exitosamente'
          : 'Announcement deleted successfully'
      );
    } catch (error) {
      toast.error(
        isSpanish ? 'Error al eliminar anuncio' : 'Error deleting announcement'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {isSpanish ? 'Anuncios' : 'Announcements'}
          </h2>
          <p className="text-muted-foreground">
            {isSpanish
              ? 'Administra los anuncios del sitio'
              : 'Manage site-wide announcements'}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              {isSpanish ? 'Nuevo Anuncio' : 'New Announcement'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncement
                  ? isSpanish
                    ? 'Editar Anuncio'
                    : 'Edit Announcement'
                  : isSpanish
                  ? 'Nuevo Anuncio'
                  : 'New Announcement'}
              </DialogTitle>
              <DialogDescription>
                {isSpanish
                  ? 'Crea un anuncio que aparecerá en todo el sitio'
                  : 'Create an announcement that will appear site-wide'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title_en">
                    {isSpanish ? 'Título (Inglés)' : 'Title (English)'}
                  </Label>
                  <Input
                    id="title_en"
                    value={formData.title_en}
                    onChange={(e) =>
                      setFormData({ ...formData, title_en: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title_es">
                    {isSpanish ? 'Título (Español)' : 'Title (Spanish)'}
                  </Label>
                  <Input
                    id="title_es"
                    value={formData.title_es}
                    onChange={(e) =>
                      setFormData({ ...formData, title_es: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="message_en">
                    {isSpanish ? 'Mensaje (Inglés)' : 'Message (English)'}
                  </Label>
                  <Textarea
                    id="message_en"
                    rows={3}
                    value={formData.message_en}
                    onChange={(e) =>
                      setFormData({ ...formData, message_en: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message_es">
                    {isSpanish ? 'Mensaje (Español)' : 'Message (Spanish)'}
                  </Label>
                  <Textarea
                    id="message_es"
                    rows={3}
                    value={formData.message_es}
                    onChange={(e) =>
                      setFormData({ ...formData, message_es: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">
                    {isSpanish ? 'Tipo' : 'Type'}
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">
                        {isSpanish ? 'Información' : 'Info'}
                      </SelectItem>
                      <SelectItem value="warning">
                        {isSpanish ? 'Advertencia' : 'Warning'}
                      </SelectItem>
                      <SelectItem value="success">
                        {isSpanish ? 'Éxito' : 'Success'}
                      </SelectItem>
                      <SelectItem value="holiday">
                        {isSpanish ? 'Feriado' : 'Holiday'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_order">
                    {isSpanish ? 'Orden' : 'Display Order'}
                  </Label>
                  <Input
                    id="display_order"
                    type="number"
                    min="0"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_order: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">
                    {isSpanish ? 'Fecha de Inicio' : 'Start Date'}
                  </Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">
                    {isSpanish ? 'Fecha de Fin' : 'End Date'}
                  </Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="is_active">
                    {isSpanish ? 'Activo' : 'Active'}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_dismissible"
                    checked={formData.is_dismissible}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_dismissible: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="is_dismissible">
                    {isSpanish ? 'Descartable' : 'Dismissible'}
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  {isSpanish ? 'Cancelar' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSpanish ? 'Guardando...' : 'Saving...'}
                    </>
                  ) : (
                    isSpanish ? 'Guardar' : 'Save'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8 text-muted-foreground">
              {isSpanish
                ? 'No hay anuncios. Crea uno nuevo.'
                : 'No announcements. Create a new one.'}
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          announcement.type === 'info'
                            ? 'bg-blue-100 text-blue-800'
                            : announcement.type === 'warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : announcement.type === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {announcement.type}
                      </span>
                      {isSpanish
                        ? announcement.title_es
                        : announcement.title_en}
                    </CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {isSpanish
                        ? announcement.message_es
                        : announcement.message_en}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(announcement)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
