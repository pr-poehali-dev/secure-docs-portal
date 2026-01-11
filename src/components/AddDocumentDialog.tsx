import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { api, Project } from '@/lib/api';

interface AddDocumentDialogProps {
  onAdd: (doc: any) => void;
}

const AddDocumentDialog = ({ onAdd }: AddDocumentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const [dateSigned, setDateSigned] = useState<Date>();
  const [dateDeadline, setDateDeadline] = useState<Date>();
  const [dateExpiry, setDateExpiry] = useState<Date>();
  const [milestoneDate1, setMilestoneDate1] = useState<Date>();
  const [milestoneDesc1, setMilestoneDesc1] = useState('');
  const [milestoneDate2, setMilestoneDate2] = useState<Date>();
  const [milestoneDesc2, setMilestoneDesc2] = useState('');
  const [milestoneDate3, setMilestoneDate3] = useState<Date>();
  const [milestoneDesc3, setMilestoneDesc3] = useState('');
  const [tags, setTags] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    let pdfUrl: string | undefined;

    if (pdfFile) {
      try {
        setUploading(true);
        pdfUrl = await api.uploadPDF(pdfFile);
        toast({
          title: 'PDF загружен',
          description: 'Файл успешно загружен в облако',
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

    const newDocument = {
      title,
      document_number: documentNumber || undefined,
      description,
      project_id: projectId ? parseInt(projectId) : undefined,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      date_signed: dateSigned ? format(dateSigned, 'yyyy-MM-dd') : undefined,
      date_deadline: dateDeadline ? format(dateDeadline, 'yyyy-MM-dd') : undefined,
      date_expiry: dateExpiry ? format(dateExpiry, 'yyyy-MM-dd') : undefined,
      milestone_date_1: milestoneDate1 ? format(milestoneDate1, 'yyyy-MM-dd') : undefined,
      milestone_desc_1: milestoneDesc1 || undefined,
      milestone_date_2: milestoneDate2 ? format(milestoneDate2, 'yyyy-MM-dd') : undefined,
      milestone_desc_2: milestoneDesc2 || undefined,
      milestone_date_3: milestoneDate3 ? format(milestoneDate3, 'yyyy-MM-dd') : undefined,
      milestone_desc_3: milestoneDesc3 || undefined,
      pdf_url: pdfUrl,
    };

    onAdd(newDocument);

    setTitle('');
    setDocumentNumber('');
    setDescription('');
    setProjectId('');
    setDateSigned(undefined);
    setDateDeadline(undefined);
    setDateExpiry(undefined);
    setMilestoneDate1(undefined);
    setMilestoneDesc1('');
    setMilestoneDate2(undefined);
    setMilestoneDesc2('');
    setMilestoneDate3(undefined);
    setMilestoneDesc3('');
    setTags('');
    setPdfFile(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Icon name="Plus" size={18} className="mr-2" />
          Добавить документ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новый документ</DialogTitle>
          <DialogDescription>
            Заполните информацию о документе для добавления в систему
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название документа *</Label>
                <Input
                  id="title"
                  placeholder="Например: Договор поставки оборудования"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document-number">Номер документа</Label>
                <Input
                  id="document-number"
                  placeholder="Например: ДОГ-2024-001"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание *</Label>
              <Textarea
                id="description"
                placeholder="Краткое описание документа и его назначения"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Проект</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger id="project">
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

            <div className="space-y-3 border-t pt-4" style={{ display: 'none' }}>
              <div className="space-y-2">
                <Label htmlFor="priority">Приоритет</Label>
                <Select
                  value={'medium'}
                  onValueChange={() => {}}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medium">Средний</SelectItem>
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

            <div className="space-y-3 border-t pt-4">
              <h3 className="font-semibold text-sm">Знаковые даты</h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Знаковая дата №1</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Icon name="Calendar" size={16} className="mr-2" />
                          {milestoneDate1 ? format(milestoneDate1, 'PP', { locale: ru }) : 'Выберите дату'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={milestoneDate1}
                          onSelect={setMilestoneDate1}
                          locale={ru}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="milestone-desc-1">Описание</Label>
                    <Input
                      id="milestone-desc-1"
                      placeholder="Например: Начало работ"
                      value={milestoneDesc1}
                      onChange={(e) => setMilestoneDesc1(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Знаковая дата №2</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Icon name="Calendar" size={16} className="mr-2" />
                          {milestoneDate2 ? format(milestoneDate2, 'PP', { locale: ru }) : 'Выберите дату'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={milestoneDate2}
                          onSelect={setMilestoneDate2}
                          locale={ru}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="milestone-desc-2">Описание</Label>
                    <Input
                      id="milestone-desc-2"
                      placeholder="Например: Промежуточная приемка"
                      value={milestoneDesc2}
                      onChange={(e) => setMilestoneDesc2(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Знаковая дата №3</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Icon name="Calendar" size={16} className="mr-2" />
                          {milestoneDate3 ? format(milestoneDate3, 'PP', { locale: ru }) : 'Выберите дату'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={milestoneDate3}
                          onSelect={setMilestoneDate3}
                          locale={ru}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="milestone-desc-3">Описание</Label>
                    <Input
                      id="milestone-desc-3"
                      placeholder="Например: Финальная сдача"
                      value={milestoneDesc3}
                      onChange={(e) => setMilestoneDesc3(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Теги</Label>
              <Input
                id="tags"
                placeholder="Введите теги через запятую: договор, поставка, оборудование"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Разделяйте теги запятыми для удобной фильтрации
              </p>
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="pdf">PDF документ</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="pdf"
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
                Загрузите PDF файл документа (максимум 10 МБ)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={uploading}>
              <Icon name={uploading ? "Loader2" : "Save"} size={18} className={`mr-2 ${uploading ? 'animate-spin' : ''}`} />
              {uploading ? 'Загрузка...' : 'Сохранить документ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDocumentDialog;