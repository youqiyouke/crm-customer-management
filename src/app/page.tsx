'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Users, UserCheck, UserX, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Customer, CustomerFilters } from '@/types/customer';
import { getCustomers, getStats, deleteCustomer } from '@/lib/customer-store';
import { formatCurrency, formatDate } from '@/data/customers';
import { CustomerDialog } from '@/components/customer-dialog';
import Link from 'next/link';

export default function HomePage() {
  const [filters, setFilters] = useState<Partial<CustomerFilters>>({
    search: '',
    status: 'all',
    sortField: 'createdAt',
    sortOrder: 'desc',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const customers = useMemo(() => getCustomers(filters), [filters, refreshKey]);
  const stats = useMemo(() => getStats(), [refreshKey]);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setDialogOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setDialogOpen(true);
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm('确定要删除这个客户吗？')) {
      deleteCustomer(id);
      setRefreshKey((k) => k + 1);
    }
  };

  const handleDialogSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  const getStatusBadge = (status: Customer['status']) => {
    const styles = {
      need: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      not_need: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    };
    const labels = {
      need: '需要',
      not_need: '不需要',
    };
    return (
      <Badge className={styles[status]} variant="secondary">
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">客户管理平台</h1>
              <p className="text-sm text-muted-foreground">管理您的客户信息和关系</p>
            </div>
            <Button onClick={handleAddCustomer}>
              <Plus className="mr-2 h-4 w-4" />
              添加客户
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">总客户数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">需要跟进</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.need}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">不需要</CardTitle>
              <UserX className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.notNeed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">总收入</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索客户姓名或公司..."
              className="pl-10"
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => setFilters({ ...filters, status: value as CustomerFilters['status'] })}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="need">需要</SelectItem>
              <SelectItem value="not_need">不需要</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={`${filters.sortField}-${filters.sortOrder}`}
            onValueChange={(value) => {
              const [field, order] = value.split('-');
              setFilters({ ...filters, sortField: field as CustomerFilters['sortField'], sortOrder: order as CustomerFilters['sortOrder'] });
            }}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="排序" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">创建时间 (最新)</SelectItem>
              <SelectItem value="createdAt-asc">创建时间 (最早)</SelectItem>
              <SelectItem value="name-asc">姓名 (A-Z)</SelectItem>
              <SelectItem value="name-desc">姓名 (Z-A)</SelectItem>
              <SelectItem value="totalSpent-desc">消费金额 (高-低)</SelectItem>
              <SelectItem value="totalSpent-asc">消费金额 (低-高)</SelectItem>
              <SelectItem value="lastContact-desc">最近联系 (最新)</SelectItem>
              <SelectItem value="lastContact-asc">最近联系 (最早)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Customer Table */}
        <div className="mt-6 rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>客户姓名</TableHead>
                <TableHead>联系方式</TableHead>
                <TableHead>公司</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>消费金额</TableHead>
                <TableHead>订单数</TableHead>
                <TableHead>最近联系</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Users className="mb-2 h-8 w-8" />
                      <p>暂无客户数据</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id} className="group">
                    <TableCell>
                      <Link href={`/customers/${customer.id}`} className="hover:underline font-medium">
                        {customer.name}
                      </Link>
                    </TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.company}</TableCell>
                    <TableCell>{getStatusBadge(customer.status)}</TableCell>
                    <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
                    <TableCell>{customer.ordersCount}</TableCell>
                    <TableCell>{formatDate(customer.lastContact)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/customers/${customer.id}`}>查看</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCustomer(customer)}
                        >
                          编辑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteCustomer(customer.id)}
                        >
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-muted-foreground">
          显示 {customers.length} 个客户
        </div>
      </main>

      {/* Customer Dialog */}
      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editingCustomer}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
