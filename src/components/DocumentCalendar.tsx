import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import Icon from '@/components/ui/icon';
import { Document } from './DocumentPortal';
import { useState } from 'react';
import { ru } from 'date-fns/locale';

interface DocumentCalendarProps {
  documents: Document[];
}

const DocumentCalendar = ({ documents }: DocumentCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const documentsOnDate = selectedDate
    ? documents.filter(doc => {
        const docDate = new Date(doc.dueDate);
        return (
          docDate.getDate() === selectedDate.getDate() &&
          docDate.getMonth() === selectedDate.getMonth() &&
          docDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];

  const datesWithDocuments = documents.map(doc => doc.dueDate);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Calendar" size={24} />
            Календарь дедлайнов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={ru}
            className="rounded-md border w-full"
            modifiers={{
              hasDocument: datesWithDocuments,
            }}
            modifiersStyles={{
              hasDocument: {
                fontWeight: 'bold',
                textDecoration: 'underline',
                color: 'hsl(var(--primary))',
              },
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="FileText" size={24} />
            Документы на выбранную дату
          </CardTitle>
          {selectedDate && (
            <p className="text-sm text-muted-foreground">
              {selectedDate.toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {documentsOnDate.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="CalendarX" size={48} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">На эту дату нет документов с дедлайнами</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documentsOnDate.map(doc => (
                <Card key={doc.id} className="border-l-4" style={{ borderLeftColor: `hsl(var(--${getPriorityColor(doc.priority)}))` }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold">{doc.title}</h4>
                      <Badge variant={getPriorityColor(doc.priority)}>
                        {doc.priority === 'high' ? 'Высокий' : doc.priority === 'medium' ? 'Средний' : 'Низкий'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="TrendingUp" size={24} />
            Статистика по месяцам
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Всего документов', value: documents.length, icon: 'FileText', color: 'primary' },
              { label: 'Высокий приоритет', value: documents.filter(d => d.priority === 'high').length, icon: 'AlertCircle', color: 'destructive' },
              { label: 'Средний приоритет', value: documents.filter(d => d.priority === 'medium').length, icon: 'Info', color: 'default' },
              { label: 'Низкий приоритет', value: documents.filter(d => d.priority === 'low').length, icon: 'CircleCheck', color: 'secondary' },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name={stat.icon as any} size={20} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentCalendar;
