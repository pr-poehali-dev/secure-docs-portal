import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { api, Project } from '@/lib/api';

interface User {
  id: number;
  name: string;
  login: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  created_at: string;
  password?: string;
}

const AdminPanel = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectStatus, setProjectStatus] = useState<string>('active');
  
  const [userName, setUserName] = useState('');
  const [userLogin, setUserLogin] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [userPassword, setUserPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const projectList = await api.getProjects();
      setProjects(projectList);
      
      const savedUsers = localStorage.getItem('admin_users');
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      } else {
        const defaultUsers = [
          { id: 1, name: 'Администратор', login: 'admin', email: 'admin@company.com', role: 'admin', status: 'active', created_at: '2024-01-15' },
          { id: 2, name: 'Менеджер проектов', login: 'manager', email: 'manager@company.com', role: 'user', status: 'active', created_at: '2024-02-20' },
        ];
        setUsers(defaultUsers);
        localStorage.setItem('admin_users', JSON.stringify(defaultUsers));
      }
    } catch (error) {
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить данные',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async () => {
    if (!projectName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название проекта',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newProject = await api.createProject({
        name: projectName,
        description: projectDescription,
        status: projectStatus,
      });
      setProjects([newProject, ...projects]);
      toast({
        title: 'Проект добавлен',
        description: `Проект "${newProject.name}" успешно создан`,
      });
      setAddProjectOpen(false);
      setProjectName('');
      setProjectDescription('');
      setProjectStatus('active');
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать проект',
        variant: 'destructive',
      });
    }
  };

  const handleEditProject = async () => {
    if (!selectedProject || !projectName.trim()) return;

    try {
      const updated = await api.updateProject({
        id: selectedProject.id,
        name: projectName,
        description: projectDescription,
        status: projectStatus,
      });
      setProjects(projects.map(p => p.id === updated.id ? updated : p));
      toast({
        title: 'Проект обновлен',
        description: `Проект "${updated.name}" успешно изменен`,
      });
      setEditProjectOpen(false);
      setSelectedProject(null);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить проект',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      await api.deleteProject(selectedProject.id);
      setProjects(projects.filter(p => p.id !== selectedProject.id));
      toast({
        title: 'Проект удален',
        description: `Проект "${selectedProject.name}" удален из системы`,
      });
      setDeleteProjectOpen(false);
      setSelectedProject(null);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить проект',
        variant: 'destructive',
      });
    }
  };

  const openEditProject = (project: Project) => {
    setSelectedProject(project);
    setProjectName(project.name);
    setProjectDescription(project.description || '');
    setProjectStatus(project.status);
    setEditProjectOpen(true);
  };

  const openDeleteProject = (project: Project) => {
    setSelectedProject(project);
    setDeleteProjectOpen(true);
  };

  const handleAddUser = () => {
    if (!userName.trim() || !userLogin.trim() || !userEmail.trim() || !userPassword.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    if (users.some(u => u.login === userLogin)) {
      toast({
        title: 'Ошибка',
        description: 'Пользователь с таким логином уже существует',
        variant: 'destructive',
      });
      return;
    }

    const newUser: User = {
      id: Date.now(),
      name: userName,
      login: userLogin,
      email: userEmail,
      role: userRole,
      status: 'active',
      created_at: new Date().toISOString().split('T')[0],
      password: userPassword,
    };

    const updatedUsers = [newUser, ...users];
    setUsers(updatedUsers);
    localStorage.setItem('admin_users', JSON.stringify(updatedUsers));
    toast({
      title: 'Пользователь добавлен',
      description: `Пользователь "${newUser.name}" успешно создан`,
    });
    setAddUserOpen(false);
    setUserName('');
    setUserLogin('');
    setUserEmail('');
    setUserRole('user');
    setUserPassword('');
  };

  const handleEditUser = () => {
    if (!selectedUser || !userName.trim() || !userLogin.trim() || !userEmail.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    if (users.some(u => u.login === userLogin && u.id !== selectedUser.id)) {
      toast({
        title: 'Ошибка',
        description: 'Пользователь с таким логином уже существует',
        variant: 'destructive',
      });
      return;
    }

    const updatedUser: User = {
      ...selectedUser,
      name: userName,
      login: userLogin,
      email: userEmail,
      role: userRole,
    };

    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('admin_users', JSON.stringify(updatedUsers));
    toast({
      title: 'Пользователь обновлен',
      description: `Данные пользователя "${updatedUser.name}" изменены`,
    });
    setEditUserOpen(false);
    setSelectedUser(null);
    setUserName('');
    setUserLogin('');
    setUserEmail('');
    setUserRole('user');
  };

  const handleChangePassword = () => {
    if (!selectedUser) return;

    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен содержать минимум 6 символов',
        variant: 'destructive',
      });
      return;
    }

    const updatedUsers = users.map(u => 
      u.id === selectedUser.id ? { ...u, password: newPassword } : u
    );
    
    console.log('Обновление пароля пользователя:', selectedUser.name, 'ID:', selectedUser.id);
    console.log('Обновленные пользователи:', updatedUsers);
    
    setUsers(updatedUsers);
    localStorage.setItem('admin_users', JSON.stringify(updatedUsers));
    
    toast({
      title: 'Пароль изменен',
      description: `Пароль пользователя "${selectedUser.name}" успешно изменен`,
    });
    setChangePasswordOpen(false);
    setSelectedUser(null);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;

    const updatedUsers = users.filter(u => u.id !== selectedUser.id);
    setUsers(updatedUsers);
    localStorage.setItem('admin_users', JSON.stringify(updatedUsers));
    toast({
      title: 'Пользователь удален',
      description: `Пользователь "${selectedUser.name}" удален из системы`,
    });
    setDeleteUserOpen(false);
    setSelectedUser(null);
  };

  const openEditUser = (user: User) => {
    setSelectedUser(user);
    setUserName(user.name);
    setUserLogin(user.login);
    setUserEmail(user.email);
    setUserRole(user.role);
    setEditUserOpen(true);
  };

  const openChangePassword = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setChangePasswordOpen(true);
  };

  const openDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteUserOpen(true);
  };

  const toggleUserStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const updatedUsers = users.map(u => u.id === user.id ? { ...u, status: newStatus } : u);
    setUsers(updatedUsers);
    localStorage.setItem('admin_users', JSON.stringify(updatedUsers));
    toast({
      title: 'Статус изменен',
      description: `Пользователь "${user.name}" ${newStatus === 'active' ? 'активирован' : 'деактивирован'}`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Административная панель</h2>
        <p className="text-muted-foreground">Управление проектами и пользователями системы</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Проекты</CardTitle>
              <CardDescription>Список всех проектов в системе</CardDescription>
            </div>
            <Dialog open={addProjectOpen} onOpenChange={setAddProjectOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Добавить проект
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Новый проект</DialogTitle>
                  <DialogDescription>Создайте новый проект для группировки документов</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Название *</Label>
                    <Input
                      id="project-name"
                      placeholder="Название проекта"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-description">Описание</Label>
                    <Textarea
                      id="project-description"
                      placeholder="Описание проекта"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-status">Статус</Label>
                    <Select value={projectStatus} onValueChange={setProjectStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Активный</SelectItem>
                        <SelectItem value="completed">Завершенный</SelectItem>
                        <SelectItem value="on_hold">Приостановлен</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddProjectOpen(false)}>Отмена</Button>
                  <Button onClick={handleAddProject}>Создать</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.map(project => (
              <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={
                      project.status === 'active' ? 'default' :
                      project.status === 'completed' ? 'secondary' : 'outline'
                    }>
                      {project.status === 'active' ? 'Активный' :
                       project.status === 'completed' ? 'Завершенный' : 'Приостановлен'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditProject(project)}>
                    <Icon name="Pencil" size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openDeleteProject(project)}>
                    <Icon name="Trash2" size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Пользователи</CardTitle>
              <CardDescription>Управление пользователями системы</CardDescription>
            </div>
            <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Icon name="UserPlus" size={18} className="mr-2" />
                  Добавить пользователя
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Новый пользователь</DialogTitle>
                  <DialogDescription>Создайте нового пользователя системы</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-name">Имя *</Label>
                    <Input
                      id="user-name"
                      placeholder="Имя пользователя"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-login">Логин *</Label>
                    <Input
                      id="user-login"
                      placeholder="login"
                      value={userLogin}
                      onChange={(e) => setUserLogin(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-email">Email *</Label>
                    <Input
                      id="user-email"
                      type="email"
                      placeholder="email@example.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-password">Пароль *</Label>
                    <Input
                      id="user-password"
                      type="password"
                      placeholder="Минимум 6 символов"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-role">Роль</Label>
                    <Select value={userRole} onValueChange={(v) => setUserRole(v as 'admin' | 'user')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Пользователь</SelectItem>
                        <SelectItem value="admin">Администратор</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddUserOpen(false)}>Отмена</Button>
                  <Button onClick={handleAddUser}>Создать</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{user.name}</h3>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status === 'active' ? 'Активен' : 'Неактивен'}
                    </Badge>
                    {user.role === 'admin' && (
                      <Badge variant="outline">
                        <Icon name="Shield" size={14} className="mr-1" />
                        Админ
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded mr-2">{user.login}</span>
                    {user.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Создан: {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditUser(user)} title="Редактировать">
                    <Icon name="Pencil" size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openChangePassword(user)} title="Сменить пароль">
                    <Icon name="Key" size={18} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => toggleUserStatus(user)}
                    title={user.status === 'active' ? 'Деактивировать' : 'Активировать'}
                  >
                    <Icon name={user.status === 'active' ? 'UserX' : 'UserCheck'} size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openDeleteUser(user)} title="Удалить">
                    <Icon name="Trash2" size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={editProjectOpen} onOpenChange={setEditProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать проект</DialogTitle>
            <DialogDescription>Изменить информацию о проекте</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-project-name">Название *</Label>
              <Input
                id="edit-project-name"
                placeholder="Название проекта"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-description">Описание</Label>
              <Textarea
                id="edit-project-description"
                placeholder="Описание проекта"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-status">Статус</Label>
              <Select value={projectStatus} onValueChange={setProjectStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активный</SelectItem>
                  <SelectItem value="completed">Завершенный</SelectItem>
                  <SelectItem value="on_hold">Приостановлен</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProjectOpen(false)}>Отмена</Button>
            <Button onClick={handleEditProject}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
            <DialogDescription>Изменить данные пользователя</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-user-name">Имя *</Label>
              <Input
                id="edit-user-name"
                placeholder="Имя пользователя"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-user-login">Логин *</Label>
              <Input
                id="edit-user-login"
                placeholder="login"
                value={userLogin}
                onChange={(e) => setUserLogin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-user-email">Email *</Label>
              <Input
                id="edit-user-email"
                type="email"
                placeholder="email@example.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-user-role">Роль</Label>
              <Select value={userRole} onValueChange={(v) => setUserRole(v as 'admin' | 'user')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Пользователь</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUserOpen(false)}>Отмена</Button>
            <Button onClick={handleEditUser}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сменить пароль</DialogTitle>
            <DialogDescription>
              Изменить пароль пользователя "{selectedUser?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Новый пароль *</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Минимум 6 символов"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Подтвердите пароль *</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Повторите новый пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>Отмена</Button>
            <Button onClick={handleChangePassword}>Изменить пароль</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteProjectOpen} onOpenChange={setDeleteProjectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить проект?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить проект "{selectedProject?.name}"? 
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteUserOpen} onOpenChange={setDeleteUserOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить пользователя "{selectedUser?.name}"? 
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPanel;