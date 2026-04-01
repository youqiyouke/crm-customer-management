export interface Customer {
  id: string;
  name: string;
  phone: string;
  company: string;
  status: 'need' | 'not_need';
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  lastContact: string;
  totalSpent: number;
  ordersCount: number;
}

export interface CustomerFormData {
  name: string;
  phone: string;
  company: string;
  status: 'need' | 'not_need';
  tags: string[];
  notes: string;
}

export type CustomerSortField = 'name' | 'createdAt' | 'lastContact' | 'totalSpent';
export type SortOrder = 'asc' | 'desc';

export interface CustomerFilters {
  search: string;
  status: Customer['status'] | 'all';
  sortField: CustomerSortField;
  sortOrder: SortOrder;
}
