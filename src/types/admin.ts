export interface Admin {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
  lastLogin?: string;
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
