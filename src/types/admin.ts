export interface Admin {
  id: string;
  username: string;
  password: string; // 实际项目中应该加密存储
  name: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
  lastLogin: string | null;
}

export interface AdminLoginData {
  username: string;
  password: string;
}

export interface AdminFormData {
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'super_admin';
}
