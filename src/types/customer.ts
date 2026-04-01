export interface Customer {
  id: string;
  name: string;
  phone: string;
  company: string;
  status: 'need' | 'not_need' | 'following' | 'completed';
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  visitTime: string; // 访问时间，自动更新
  loanAmount: number; // 放款金额
  serviceFee: number; // 服务费
}

export interface CustomerFormData {
  name: string;
  phone: string;
  company: string;
  status: 'need' | 'not_need' | 'following' | 'completed';
  tags: string[];
  notes: string;
}

export type CustomerSortField = 'name' | 'createdAt' | 'visitTime' | 'loanAmount';
export type SortOrder = 'asc' | 'desc';

export interface CustomerFilters {
  search: string;
  status: Customer['status'] | 'all';
  sortField: CustomerSortField;
  sortOrder: SortOrder;
}
