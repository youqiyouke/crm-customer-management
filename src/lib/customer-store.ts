'use client';

import { Customer, CustomerFormData, CustomerFilters } from '@/types/customer';
import { mockCustomers, generateId } from '@/data/customers';
import { Admin } from '@/types/admin';

// 简单的状态管理（在真实项目中应该使用数据库）
let customers: Customer[] = [...mockCustomers];

export function getCustomers(filters: Partial<CustomerFilters> | undefined, currentAdmin: Admin | null): Customer[] {
  let result = [...customers];

  // 如果不是超级管理员，只能看到自己创建的客户
  if (currentAdmin && currentAdmin.role !== 'super_admin') {
    result = result.filter((c) => c.createdBy === currentAdmin.id);
  }

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
        } else if (sortField === 'createdAt' || sortField === 'visitTime') {
          comparison = new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime();
        } else if (sortField === 'loanAmount') {
          comparison = a.loanAmount - b.loanAmount;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }
  }

  return result;
}

export function getCustomerById(id: string, currentAdmin: Admin | null): Customer | undefined {
  const customer = customers.find((c) => c.id === id);
  
  // 权限检查：非超级管理员只能查看自己创建的客户
  if (customer && currentAdmin && currentAdmin.role !== 'super_admin' && customer.createdBy !== currentAdmin.id) {
    return undefined;
  }
  
  // 每次获取客户详情时，自动更新访问时间
  if (customer) {
    const now = new Date().toISOString();
    customer.visitTime = now;
    customer.updatedAt = now;
  }
  return customer;
}

export function createCustomer(data: CustomerFormData, adminId: string): Customer {
  const now = new Date().toISOString();
  const newCustomer: Customer = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    visitTime: now,
    loanAmount: 0,
    serviceFee: 0,
    createdBy: adminId,
  };
  customers.push(newCustomer);
  return newCustomer;
}

export function updateCustomer(id: string, data: Partial<CustomerFormData>, currentAdmin: Admin | null): Customer | null {
  const index = customers.findIndex((c) => c.id === id);
  if (index === -1) return null;

  // 权限检查：非超级管理员只能修改自己创建的客户
  if (currentAdmin && currentAdmin.role !== 'super_admin' && customers[index].createdBy !== currentAdmin.id) {
    return null;
  }

  const now = new Date().toISOString();
  customers[index] = {
    ...customers[index],
    ...data,
    updatedAt: now,
    visitTime: now, // 更新访问时间
  };
  return customers[index];
}

export function deleteCustomer(id: string, currentAdmin: Admin | null): boolean {
  const index = customers.findIndex((c) => c.id === id);
  if (index === -1) return false;

  // 权限检查：非超级管理员只能删除自己创建的客户
  if (currentAdmin && currentAdmin.role !== 'super_admin' && customers[index].createdBy !== currentAdmin.id) {
    return false;
  }

  customers.splice(index, 1);
  return true;
}

export function getStats(currentAdmin: Admin | null) {
  let filteredCustomers = [...customers];

  // 如果不是超级管理员，只统计自己创建的客户
  if (currentAdmin && currentAdmin.role !== 'super_admin') {
    filteredCustomers = filteredCustomers.filter((c) => c.createdBy === currentAdmin.id);
  }

  const total = filteredCustomers.length;
  const need = filteredCustomers.filter((c) => c.status === 'need').length;
  const notNeed = filteredCustomers.filter((c) => c.status === 'not_need').length;
  const following = filteredCustomers.filter((c) => c.status === 'following').length;
  const completed = filteredCustomers.filter((c) => c.status === 'completed').length;
  const totalLoanAmount = filteredCustomers.reduce((sum, c) => sum + c.loanAmount, 0);
  const totalServiceFee = filteredCustomers.reduce((sum, c) => sum + c.serviceFee, 0);

  return {
    total,
    need,
    notNeed,
    following,
    completed,
    totalLoanAmount,
    totalServiceFee,
  };
}
