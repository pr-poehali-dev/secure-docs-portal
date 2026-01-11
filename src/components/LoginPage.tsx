import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: 0 });
  const { toast } = useToast();

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ num1, num2, answer: num1 + num2 });
    setCaptchaAnswer('');
  };

  useEffect(() => {
    generateCaptcha();
    
    const savedUsers = localStorage.getItem('admin_users');
    const dataVersion = localStorage.getItem('admin_users_version');
    
    if (!savedUsers || dataVersion !== '2') {
      const defaultUsers = [
        { id: 1, name: 'Администратор', login: 'admin', email: 'admin@company.com', role: 'admin', status: 'active', created_at: '2024-01-15', password: 'admin123' },
        { id: 2, name: 'Менеджер проектов', login: 'manager', email: 'manager@company.com', role: 'user', status: 'active', created_at: '2024-02-20', password: 'manager123' },
      ];
      localStorage.setItem('admin_users', JSON.stringify(defaultUsers));
      localStorage.setItem('admin_users_version', '2');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (parseInt(captchaAnswer) !== captcha.answer) {
      toast({
        title: 'Ошибка',
        description: 'Неверный ответ на математический вопрос',
        variant: 'destructive',
      });
      generateCaptcha();
      return;
    }
    
    const savedUsers = localStorage.getItem('admin_users');
    let users = [];
    
    if (savedUsers) {
      users = JSON.parse(savedUsers);
    }
    
    const user = users.find((u: any) => u.login === username && u.password === password);
    
    if (user) {
      toast({
        title: 'Успешный вход',
        description: 'Добро пожаловать в систему управления документами',
      });
      onLogin();
    } else {
      toast({
        title: 'Ошибка входа',
        description: 'Неверный логин или пароль',
        variant: 'destructive',
      });
      generateCaptcha();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto mb-4">
            <img 
              src="https://cdn.poehali.dev/files/Графит на белом.png" 
              alt="ПСТРОЙ" 
              className="h-20 w-auto"
            />
          </div>
          <CardTitle className="text-3xl font-bold">Портал документов</CardTitle>
          <CardDescription className="text-base">
            Введите учетные данные для доступа к системе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Логин
              </Label>
              <div className="relative">
                <Icon name="User" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Введите логин"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Пароль
              </Label>
              <div className="relative">
                <Icon name="Lock" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="captcha" className="text-sm font-medium">
                Проверка на человека
              </Label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-muted px-4 py-3 rounded-lg font-mono text-lg font-semibold flex-1 justify-center">
                  {captcha.num1} + {captcha.num2} = ?
                </div>
                <Input
                  id="captcha"
                  type="number"
                  placeholder="?"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  className="w-20 text-center"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={generateCaptcha}
                  title="Обновить"
                >
                  <Icon name="RefreshCw" size={18} />
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full font-medium" size="lg">
              <Icon name="LogIn" size={18} className="mr-2" />
              Войти в систему
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;