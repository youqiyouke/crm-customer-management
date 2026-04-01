'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Users, UserCheck, UserX, Clock, CheckCircle, DollarSign, Settings, LogOut, User } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Customer, CustomerFilters, CustomerSortField, SortOrder } from '@/types/customer';
import { getCustomers, getStats, deleteCustomer } from '@/lib/customer-store';
import { getCurrentAdmin, logoutAdmin } from '@/lib/admin-store';
import { formatCurrency, formatDate } from '@/data/customers';
import { CustomerDialog } from '@/components/customer-dialog';

export default function HomePage() {
  const router = useRouter();
  const [filters, setFilters] = useState<Partial<CustomerFilters>>({
    search: '',
    status: 'all',
    sortField: 'createdAt',
    sortOrder: 'desc',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    byStatus: Record<string, number>;
    byOwner: Record<string, { name: string; count: number }>;
    totalLoanAmount: number;
    totalServiceFee: number;
  }>({
    total: 0,
    byStatus: {},
    byOwner: {},
    totalLoanAmount: 0,
    totalServiceFee: 0,
  });
  const [currentAdmin, setCurrentAdmin] = useState<ReturnType<typeof getCurrentAdmin>>(null);

  // 加载数据
  const loadData = async () => {
    const admin = getCurrentAdmin();
    if (!admin) return;

    setLoading(true);
    try {
      const [customersData, statsData] = await Promise.all([
        getCustomers(),
        getStats(),
      ]);
      
      // 应用筛选
      let filtered = [...customersData];
      
      if (admin.role !== 'super_admin') {
        filtered = filtered.filter(c => c.ownerId === admin.id);
      }
      
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(c =>
          c.name.toLowerCase().includes(search) ||
          c.phone.includes(search)
        );
      }
      
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(c => c.status === filters.status);
      }
      
      // 排序
      if (filters.sortField) {
        filtered.sort((a, b) => {
          const field = filters.sortField as keyof Customer;
          let aVal = a[field];
          let bVal = b[field];
          
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
          }
          
          if (aVal! < bVal!) return filters.sortOrder === 'asc' ? -1 : 1;
          if (aVal! > bVal!) return filters.sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }
      
      setCustomers(filtered);
      setStats(statsData);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const admin = getCurrentAdmin();
      setCurrentAdmin(admin);
      if (!admin) {
        router.push('/login');
      } else {
        loadData();
      }
    }
  }, [mounted, refreshKey, router]);

  useEffect(() => {
    if (currentAdmin) {
      loadData();
    }
  }, [filters, currentAdmin]);

  if (!mounted || !currentAdmin) {
    return null;
  }

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setDialogOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setDialogOpen(true);
  };

  const handleDeleteCustomer = async (id: string) => {
    if (confirm('确定要删除这个客户吗？')) {
      await deleteCustomer(id);
      setRefreshKey((k) => k + 1);
    }
  };

  const handleDialogSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleLogout = () => {
    logoutAdmin();
    router.push('/login');
  };

  const getStatusBadge = (status: Customer['status']) => {
    const styles = {
      need: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      not_need: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      following: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    const labels = {
      need: '需要',
      not_need: '不需要',
      following: '跟进',
      completed: '完结',
    };
    return (
      <Badge className={styles[status]} variant="secondary">
        {labels[status]}
      </Badge>
    );
  };

  const statusCount = {
    need: stats.byStatus.need || 0,
    following: stats.byStatus.following || 0,
    not_need: stats.byStatus.not_need || 0,
    completed: stats.byStatus.completed || 0,
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
            <div className="flex items-center gap-4">
              <Button onClick={handleAddCustomer}>
                <Plus className="mr-2 h-4 w-4" />
                添加客户
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{currentAdmin.name}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {currentAdmin.role === 'super_admin' ? '超级管理员' : '管理员'}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {currentAdmin.role === 'super_admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admins">
                        <Settings className="mr-2 h-4 w-4" />
                        管理员管理
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
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
              <CardTitle className="text-sm font-medium">需要</CardTitle>
              <UserCheck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{statusCount.need}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">跟进</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{statusCount.following}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">完结</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statusCount.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">不需要</CardTitle>
              <UserX className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{statusCount.not_need}</div>
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">总放款金额</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalLoanAmount)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索客户姓名或手机号..."
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
              <SelectValue placeholder="状态筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="need">需要</SelectItem>
              <SelectItem value="following">跟进</SelectItem>
              <SelectItem value="completed">完结</SelectItem>
              <SelectItem value="not_need">不需要</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={`${filters.sortField}-${filters.sortOrder}`}
            onValueChange={(value) => {
              const [field, order] = value.split('-');
              setFilters({ ...filters, sortField: field as CustomerSortField, sortOrder: order as SortOrder });
            }}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">创建时间（最新）</SelectItem>
              <SelectItem value="createdAt-asc">创建时间（最早）</SelectItem>
              <SelectItem value="updatedAt-desc">更新时间（最新）</SelectItem>
              <SelectItem value="updatedAt-asc">更新时间（最早）</SelectItem>
              <SelectItem value="loanAmount-desc">放款金额（高到低）</SelectItem>
              <SelectItem value="loanAmount-asc">放款金额（低到高）</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Customer Table */}
        <div className="mt-6 rounded-lg border bg-card">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">加载中...</div>
          ) : customers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              暂无客户数据，点击"添加客户"开始创建
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>手机号</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>放款金额</TableHead>
                  <TableHead>服务费</TableHead>
                  <TableHead>负责人</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{getStatusBadge(customer.status)}</TableCell>
                    <TableCell>{formatCurrency(customer.loanAmount)}</TableCell>
                    <TableCell>{formatCurrency(customer.serviceFee)}</TableCell>
                    <TableCell>{customer.ownerName}</TableCell>
                    <TableCell>{formatDate(customer.updatedAt)}</TableCell>
                    <TableCell className="text-right">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
