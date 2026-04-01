import { Admin } from '@/types/admin';

export const mockAdmins: Admin[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    name: '系统管理员',
    role: 'super_admin',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-03-20T10:00:00Z',
  },
  {
    id: '2',
    username: 'manager',
    password: 'manager123',
    name: '运营经理',
    role: 'admin',
    createdAt: '2024-02-15T00:00:00Z',
    lastLogin: '2024-03-18T14:30:00Z',
  },
];

// 生成唯一 ID
export function generateAdminId(): string {
  return `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 格式化日期时间
export function formatDateTime(dateString: string | null): string {
  if (!dateString) return '从未登录';
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
