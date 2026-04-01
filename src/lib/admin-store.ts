'use client';

import { Admin } from '@/types/admin';

const STORAGE_KEY = 'crm_admin';

// 获取当前登录管理员
export function getCurrentAdmin(): Admin | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

// 保存登录状态
export function saveCurrentAdmin(admin: Admin): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(admin));
  }
}

// 清除登录状态
export function clearCurrentAdmin(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// 登录
export async function loginAdmin(username: string, password: string): Promise<{ admin: Admin } | { error: string }> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    return { error: data.error || '登录失败' };
  }

  saveCurrentAdmin(data.admin);
  return { admin: data.admin };
}

// 退出登录
export function logoutAdmin(): void {
  clearCurrentAdmin();
}

// 获取请求头
export function getAuthHeaders(): Record<string, string> {
  const admin = getCurrentAdmin();
  if (!admin) return {};
  return {
    'x-admin-id': admin.id,
    'x-admin-role': admin.role,
  };
}
