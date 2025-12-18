import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Document } from '@/lib/api';

interface DocumentListProps {
  documents: Document[];
  filters: {
    searchQuery: string;
    priority: string;
    tags: string[];
    dateFrom: Date | null;
    dateTo: Date | null;
    projectId: number | null;
  };
  onArchive?: (id: number) => void;
  onEdit?: (doc: Document) => void;
  onDelete?: (doc: Document) => void;
  isArchive?: boolean;
}

const DocumentList = ({ documents, filters, onArchive, onEdit, onDelete, isArchive }: DocumentListProps) => {
  const filteredDocuments = documents.filter(doc => {
    if (filters.searchQuery && !doc.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
        !doc.description.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.tags.length > 0 && !filters.tags.some(tag => doc.tags.includes(tag))) {
      return false;
    }
    if (filters.projectId && doc.project_id !== filters.projectId) {
      return false;
    }
    if (filters.dateFrom && doc.date_deadline) {
      const deadline = new Date(doc.date_deadline);
      if (deadline < filters.dateFrom) return false;
    }
    if (filters.dateTo && doc.date_deadline) {
      const deadline = new Date(doc.date_deadline);
      if (deadline > filters.dateTo) return false;
    }
    return true;
  });



  const getDaysUntilDue = (dateStr: string | null) => {
    if (!dateStr) return null;
    const dueDate = new Date(dateStr);
    const days = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: 'Просрочен', variant: 'destructive' as const };
    if (days === 0) return { text: 'Сегодня', variant: 'destructive' as const };
    if (days <= 7) return { text: `${days} дн.`, variant: 'destructive' as const };
    if (days <= 14) return { text: `${days} дн.`, variant: 'default' as const };
    return { text: `${days} дн.`, variant: 'secondary' as const };
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  if (filteredDocuments.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Icon name="FileSearch" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Документы не найдены</h3>
          <p className="text-muted-foreground">Попробуйте изменить параметры фильтрации</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filteredDocuments.map(doc => {
        const daysUntil = getDaysUntilDue(doc.date_deadline);
        
        return (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    {!isArchive && daysUntil && (
                      <Badge variant={daysUntil.variant}>
                        <Icon name="Clock" size={12} className="mr-1" />
                        {daysUntil.text}
                      </Badge>
                    )}
                    {doc.project_name && (
                      <Badge variant="outline">
                        <Icon name="FolderKanban" size={12} className="mr-1" />
                        {doc.project_name}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{doc.description}</CardDescription>
                </div>
                <div className="flex gap-1">
                  {!isArchive && onEdit && (
                    <Button variant="ghost" size="icon" onClick={() => onEdit(doc)} title="Редактировать">
                      <Icon name="Pencil" size={18} />
                    </Button>
                  )}
                  {!isArchive && onArchive && (
                    <Button variant="ghost" size="icon" onClick={() => onArchive(doc.id)} title="Архивировать">
                      <Icon name="Archive" size={18} />
                    </Button>
                  )}
                  {onDelete && (
                    <Button variant="ghost" size="icon" onClick={() => onDelete(doc)} title="Удалить" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Icon name="Trash2" size={18} />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {doc.date_signed && (
                  <div className="flex items-start gap-2 text-sm">
                    <Icon name="FileSignature" size={16} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Подписан</p>
                      <p className="font-medium">{formatDate(doc.date_signed)}</p>
                    </div>
                  </div>
                )}
                {doc.date_payment && (
                  <div className="flex items-start gap-2 text-sm">
                    <Icon name="DollarSign" size={16} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Оплата</p>
                      <p className="font-medium">{formatDate(doc.date_payment)}</p>
                    </div>
                  </div>
                )}
                {doc.date_deadline && (
                  <div className="flex items-start gap-2 text-sm">
                    <Icon name="CalendarClock" size={16} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Дедлайн</p>
                      <p className="font-medium">{formatDate(doc.date_deadline)}</p>
                    </div>
                  </div>
                )}
                {doc.date_expiry && (
                  <div className="flex items-start gap-2 text-sm">
                    <Icon name="CalendarX" size={16} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Истекает</p>
                      <p className="font-medium">{formatDate(doc.date_expiry)}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {doc.tags && doc.tags.length > 0 && doc.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Icon name="Tag" size={12} className="mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                {doc.pdf_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={doc.pdf_url} target="_blank" rel="noopener noreferrer">
                      <Icon name="FileText" size={16} className="mr-2" />
                      Открыть PDF
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DocumentList;