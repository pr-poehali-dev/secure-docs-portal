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
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  created_at: string;
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
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectStatus, setProjectStatus] = useState<string>('active');
  
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const projectList = await api.getProjects();
      setProjects(projectList);
      
      setUsers([
        { id: 1, name: 'Администратор', email: 'admin@company.com', role: 'admin', status: 'active', created_at: '2024-01-15' },
        { id: 2, name: 'Менеджер проектов', email: 'manager@company.com', role: 'user', status: 'active', created_at: '2024-02-20' },
      ]);
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
    if (!userName.trim() || !userEmail.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    const newUser: User = {
      id: Date.now(),
      name: userName,
      email: userEmail,
      role: userRole,
      status: 'active',
      created_at: new Date().toISOString().split('T')[0],
    };

    setUsers([newUser, ...users]);
    toast({
      title: 'Пользователь добавлен',
      description: `Пользователь "${newUser.name}" успешно создан`,
    });
    setAddUserOpen(false);
    setUserName('');
    setUserEmail('');
    setUserRole('user');
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;

    setUsers(users.filter(u => u.id !== selectedUser.id));
    toast({
      title: 'Пользователь удален',
      description: `Пользователь "${selectedUser.name}" удален из системы`,
    });
    setDeleteUserOpen(false);
    setSelectedUser(null);
  };

  const openDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteUserOpen(true);
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
                      placeholder="Например: Контракты 2024"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-desc">Описание</Label>
                    <Textarea
                      id="project-desc"
                      placeholder="Краткое описание проекта"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-status">Статус</Label>
                    <Select value={projectStatus} onValueChange={setProjectStatus}>
                      <SelectTrigger id="project-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Активный</SelectItem>
                        <SelectItem value="archived">Архивный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddProjectOpen(false)}>Отмена</Button>
                  <Button onClick={handleAddProject}>Создать проект</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="FolderOpen" size={48} className="mx-auto mb-2" />
                <p>Проектов пока нет</p>
              </div>
            ) : (
              projects.map(project => (
                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{project.name}</h4>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status === 'active' ? 'Активный' : 'Архивный'}
                      </Badge>
                      {project.document_count !== undefined && (
                        <Badge variant="outline">
                          <Icon name="FileText" size={12} className="mr-1" />
                          {project.document_count} док.
                        </Badge>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditProject(project)}>
                      <Icon name="Pencil" size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteProject(project)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Icon name="Trash2" size={18} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Пользователи</CardTitle>
              <CardDescription>Управление доступом пользователей</CardDescription>
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
                  <DialogDescription>Добавьте нового пользователя в систему</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-name">Имя *</Label>
                    <Input
                      id="user-name"
                      placeholder="Иван Иванов"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-email">Email *</Label>
                    <Input
                      id="user-email"
                      type="email"
                      placeholder="user@company.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-role">Роль</Label>
                    <Select value={userRole} onValueChange={(value: 'admin' | 'user') => setUserRole(value)}>
                      <SelectTrigger id="user-role">
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
                  <Button onClick={handleAddUser}>Добавить</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="Users" size={48} className="mx-auto mb-2" />
                <p>Пользователей пока нет</p>
              </div>
            ) : (
              users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="User" size={20} className="text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{user.name}</h4>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteUser(user)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Icon name="Trash2" size={18} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={editProjectOpen} onOpenChange={setEditProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать проект</DialogTitle>
            <DialogDescription>Внесите изменения в проект</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-project-name">Название *</Label>
              <Input
                id="edit-project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-desc">Описание</Label>
              <Textarea
                id="edit-project-desc"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-status">Статус</Label>
              <Select value={projectStatus} onValueChange={setProjectStatus}>
                <SelectTrigger id="edit-project-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активный</SelectItem>
                  <SelectItem value="archived">Архивный</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProjectOpen(false)}>Отмена</Button>
            <Button onClick={handleEditProject}>Сохранить изменения</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteProjectOpen} onOpenChange={setDeleteProjectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить проект?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить проект <strong>"{selectedProject?.name}"</strong>?
              <br /><br />
              Это действие необратимо. Все связанные документы останутся, но связь с проектом будет удалена.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteUserOpen} onOpenChange={setDeleteUserOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить пользователя <strong>"{selectedUser?.name}"</strong>?
              <br /><br />
              Это действие необратимо. Пользователь потеряет доступ к системе.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPanel;
