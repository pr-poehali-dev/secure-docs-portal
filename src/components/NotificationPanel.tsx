import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Document } from '@/lib/api';

interface NotificationPanelProps {
  documents: Document[];
}

const NotificationPanel = ({ documents }: NotificationPanelProps) => {
  const getUrgencyLevel = (daysUntil: number) => {
    if (daysUntil <= 3) return { level: 'Критично', color: 'destructive' as const, icon: 'AlertCircle' };
    if (daysUntil <= 7) return { level: 'Срочно', color: 'default' as const, icon: 'Clock' };
    return { level: 'Скоро', color: 'secondary' as const, icon: 'Info' };
  };

  const sortedDocuments = [...documents].sort((a, b) => {
    const dateA = a.date_deadline ? new Date(a.date_deadline).getTime() : 0;
    const dateB = b.date_deadline ? new Date(b.date_deadline).getTime() : 0;
    return dateA - dateB;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/20">
              <Icon name="Bell" size={28} className="text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Уведомления о дедлайнах</CardTitle>
              <CardDescription className="text-base">
                {documents.length === 0 
                  ? 'Нет приближающихся дедлайнов' 
                  : `${documents.length} ${documents.length === 1 ? 'документ требует' : 'документов требуют'} внимания в ближайшие 14 дней`
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Icon name="CheckCircle2" size={64} className="mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Все отлично!</h3>
            <p className="text-muted-foreground">
              Нет срочных документов, требующих внимания в ближайшее время
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedDocuments.map(doc => {
            if (!doc.date_deadline) return null;
            const deadline = new Date(doc.date_deadline);
            const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            const urgency = getUrgencyLevel(daysUntil);

            return (
              <Card 
                key={doc.id} 
                className="border-l-4 hover:shadow-lg transition-shadow"
                style={{ borderLeftColor: `hsl(var(--${urgency.color}))` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name={urgency.icon as any} size={20} className="text-muted-foreground" />
                        <Badge variant={urgency.color} className="font-semibold">
                          {urgency.level}
                        </Badge>
                        <Badge variant="outline">
                          {daysUntil === 0 ? 'Сегодня' : `Через ${daysUntil} ${daysUntil === 1 ? 'день' : daysUntil < 5 ? 'дня' : 'дней'}`}
                        </Badge>
                        {doc.project_name && (
                          <Badge variant="outline">
                            <Icon name="FolderKanban" size={12} className="mr-1" />
                            {doc.project_name}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl mb-1">{doc.title}</CardTitle>
                      <CardDescription>{doc.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doc.date_signed && (
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="FileSignature" size={16} className="text-muted-foreground" />
                        <span className="text-muted-foreground">Подписан:</span>
                        <span className="font-medium">{new Date(doc.date_signed).toLocaleDateString('ru-RU')}</span>
                      </div>
                    )}
                    {doc.date_payment && (
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="DollarSign" size={16} className="text-muted-foreground" />
                        <span className="text-muted-foreground">Оплата:</span>
                        <span className="font-medium">{new Date(doc.date_payment).toLocaleDateString('ru-RU')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="CalendarClock" size={16} className="text-muted-foreground" />
                      <span className="text-muted-foreground">Дедлайн:</span>
                      <span className="font-medium text-destructive">
                        {deadline.toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    {doc.date_expiry && (
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="CalendarX" size={16} className="text-muted-foreground" />
                        <span className="text-muted-foreground">Истекает:</span>
                        <span className="font-medium">{new Date(doc.date_expiry).toLocaleDateString('ru-RU')}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {doc.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Icon name="Tag" size={12} className="mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {doc.customFields && Object.keys(doc.customFields).length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t">
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
      )}
    </div>
  );
};

export default NotificationPanel;