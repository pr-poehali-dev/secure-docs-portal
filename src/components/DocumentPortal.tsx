import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import DocumentList from './DocumentList';
import DocumentFilters from './DocumentFilters';
import DocumentCalendar from './DocumentCalendar';
import NotificationPanel from './NotificationPanel';
import AddDocumentDialog from './AddDocumentDialog';
import EditDocumentDialog from './EditDocumentDialog';
import DeleteDocumentDialog from './DeleteDocumentDialog';
import { api, Document } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface DocumentPortalProps {
  onLogout: () => void;
}

const DocumentPortal = ({ onLogout }: DocumentPortalProps) => {
  const [activeView, setActiveView] = useState<'documents' | 'calendar' | 'notifications' | 'archive'>('documents');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const [filters, setFilters] = useState({
    searchQuery: '',
    tags: [] as string[],
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
    projectId: null as number | null,
  });

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await api.getDocuments();
      setDocuments(docs);
    } catch (error) {
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить документы',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const addDocument = async (doc: any) => {
    try {
      const newDoc = await api.createDocument({
        title: doc.title,
        description: doc.description,
        project_id: doc.project_id,
        status: 'active',
        tags: doc.tags,
        date_signed: doc.date_signed,
        date_payment: doc.date_payment,
        date_deadline: doc.date_deadline,
        date_expiry: doc.date_expiry,
        pdf_url: doc.pdf_url,
      });
      setDocuments([newDoc, ...documents]);
      toast({
        title: 'Документ добавлен',
        description: `"${newDoc.title}" успешно добавлен в систему`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить документ',
        variant: 'destructive',
      });
    }
  };

  const updateDocument = async (doc: Document) => {
    try {
      const updated = await api.updateDocument({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        project_id: doc.project_id,
        status: doc.status,
        tags: doc.tags,
        date_signed: doc.date_signed,
        date_payment: doc.date_payment,
        date_deadline: doc.date_deadline,
        date_expiry: doc.date_expiry,
        pdf_url: doc.pdf_url,
      });
      setDocuments(documents.map(d => d.id === updated.id ? updated : d));
      toast({
        title: 'Документ обновлен',
        description: `"${updated.title}" успешно обновлен`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить документ',
        variant: 'destructive',
      });
    }
  };

  const archiveDocument = async (id: number) => {
    const doc = documents.find(d => d.id === id);
    if (doc) {
      await updateDocument({ ...doc, status: 'archived' });
    }
  };

  const handleEditDocument = (doc: Document) => {
    setEditingDocument(doc);
    setEditDialogOpen(true);
  };

  const handleDeleteDocument = (doc: Document) => {
    setDeletingDocument(doc);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteDocument = async () => {
    if (!deletingDocument) return;

    try {
      await api.deleteDocument(deletingDocument.id);
      setDocuments(documents.filter(d => d.id !== deletingDocument.id));
      toast({
        title: 'Документ удален',
        description: `"${deletingDocument.title}" успешно удален из системы`,
      });
      setDeleteDialogOpen(false);
      setDeletingDocument(null);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить документ',
        variant: 'destructive',
      });
    }
  };

  const activeDocuments = documents.filter(doc => doc.status === 'active');
  const archivedDocuments = documents.filter(doc => doc.status === 'archived');

  const upcomingDeadlines = activeDocuments
    .filter(doc => {
      if (!doc.date_deadline) return false;
      const deadline = new Date(doc.date_deadline);
      const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 14 && daysUntil >= 0;
    })
    .sort((a, b) => {
      const dateA = a.date_deadline ? new Date(a.date_deadline).getTime() : 0;
      const dateB = b.date_deadline ? new Date(b.date_deadline).getTime() : 0;
      return dateA - dateB;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Загрузка документов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="FileText" size={24} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Портал документов</h1>
              <p className="text-xs text-muted-foreground">Система управления и контроля</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {upcomingDeadlines.length > 0 && (
              <Badge variant="destructive" className="px-3 py-1">
                <Icon name="Bell" size={14} className="mr-1" />
                {upcomingDeadlines.length} уведомлений
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={onLogout}>
              <Icon name="LogOut" size={16} className="mr-2" />
              Выход
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <nav className="flex gap-2 mb-6 bg-card p-2 rounded-lg border">
          <Button
            variant={activeView === 'documents' ? 'default' : 'ghost'}
            onClick={() => setActiveView('documents')}
            className="flex-1"
          >
            <Icon name="FileText" size={18} className="mr-2" />
            Документы
            <Badge variant="secondary" className="ml-2">{activeDocuments.length}</Badge>
          </Button>
          <Button
            variant={activeView === 'calendar' ? 'default' : 'ghost'}
            onClick={() => setActiveView('calendar')}
            className="flex-1"
          >
            <Icon name="Calendar" size={18} className="mr-2" />
            Календарь
          </Button>
          <Button
            variant={activeView === 'notifications' ? 'default' : 'ghost'}
            onClick={() => setActiveView('notifications')}
            className="flex-1"
          >
            <Icon name="Bell" size={18} className="mr-2" />
            Уведомления
            {upcomingDeadlines.length > 0 && (
              <Badge variant="destructive" className="ml-2">{upcomingDeadlines.length}</Badge>
            )}
          </Button>
          <Button
            variant={activeView === 'archive' ? 'default' : 'ghost'}
            onClick={() => setActiveView('archive')}
            className="flex-1"
          >
            <Icon name="Archive" size={18} className="mr-2" />
            Архив
            <Badge variant="secondary" className="ml-2">{archivedDocuments.length}</Badge>
          </Button>
        </nav>

        {activeView === 'documents' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <DocumentFilters filters={filters} onFiltersChange={setFilters} />
            </div>
            <div className="lg:col-span-3">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Активные документы</h2>
                <AddDocumentDialog onAdd={addDocument} />
              </div>
              <DocumentList
                documents={activeDocuments}
                filters={filters}
                onArchive={archiveDocument}
                onEdit={handleEditDocument}
                onDelete={handleDeleteDocument}
              />
            </div>
          </div>
        )}

        {activeView === 'calendar' && (
          <DocumentCalendar documents={activeDocuments} />
        )}

        {activeView === 'notifications' && (
          <NotificationPanel documents={upcomingDeadlines} />
        )}

        {activeView === 'archive' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Архив документов</h2>
            <DocumentList
              documents={archivedDocuments}
              filters={filters}
              onDelete={handleDeleteDocument}
              isArchive
            />
          </div>
        )}
      </div>

      <EditDocumentDialog
        document={editingDocument}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdate={updateDocument}
      />

      <DeleteDocumentDialog
        document={deletingDocument}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteDocument}
      />
    </div>
  );
};

export default DocumentPortal;