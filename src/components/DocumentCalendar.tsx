import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import Icon from '@/components/ui/icon';
import { Document } from '@/lib/api';
import { useState } from 'react';
import { ru } from 'date-fns/locale';

interface DocumentCalendarProps {
  documents: Document[];
}

interface DateEvent {
  document: Document;
  dateType: 'signed' | 'deadline' | 'expiry' | 'milestone1' | 'milestone2' | 'milestone3';
  dateLabel: string;
  date: Date;
}

const DocumentCalendar = ({ documents }: DocumentCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const getAllDateEvents = (): DateEvent[] => {
    const events: DateEvent[] = [];

    documents.forEach(doc => {
      if (doc.date_signed) {
        events.push({
          document: doc,
          dateType: 'signed',
          dateLabel: 'Дата подписания',
          date: new Date(doc.date_signed),
        });
      }
      if (doc.date_deadline) {
        events.push({
          document: doc,
          dateType: 'deadline',
          dateLabel: 'Дедлайн',
          date: new Date(doc.date_deadline),
        });
      }
      if (doc.date_expiry) {
        events.push({
          document: doc,
          dateType: 'expiry',
          dateLabel: 'Дата истечения',
          date: new Date(doc.date_expiry),
        });
      }
      if (doc.milestone_date_1) {
        events.push({
          document: doc,
          dateType: 'milestone1',
          dateLabel: doc.milestone_desc_1 || 'Знаковая дата №1',
          date: new Date(doc.milestone_date_1),
        });
      }
      if (doc.milestone_date_2) {
        events.push({
          document: doc,
          dateType: 'milestone2',
          dateLabel: doc.milestone_desc_2 || 'Знаковая дата №2',
          date: new Date(doc.milestone_date_2),
        });
      }
      if (doc.milestone_date_3) {
        events.push({
          document: doc,
          dateType: 'milestone3',
          dateLabel: doc.milestone_desc_3 || 'Знаковая дата №3',
          date: new Date(doc.milestone_date_3),
        });
      }
    });

    return events;
  };

  const allDateEvents = getAllDateEvents();

  const eventsOnDate = selectedDate
    ? allDateEvents.filter(event => {
        return (
          event.date.getDate() === selectedDate.getDate() &&
          event.date.getMonth() === selectedDate.getMonth() &&
          event.date.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];

  const datesWithEvents = allDateEvents.map(event => event.date);

  const getDateTypeIcon = (dateType: string) => {
    switch (dateType) {
      case 'signed': return 'FileSignature';
      case 'deadline': return 'CalendarClock';
      case 'expiry': return 'CalendarX';
      case 'milestone1':
      case 'milestone2':
      case 'milestone3': return 'Star';
      default: return 'Calendar';
    }
  };

  const getDateTypeColor = (dateType: string) => {
    switch (dateType) {
      case 'signed': return 'default';
      case 'deadline': return 'destructive';
      case 'expiry': return 'secondary';
      case 'milestone1':
      case 'milestone2':
      case 'milestone3': return 'default';
      default: return 'outline';
    }
  };

  const totalEvents = allDateEvents.length;
  const deadlineEvents = allDateEvents.filter(e => e.dateType === 'deadline').length;
  const milestoneEvents = allDateEvents.filter(e => e.dateType.startsWith('milestone')).length;
  const expiryEvents = allDateEvents.filter(e => e.dateType === 'expiry').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Calendar" size={24} />
            Календарь важных дат
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
              hasEvent: datesWithEvents,
            }}
            modifiersStyles={{
              hasEvent: {
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
            События на выбранную дату
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
          {eventsOnDate.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="CalendarX" size={48} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">На эту дату нет событий</p>
            </div>
          ) : (
            <div className="space-y-3">
              {eventsOnDate.map((event, index) => (
                <Card key={`${event.document.id}-${event.dateType}-${index}`} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <Icon 
                        name={getDateTypeIcon(event.dateType) as any} 
                        size={20} 
                        className="text-primary mt-0.5" 
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold">{event.document.title}</h4>
                          <Badge variant={getDateTypeColor(event.dateType) as any}>
                            {event.dateLabel}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{event.document.description}</p>
                        {event.document.project_name && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Icon name="FolderKanban" size={12} />
                            <span>{event.document.project_name}</span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {event.document.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
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
            Статистика событий
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Всего событий', value: totalEvents, icon: 'Calendar', color: 'primary' },
              { label: 'Дедлайны', value: deadlineEvents, icon: 'CalendarClock', color: 'destructive' },
              { label: 'Знаковые даты', value: milestoneEvents, icon: 'Star', color: 'default' },
              { label: 'Даты истечения', value: expiryEvents, icon: 'CalendarX', color: 'secondary' },
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
