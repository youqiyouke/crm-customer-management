'use client';

import { Admin, AdminLoginData, AdminFormData } from '@/types/admin';
import { mockAdmins, generateAdminId } from '@/data/admins';

// 管理员数据存储
let admins: Admin[] = [...mockAdmins];
let currentAdmin: Admin | null = null;

// 登录验证
export function loginAdmin(data: AdminLoginData): Admin | null {
  const admin = admins.find(
    (a) => a.username === data.username && a.password === data.password
  );
  if (admin) {
    const now = new Date().toISOString();
    admin.lastLogin = now;
    currentAdmin = admin;
    // 保存到 localStorage（仅客户端）
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentAdmin', JSON.stringify(admin));
    }
    return admin;
  }
  return null;
}

// 退出登录
export function logoutAdmin(): void {
  currentAdmin = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentAdmin');
  }
}

// 获取当前登录管理员
export function getCurrentAdmin(): Admin | null {
  if (currentAdmin) return currentAdmin;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('currentAdmin');
    if (stored) {
      currentAdmin = JSON.parse(stored);
    }
  }
  return currentAdmin;
}

// 获取所有管理员
export function getAdmins(): Admin[] {
  return [...admins];
}

// 根据 ID 获取管理员
export function getAdminById(id: string): Admin | undefined {
  return admins.find((a) => a.id === id);
}

// 创建管理员
export function createAdmin(data: AdminFormData): Admin | null {
  // 检查用户名是否已存在
  if (admins.some((a) => a.username === data.username)) {
    return null;
  }
  const now = new Date().toISOString();
  const newAdmin: Admin = {
    ...data,
    id: generateAdminId(),
    createdAt: now,
    lastLogin: null,
  };
  admins.push(newAdmin);
  return newAdmin;
}

// 更新管理员
export function updateAdmin(id: string, data: Partial<AdminFormData>): Admin | null {
  const index = admins.findIndex((a) => a.id === id);
  if (index === -1) return null;

  // 检查用户名是否被其他管理员占用
  if (data.username && admins.some((a) => a.id !== id && a.username === data.username)) {
    return null;
  }

  admins[index] = {
    ...admins[index],
    ...data,
  };

  // 如果更新的是当前登录的管理员，同步更新
  if (currentAdmin && currentAdmin.id === id) {
    currentAdmin = admins[index];
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentAdmin', JSON.stringify(currentAdmin));
    }
  }

  return admins[index];
}

// 删除管理员
export function deleteAdmin(id: string): boolean {
  // 不能删除超级管理员
  const admin = admins.find((a) => a.id === id);
  if (!admin || admin.role === 'super_admin') return false;

  const index = admins.findIndex((a) => a.id === id);
  if (index === -1) return false;
  admins.splice(index, 1);
  return true;
}

// 重置密码
export function resetPassword(id: string, newPassword: string): boolean {
  const index = admins.findIndex((a) => a.id === id);
  if (index === -1) return false;
  admins[index].password = newPassword;
  return true;
}
