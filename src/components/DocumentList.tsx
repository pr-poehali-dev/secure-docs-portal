import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Document } from './DocumentPortal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DocumentListProps {
  documents: Document[];
  filters: {
    searchQuery: string;
    priority: string;
    tags: string[];
    dateFrom: Date | null;
    dateTo: Date | null;
  };
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  isArchive?: boolean;
}

const DocumentList = ({ documents, filters, onDelete, onArchive, isArchive }: DocumentListProps) => {
  const filteredDocuments = documents.filter(doc => {
    if (filters.searchQuery && !doc.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
        !doc.description.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.priority !== 'all' && doc.priority !== filters.priority) {
      return false;
    }
    if (filters.tags.length > 0 && !filters.tags.some(tag => doc.tags.includes(tag))) {
      return false;
    }
    if (filters.dateFrom && doc.dueDate < filters.dateFrom) {
      return false;
    }
    if (filters.dateTo && doc.dueDate > filters.dateTo) {
      return false;
    }
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return priority;
    }
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const days = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: 'Просрочен', variant: 'destructive' as const };
    if (days === 0) return { text: 'Сегодня', variant: 'destructive' as const };
    if (days <= 7) return { text: `${days} дн.`, variant: 'destructive' as const };
    if (days <= 14) return { text: `${days} дн.`, variant: 'default' as const };
    return { text: `${days} дн.`, variant: 'secondary' as const };
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
        const daysUntil = getDaysUntilDue(doc.dueDate);
        
        return (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    <Badge variant={getPriorityColor(doc.priority)}>
                      {getPriorityLabel(doc.priority)}
                    </Badge>
                    {!isArchive && (
                      <Badge variant={daysUntil.variant}>
                        <Icon name="Clock" size={12} className="mr-1" />
                        {daysUntil.text}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{doc.description}</CardDescription>
                </div>
                <div className="flex gap-1">
                  {!isArchive && onArchive && (
                    <Button variant="ghost" size="icon" onClick={() => onArchive(doc.id)}>
                      <Icon name="Archive" size={18} />
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Icon name="Trash2" size={18} className="text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Удалить документ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Это действие невозможно отменить. Документ будет удален навсегда.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(doc.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="Calendar" size={16} />
                  <span>Создан: {doc.date.toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="CalendarClock" size={16} />
                  <span>Срок: {doc.dueDate.toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {doc.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Icon name="Tag" size={12} className="mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
              {doc.customFields && Object.keys(doc.customFields).length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                  {Object.entries(doc.customFields).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="text-muted-foreground">{key}: </span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DocumentList;
