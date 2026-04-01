import { Customer } from '@/types/customer';

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: '张伟',
    phone: '138-0000-0001',
    company: '科技有限公司',
    status: 'completed',
    tags: ['VIP', '企业客户'],
    notes: '重要的企业客户，需要优先服务',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-20T14:30:00Z',
    visitTime: '2024-03-20T14:30:00Z',
    loanAmount: 125000,
    serviceFee: 1250,
  },
  {
    id: '2',
    name: '李娜',
    phone: '139-0000-0002',
    company: '创新工作室',
    status: 'following',
    tags: ['新客户'],
    notes: '通过朋友推荐来的客户',
    createdAt: '2024-02-20T09:00:00Z',
    updatedAt: '2024-03-18T11:20:00Z',
    visitTime: '2024-03-18T11:20:00Z',
    loanAmount: 45000,
    serviceFee: 450,
  },
  {
    id: '3',
    name: '王强',
    phone: '137-0000-0003',
    company: '数字科技公司',
    status: 'following',
    tags: ['待跟进'],
    notes: '对产品有兴趣，需要进一步沟通',
    createdAt: '2024-03-01T08:00:00Z',
    updatedAt: '2024-03-15T16:45:00Z',
    visitTime: '2024-03-15T16:45:00Z',
    loanAmount: 0,
    serviceFee: 0,
  },
  {
    id: '4',
    name: '刘芳',
    phone: '136-0000-0004',
    company: '设计工作室',
    status: 'completed',
    tags: ['长期合作'],
    notes: '长期合作伙伴，付款及时',
    createdAt: '2023-11-10T10:30:00Z',
    updatedAt: '2024-03-19T09:15:00Z',
    visitTime: '2024-03-19T09:15:00Z',
    loanAmount: 280000,
    serviceFee: 2800,
  },
  {
    id: '5',
    name: '陈明',
    phone: '135-0000-0005',
    company: '互联网公司',
    status: 'not_need',
    tags: ['流失风险'],
    notes: '最近没有活跃，需要关怀',
    createdAt: '2023-09-05T14:00:00Z',
    updatedAt: '2024-01-20T11:00:00Z',
    visitTime: '2024-01-20T11:00:00Z',
    loanAmount: 68000,
    serviceFee: 680,
  },
  {
    id: '6',
    name: '赵丽',
    phone: '133-0000-0006',
    company: '电商企业',
    status: 'need',
    tags: ['VIP', '大客户'],
    notes: '电商行业大客户，需要定制化服务',
    createdAt: '2024-01-25T11:00:00Z',
    updatedAt: '2024-03-21T10:00:00Z',
    visitTime: '2024-03-21T10:00:00Z',
    loanAmount: 450000,
    serviceFee: 4500,
  },
  {
    id: '7',
    name: '孙浩',
    phone: '132-0000-0007',
    company: '咨询公司',
    status: 'following',
    tags: ['企业客户'],
    notes: '咨询行业客户，经常需要培训服务',
    createdAt: '2024-02-05T09:30:00Z',
    updatedAt: '2024-03-17T15:20:00Z',
    visitTime: '2024-03-17T15:20:00Z',
    loanAmount: 95000,
    serviceFee: 950,
  },
  {
    id: '8',
    name: '周婷',
    phone: '131-0000-0008',
    company: '教育机构',
    status: 'not_need',
    tags: ['教育行业'],
    notes: '教育行业客户，目前暂时不需要服务',
    createdAt: '2024-03-10T13:00:00Z',
    updatedAt: '2024-03-19T14:00:00Z',
    visitTime: '2024-03-19T14:00:00Z',
    loanAmount: 0,
    serviceFee: 0,
  },
];

// 用于生成唯一 ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 格式化金额
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(amount);
}

// 格式化日期
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// 格式化日期时间
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
