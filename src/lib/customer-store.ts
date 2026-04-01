'use client';

import { Customer, CustomerFormData, CustomerFilters } from '@/types/customer';
import { mockCustomers, generateId } from '@/data/customers';

// 简单的状态管理（在真实项目中应该使用数据库）
let customers: Customer[] = [...mockCustomers];

export function getCustomers(filters?: Partial<CustomerFilters>): Customer[] {
  let result = [...customers];

  if (filters) {
    // 搜索
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.company.toLowerCase().includes(searchLower)
      );
    }

    // 状态筛选
    if (filters.status && filters.status !== 'all') {
      result = result.filter((c) => c.status === filters.status);
    }

    // 排序
    if (filters.sortField) {
      const { sortField, sortOrder = 'asc' } = filters;
      result.sort((a, b) => {
        let comparison = 0;
        if (sortField === 'name') {
          comparison = a.name.localeCompare(b.name, 'zh-CN');
        } else if (sortField === 'createdAt' || sortField === 'lastContact') {
          comparison = new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime();
        } else if (sortField === 'totalSpent') {
          comparison = a.totalSpent - b.totalSpent;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }
  }

  return result;
}

export function getCustomerById(id: string): Customer | undefined {
  return customers.find((c) => c.id === id);
}

export function createCustomer(data: CustomerFormData): Customer {
  const now = new Date().toISOString();
  const newCustomer: Customer = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    lastContact: now,
    totalSpent: 0,
    ordersCount: 0,
  };
  customers.push(newCustomer);
  return newCustomer;
}

export function updateCustomer(id: string, data: Partial<CustomerFormData>): Customer | null {
  const index = customers.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString();
  customers[index] = {
    ...customers[index],
    ...data,
    updatedAt: now,
  };
  return customers[index];
}

export function deleteCustomer(id: string): boolean {
  const index = customers.findIndex((c) => c.id === id);
  if (index === -1) return false;
  customers.splice(index, 1);
  return true;
}

export function getStats() {
  const total = customers.length;
  const need = customers.filter((c) => c.status === 'need').length;
  const notNeed = customers.filter((c) => c.status === 'not_need').length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return {
    total,
    need,
    notNeed,
    totalRevenue,
  };
}
