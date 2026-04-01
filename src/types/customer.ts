export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'pending';
  source: 'website' | 'referral' | 'social' | 'direct' | 'other';
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
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'pending';
  source: 'website' | 'referral' | 'social' | 'direct' | 'other';
  tags: string[];
  notes: string;
}

export type CustomerSortField = 'name' | 'createdAt' | 'lastContact' | 'totalSpent';
export type SortOrder = 'asc' | 'desc';

export interface CustomerFilters {
  search: string;
  status: Customer['status'] | 'all';
  source: Customer['source'] | 'all';
  sortField: CustomerSortField;
  sortOrder: SortOrder;
}
