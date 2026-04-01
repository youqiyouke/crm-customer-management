'use client';

import { Customer } from '@/types/customer';
import { getCurrentAdmin, getAuthHeaders } from './admin-store';

// 获取客户列表
export async function getCustomers(): Promise<Customer[]> {
  const admin = getCurrentAdmin();
  if (!admin) return [];

  const response = await fetch('/api/customers', {
    headers: getAuthHeaders(),
  });

  if (!response.ok) return [];

  const data = await response.json();
  return data.customers || [];
}

// 创建客户
export async function createCustomer(customer: {
  name: string;
  phone?: string;
  company?: string;
  status?: string;
  tags?: string[];
  notes?: string;
  loanAmount?: number;
  serviceFee?: number;
  ownerId?: string;
  ownerName?: string;
}): Promise<Customer | null> {
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(customer),
  });

  if (!response.ok) return null;

  const data = await response.json();
  return data.customer;
}

// 更新客户
export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) return null;

  const data = await response.json();
  return data.customer;
}

// 删除客户
export async function deleteCustomer(id: string): Promise<boolean> {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return response.ok;
}

// 批量删除客户
export async function batchDeleteCustomers(ids: string[]): Promise<boolean> {
  const response = await fetch('/api/customers', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ ids }),
  });

  return response.ok;
}

// 获取统计数据
export async function getStats(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byOwner: Record<string, { name: string; count: number }>;
  totalLoanAmount: number;
  totalServiceFee: number;
}> {
  const admin = getCurrentAdmin();
  if (!admin) {
    return {
      total: 0,
      byStatus: {},
      byOwner: {},
      totalLoanAmount: 0,
      totalServiceFee: 0,
    };
  }

  const response = await fetch('/api/stats', {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    return {
      total: 0,
      byStatus: {},
      byOwner: {},
      totalLoanAmount: 0,
      totalServiceFee: 0,
    };
  }

  return await response.json();
}

// 管理员相关操作
export async function getAdmins(): Promise<Array<{
  id: string;
  username: string;
  name: string;
  role: 'super_admin' | 'admin';
  createdAt: string;
  lastLogin?: string;
}>> {
  const response = await fetch('/api/admins', {
    headers: getAuthHeaders(),
  });

  if (!response.ok) return [];

  const data = await response.json();
  return (data.admins || []).map((admin: { role: string }) => ({
    ...admin,
    role: admin.role as 'super_admin' | 'admin',
  }));
}

export async function createAdmin(admin: {
  username: string;
  password: string;
  name: string;
  role: string;
}): Promise<{ success: boolean; error?: string }> {
  const response = await fetch('/api/admins', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(admin),
  });

  const data = await response.json();
  return { success: response.ok, error: data.error };
}

export async function updateAdmin(id: string, updates: {
  username?: string;
  password?: string;
  name?: string;
  role?: string;
}): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`/api/admins/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();
  return { success: response.ok, error: data.error };
}

export async function deleteAdmin(id: string): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`/api/admins/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  return { success: response.ok, error: data.error };
}
