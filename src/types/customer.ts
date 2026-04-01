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
  ownerId: string; // 负责人管理员ID
  ownerName: string; // 负责人姓名
}

export interface CustomerFormData {
  name: string;
  phone: string;
  company: string;
  status: 'need' | 'not_need' | 'following' | 'completed';
  tags: string[];
  notes: string;
  loanAmount?: number;
  serviceFee?: number;
  ownerId?: string;
  ownerName?: string;
  updatedAt?: string;
}

export type CustomerSortField = 'name' | 'createdAt' | 'updatedAt' | 'loanAmount';
export type SortOrder = 'asc' | 'desc';

export interface CustomerFilters {
  search: string;
  status: Customer['status'] | 'all';
  sortField: CustomerSortField;
  sortOrder: SortOrder;
}
