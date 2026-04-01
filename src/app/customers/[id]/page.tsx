'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  Building,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Tag,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { deleteCustomer } from '@/lib/customer-store';
import { getCurrentAdmin } from '@/lib/admin-store';
import { formatCurrency, formatDateTime } from '@/data/customers';
import { Customer } from '@/types/customer';
import { CustomerDialog } from '@/components/customer-dialog';
import { getAuthHeaders } from '@/lib/admin-store';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<ReturnType<typeof getCurrentAdmin>>(null);

  const customerId = params.id as string;

  // 加载客户数据
  const loadCustomer = async () => {
    if (!customerId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        setCustomer(data.customer);
      } else {
        setCustomer(null);
      }
    } catch (error) {
      console.error('加载客户数据失败:', error);
      setCustomer(null);
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
        loadCustomer();
      }
    }
  }, [mounted, customerId, refreshKey, router]);

  if (!mounted || !currentAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">客户不存在或无权限访问</p>
          <Button asChild>
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (confirm('确定要删除这个客户吗？此操作不可撤销。')) {
      await deleteCustomer(customerId);
      router.push('/');
    }
  };

  const handleEditSuccess = () => {
    setRefreshKey((k) => k + 1);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{customer.name}</h1>
                <p className="text-sm text-muted-foreground">客户详情</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                编辑
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">电话</p>
                  <p className="font-medium">{customer.phone || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">公司</p>
                  <p className="font-medium">{customer.company || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">状态</p>
                  {getStatusBadge(customer.status)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 财务信息 */}
          <Card>
            <CardHeader>
              <CardTitle>财务信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">放款金额</p>
                  <p className="font-medium text-green-600">
                    {formatCurrency(customer.loanAmount)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">服务费</p>
                  <p className="font-medium">{formatCurrency(customer.serviceFee)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 时间信息 */}
          <Card>
            <CardHeader>
              <CardTitle>时间信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">创建时间</p>
                  <p className="font-medium">{formatDateTime(customer.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">更新时间</p>
                  <p className="font-medium">{formatDateTime(customer.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 负责人信息 */}
          <Card>
            <CardHeader>
              <CardTitle>负责人信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">负责人</p>
                  <p className="font-medium">{customer.ownerName || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 标签 */}
        {customer.tags.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                标签
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {customer.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 备注 */}
        {customer.notes && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                备注
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{customer.notes}</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Customer Dialog */}
      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={customer}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
