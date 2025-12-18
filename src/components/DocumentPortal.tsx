import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import DocumentList from './DocumentList';
import DocumentFilters from './DocumentFilters';
import DocumentCalendar from './DocumentCalendar';
import NotificationPanel from './NotificationPanel';
import AddDocumentDialog from './AddDocumentDialog';

interface DocumentPortalProps {
  onLogout: () => void;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  date: Date;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'archived';
  tags: string[];
  customFields?: Record<string, string>;
}

const DocumentPortal = ({ onLogout }: DocumentPortalProps) => {
  const [activeView, setActiveView] = useState<'documents' | 'calendar' | 'notifications' | 'archive'>('documents');
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'Договор поставки оборудования',
      description: 'Контракт с ООО "Техносервис" на поставку серверного оборудования',
      date: new Date('2024-01-15'),
      dueDate: new Date('2024-12-30'),
      priority: 'high',
      status: 'active',
      tags: ['договор', 'поставка', 'оборудование'],
      customFields: { contractor: 'ООО "Техносервис"', amount: '5 000 000 ₽' }
    },
    {
      id: '2',
      title: 'Годовой отчет 2024',
      description: 'Финансовая отчетность за 2024 год для налоговой службы',
      date: new Date('2024-11-20'),
      dueDate: new Date('2024-12-25'),
      priority: 'high',
      status: 'active',
      tags: ['отчетность', 'финансы', 'налоги'],
      customFields: { department: 'Бухгалтерия', type: 'Финансовый отчет' }
    },
    {
      id: '3',
      title: 'Протокол собрания акционеров',
      description: 'Решения годового собрания акционеров от 15.11.2024',
      date: new Date('2024-11-15'),
      dueDate: new Date('2025-01-15'),
      priority: 'medium',
      status: 'active',
      tags: ['протокол', 'акционеры', 'юридический'],
      customFields: { participants: '23 акционера', location: 'Конференц-зал' }
    },
    {
      id: '4',
      title: 'Лицензионное соглашение',
      description: 'Соглашение на использование программного обеспечения',
      date: new Date('2024-06-10'),
      dueDate: new Date('2025-06-10'),
      priority: 'low',
      status: 'active',
      tags: ['лицензия', 'ПО', 'договор'],
      customFields: { vendor: 'Microsoft', license_type: 'Enterprise' }
    },
    {
      id: '5',
      title: 'Архивный договор аренды 2023',
      description: 'Завершенный договор аренды офисного помещения',
      date: new Date('2023-01-10'),
      dueDate: new Date('2023-12-31'),
      priority: 'low',
      status: 'archived',
      tags: ['аренда', 'офис', 'завершен'],
      customFields: { location: 'ул. Ленина, д.25', area: '150 кв.м' }
    }
  ]);

  const [filters, setFilters] = useState({
    searchQuery: '',
    priority: 'all',
    tags: [] as string[],
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
  });

  const addDocument = (doc: Omit<Document, 'id'>) => {
    const newDoc = {
      ...doc,
      id: String(Date.now()),
    };
    setDocuments([newDoc, ...documents]);
  };

  const deleteDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const archiveDocument = (id: string) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, status: 'archived' as const } : doc
    ));
  };

  const activeDocuments = documents.filter(doc => doc.status === 'active');
  const archivedDocuments = documents.filter(doc => doc.status === 'archived');

  const upcomingDeadlines = activeDocuments
    .filter(doc => {
      const daysUntil = Math.ceil((doc.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 14 && daysUntil >= 0;
    })
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

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
                onDelete={deleteDocument}
                onArchive={archiveDocument}
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
              onDelete={deleteDocument}
              isArchive
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentPortal;
