/**
 * FAQ Management Component
 * Admin UI for managing FAQs
 */

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useFAQs,
  useCreateFAQ,
  useUpdateFAQ,
  useDeleteFAQ,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import type { FAQ } from '@/lib/cms';

export function FAQManager() {
  const { t, language } = useLanguage();
  const isSpanish = language === 'es';
  const { data: faqs = [], isLoading } = useFAQs();
  const createMutation = useCreateFAQ();
  const updateMutation = useUpdateFAQ();
  const deleteMutation = useDeleteFAQ();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    question_en: '',
    question_es: '',
    answer_en: '',
    answer_es: '',
    display_order: 0,
    is_active: true,
  });

  const handleOpenDialog = (faq?: FAQ) => {
    if (faq) {
      setEditingFAQ(faq);
      setFormData({
        question_en: faq.question_en,
        question_es: faq.question_es,
        answer_en: faq.answer_en,
        answer_es: faq.answer_es,
        display_order: faq.display_order,
        is_active: faq.is_active,
      });
    } else {
      setEditingFAQ(null);
      setFormData({
        question_en: '',
        question_es: '',
        answer_en: '',
        answer_es: '',
        display_order: faqs.length,
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingFAQ(null);
    setFormData({
      question_en: '',
      question_es: '',
      answer_en: '',
      answer_es: '',
      display_order: 0,
      is_active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingFAQ) {
        await updateMutation.mutateAsync({
          id: editingFAQ.id,
          updates: formData,
        });
        toast.success(
          isSpanish ? 'FAQ actualizada exitosamente' : 'FAQ updated successfully'
        );
      } else {
        await createMutation.mutateAsync(formData);
        toast.success(
          isSpanish ? 'FAQ creada exitosamente' : 'FAQ created successfully'
        );
      }
      handleCloseDialog();
    } catch (error) {
      toast.error(
        isSpanish ? 'Error al guardar FAQ' : 'Error saving FAQ'
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        isSpanish
          ? '¿Estás seguro de que quieres eliminar esta FAQ?'
          : 'Are you sure you want to delete this FAQ?'
      )
    ) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast.success(
        isSpanish ? 'FAQ eliminada exitosamente' : 'FAQ deleted successfully'
      );
    } catch (error) {
      toast.error(
        isSpanish ? 'Error al eliminar FAQ' : 'Error deleting FAQ'
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
            {isSpanish ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-muted-foreground">
            {isSpanish
              ? 'Administra las preguntas frecuentes de tu sitio web'
              : 'Manage your website FAQs'}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              {isSpanish ? 'Nueva FAQ' : 'New FAQ'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingFAQ
                  ? isSpanish
                    ? 'Editar FAQ'
                    : 'Edit FAQ'
                  : isSpanish
                  ? 'Nueva FAQ'
                  : 'New FAQ'}
              </DialogTitle>
              <DialogDescription>
                {isSpanish
                  ? 'Completa la información de la FAQ en ambos idiomas'
                  : 'Complete the FAQ information in both languages'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question_en">
                  {isSpanish ? 'Pregunta (Inglés)' : 'Question (English)'}
                </Label>
                <Input
                  id="question_en"
                  value={formData.question_en}
                  onChange={(e) =>
                    setFormData({ ...formData, question_en: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="question_es">
                  {isSpanish ? 'Pregunta (Español)' : 'Question (Spanish)'}
                </Label>
                <Input
                  id="question_es"
                  value={formData.question_es}
                  onChange={(e) =>
                    setFormData({ ...formData, question_es: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer_en">
                  {isSpanish ? 'Respuesta (Inglés)' : 'Answer (English)'}
                </Label>
                <Textarea
                  id="answer_en"
                  rows={4}
                  value={formData.answer_en}
                  onChange={(e) =>
                    setFormData({ ...formData, answer_en: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer_es">
                  {isSpanish ? 'Respuesta (Español)' : 'Answer (Spanish)'}
                </Label>
                <Textarea
                  id="answer_es"
                  rows={4}
                  value={formData.answer_es}
                  onChange={(e) =>
                    setFormData({ ...formData, answer_es: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display_order">
                    {isSpanish ? 'Orden de Visualización' : 'Display Order'}
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

                <div className="flex items-center space-x-2 pt-8">
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
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  {isSpanish ? 'Cancelar' : 'Cancel'}
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isSpanish ? 'Orden' : 'Order'}</TableHead>
                <TableHead>
                  {isSpanish ? 'Pregunta' : 'Question'}
                </TableHead>
                <TableHead>{isSpanish ? 'Estado' : 'Status'}</TableHead>
                <TableHead className="text-right">
                  {isSpanish ? 'Acciones' : 'Actions'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faqs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    {isSpanish
                      ? 'No hay FAQs. Crea una nueva.'
                      : 'No FAQs. Create a new one.'}
                  </TableCell>
                </TableRow>
              ) : (
                faqs.map((faq) => (
                  <TableRow key={faq.id}>
                    <TableCell>{faq.display_order}</TableCell>
                    <TableCell>
                      {isSpanish ? faq.question_es : faq.question_en}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          faq.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {faq.is_active
                          ? isSpanish
                            ? 'Activo'
                            : 'Active'
                          : isSpanish
                          ? 'Inactivo'
                          : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(faq)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(faq.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
