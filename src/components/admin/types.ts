export interface User {
  id: number;
  name: string;
  login: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  created_at: string;
  password?: string;
}
