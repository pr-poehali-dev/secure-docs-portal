import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { api, Document, Project } from '@/lib/api';

interface EditDocumentDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (doc: Document) => void;
}

const EditDocumentDialog = ({ document, open, onOpenChange, onUpdate }: EditDocumentDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'pending' | 'active' | 'archived'>('active');
  const [dateSigned, setDateSigned] = useState<Date>();
  const [datePayment, setDatePayment] = useState<Date>();
  const [dateDeadline, setDateDeadline] = useState<Date>();
  const [dateExpiry, setDateExpiry] = useState<Date>();
  const [tags, setTags] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectList = await api.getProjects();
        setProjects(projectList);
      } catch (error) {
        console.error('Failed to load projects:', error);
      }
    };
    if (open) {
      loadProjects();
    }
  }, [open]);

  useEffect(() => {
    if (document && open) {
      setTitle(document.title);
      setDescription(document.description);
      setProjectId(document.project_id ? String(document.project_id) : '');
      setPriority(document.priority);
      setStatus(document.status);
      setDateSigned(document.date_signed ? new Date(document.date_signed) : undefined);
      setDatePayment(document.date_payment ? new Date(document.date_payment) : undefined);
      setDateDeadline(document.date_deadline ? new Date(document.date_deadline) : undefined);
      setDateExpiry(document.date_expiry ? new Date(document.date_expiry) : undefined);
      setTags(document.tags.join(', '));
      setCurrentPdfUrl(document.pdf_url);
      setPdfFile(null);
    }
  }, [document, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!document || !title || !description) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    let pdfUrl: string | undefined = currentPdfUrl || undefined;

    if (pdfFile) {
      try {
        setUploading(true);
        pdfUrl = await api.uploadPDF(pdfFile);
        toast({
          title: 'PDF загружен',
          description: 'Новый файл успешно загружен в облако',
        });
      } catch (error) {
        toast({
          title: 'Ошибка загрузки',
          description: 'Не удалось загрузить PDF файл',
          variant: 'destructive',
        });
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    onUpdate({
      ...document,
      title,
      description,
      project_id: projectId ? parseInt(projectId) : null,
      priority,
      status,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      date_signed: dateSigned ? format(dateSigned, 'yyyy-MM-dd') : null,
      date_payment: datePayment ? format(datePayment, 'yyyy-MM-dd') : null,
      date_deadline: dateDeadline ? format(dateDeadline, 'yyyy-MM-dd') : null,
      date_expiry: dateExpiry ? format(dateExpiry, 'yyyy-MM-dd') : null,
      pdf_url: pdfUrl || null,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать документ</DialogTitle>
          <DialogDescription>
            Внесите изменения в документ
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Название документа *</Label>
              <Input
                id="edit-title"
                placeholder="Например: Договор поставки оборудования"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Описание *</Label>
              <Textarea
                id="edit-description"
                placeholder="Краткое описание документа и его назначения"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-project">Проект</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger id="edit-project">
                    <SelectValue placeholder="Выберите проект" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={String(project.id)}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-priority">Приоритет</Label>
                <Select
                  value={priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}
                >
                  <SelectTrigger id="edit-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Низкий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Статус</Label>
                <Select
                  value={status}
                  onValueChange={(value: 'pending' | 'active' | 'archived') => setStatus(value)}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Ожидает</SelectItem>
                    <SelectItem value="active">Активный</SelectItem>
                    <SelectItem value="archived">Архив</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <h3 className="font-semibold text-sm">Важные даты</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Дата подписания</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Icon name="Calendar" size={16} className="mr-2" />
                        {dateSigned ? format(dateSigned, 'PP', { locale: ru }) : 'Выберите дату'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateSigned}
                        onSelect={setDateSigned}
                        locale={ru}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Дата оплаты</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Icon name="Calendar" size={16} className="mr-2" />
                        {datePayment ? format(datePayment, 'PP', { locale: ru }) : 'Выберите дату'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={datePayment}
                        onSelect={setDatePayment}
                        locale={ru}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Дедлайн</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Icon name="Calendar" size={16} className="mr-2" />
                        {dateDeadline ? format(dateDeadline, 'PP', { locale: ru }) : 'Выберите дату'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateDeadline}
                        onSelect={setDateDeadline}
                        locale={ru}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Дата истечения</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Icon name="Calendar" size={16} className="mr-2" />
                        {dateExpiry ? format(dateExpiry, 'PP', { locale: ru }) : 'Выберите дату'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateExpiry}
                        onSelect={setDateExpiry}
                        locale={ru}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tags">Теги</Label>
              <Input
                id="edit-tags"
                placeholder="Введите теги через запятую: договор, поставка, оборудование"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Разделяйте теги запятыми для удобной фильтрации
              </p>
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="edit-pdf">PDF документ</Label>
              {currentPdfUrl && !pdfFile && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md mb-2">
                  <Icon name="FileText" size={16} className="text-muted-foreground" />
                  <span className="text-sm flex-1">PDF файл прикреплен</span>
                  <Button variant="outline" size="sm" asChild>
                    <a href={currentPdfUrl} target="_blank" rel="noopener noreferrer">
                      Открыть
                    </a>
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-4">
                <Input
                  id="edit-pdf"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                {pdfFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="FileText" size={16} />
                    <span>{pdfFile.name}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {currentPdfUrl ? 'Загрузите новый файл для замены текущего' : 'Загрузите PDF файл документа (максимум 10 МБ)'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={uploading}>
              <Icon name={uploading ? "Loader2" : "Save"} size={18} className={`mr-2 ${uploading ? 'animate-spin' : ''}`} />
              {uploading ? 'Загрузка...' : 'Сохранить изменения'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDocumentDialog;
