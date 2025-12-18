import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface DocumentFiltersProps {
  filters: {
    searchQuery: string;
    priority: string;
    tags: string[];
    dateFrom: Date | null;
    dateTo: Date | null;
    projectId: number | null;
  };
  onFiltersChange: (filters: any) => void;
}

const availableTags = [
  'договор',
  'поставка',
  'оборудование',
  'отчетность',
  'финансы',
  'налоги',
  'протокол',
  'акционеры',
  'юридический',
  'лицензия',
  'ПО',
  'аренда',
  'офис',
];

const DocumentFilters = ({ filters, onFiltersChange }: DocumentFiltersProps) => {
  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: newTags });
  };

  const resetFilters = () => {
    onFiltersChange({
      searchQuery: '',
      priority: 'all',
      tags: [],
      dateFrom: null,
      dateTo: null,
      projectId: null,
    });
  };

  const hasActiveFilters = 
    filters.searchQuery || 
    filters.priority !== 'all' || 
    filters.tags.length > 0 || 
    filters.dateFrom || 
    filters.dateTo ||
    filters.projectId;

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="Filter" size={20} />
            Фильтры
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <Icon name="X" size={16} className="mr-1" />
              Сбросить
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Поиск</Label>
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Название или описание..."
              value={filters.searchQuery}
              onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Приоритет</Label>
          <Select
            value={filters.priority}
            onValueChange={(value) => onFiltersChange({ ...filters, priority: value })}
          >
            <SelectTrigger id="priority">
              <SelectValue placeholder="Все приоритеты" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все приоритеты</SelectItem>
              <SelectItem value="high">Высокий</SelectItem>
              <SelectItem value="medium">Средний</SelectItem>
              <SelectItem value="low">Низкий</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Дата с</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <Icon name="Calendar" size={16} className="mr-2" />
                {filters.dateFrom ? format(filters.dateFrom, 'PP', { locale: ru }) : 'Выберите дату'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateFrom || undefined}
                onSelect={(date) => onFiltersChange({ ...filters, dateFrom: date || null })}
                locale={ru}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Дата по</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <Icon name="Calendar" size={16} className="mr-2" />
                {filters.dateTo ? format(filters.dateTo, 'PP', { locale: ru }) : 'Выберите дату'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateTo || undefined}
                onSelect={(date) => onFiltersChange({ ...filters, dateTo: date || null })}
                locale={ru}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Теги</Label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <Badge
                key={tag}
                variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentFilters;