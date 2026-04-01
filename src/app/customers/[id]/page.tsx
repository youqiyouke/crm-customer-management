'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Calendar,
  DollarSign,
  ShoppingCart,
  Edit,
  Trash2,
  Tag,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getCustomerById, deleteCustomer } from '@/lib/customer-store';
import { formatCurrency, formatDateTime } from '@/data/customers';
import { Customer } from '@/types/customer';
import { CustomerDialog } from '@/components/customer-dialog';
import { notFound } from 'next/navigation';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const customerId = params.id as string;
  const customer = getCustomerById(customerId);

  if (!customer) {
    notFound();
  }

  const handleDelete = () => {
    if (confirm('确定要删除这个客户吗？此操作不可撤销。')) {
      deleteCustomer(customerId);
      router.push('/');
    }
  };

  const handleEditSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  const getStatusBadge = (status: Customer['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    const labels = {
      active: '活跃',
      inactive: '不活跃',
      pending: '待跟进',
    };
    return (
      <Badge className={styles[status]} variant="secondary">
        {labels[status]}
      </Badge>
    );
  };

  const getSourceLabel = (source: Customer['source']) => {
    const labels: Record<Customer['source'], string> = {
      website: '网站',
      referral: '推荐',
      social: '社交',
      direct: '直接',
      other: '其他',
    };
    return labels[source];
  };

  const updatedCustomer = getCustomerById(customerId) || customer;

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
                  返回列表
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{updatedCustomer.name}</h1>
                <p className="text-sm text-muted-foreground">{updatedCustomer.company}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                编辑
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 左侧：基本信息 */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">邮箱</p>
                      <p className="font-medium">{updatedCustomer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">电话</p>
                      <p className="font-medium">{updatedCustomer.phone || '未填写'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">公司</p>
                      <p className="font-medium">{updatedCustomer.company || '未填写'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">创建时间</p>
                      <p className="font-medium">{formatDateTime(updatedCustomer.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">状态</p>
                    {getStatusBadge(updatedCustomer.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">来源</p>
                    <p className="font-medium">{getSourceLabel(updatedCustomer.source)}</p>
                  </div>
                </div>

                {updatedCustomer.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">标签</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {updatedCustomer.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {updatedCustomer.notes && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">备注</p>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{updatedCustomer.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：统计信息 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>客户统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">累计消费</span>
                  </div>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(updatedCustomer.totalSpent)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">订单数量</span>
                  </div>
                  <span className="text-xl font-bold">{updatedCustomer.ordersCount}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">最近联系</span>
                  </div>
                  <span className="text-sm">{formatDateTime(updatedCustomer.lastContact)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">最后更新</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDateTime(updatedCustomer.updatedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>快捷操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="mr-2 h-4 w-4" />
                  发送邮件
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="mr-2 h-4 w-4" />
                  拨打电话
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  添加备注
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Edit Dialog */}
      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={updatedCustomer}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
