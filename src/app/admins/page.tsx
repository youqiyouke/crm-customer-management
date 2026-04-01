'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Users, Shield, ArrowLeft, Edit, Trash2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Admin, AdminFormData } from '@/types/admin';
import { getAdmins, getCurrentAdmin, createAdmin, updateAdmin, deleteAdmin, resetPassword } from '@/lib/admin-store';
import { formatDateTime } from '@/data/admins';

export default function AdminsPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resettingAdmin, setResettingAdmin] = useState<Admin | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const admins = useMemo(() => getAdmins(), [refreshKey]);
  const currentAdmin = getCurrentAdmin();

  useEffect(() => {
    if (!currentAdmin) {
      router.push('/login');
    } else if (currentAdmin.role !== 'super_admin') {
      router.push('/');
    }
  }, [currentAdmin, router]);

  if (!currentAdmin || currentAdmin.role !== 'super_admin') {
    return null;
  }

  const handleAddAdmin = () => {
    setEditingAdmin(null);
    setDialogOpen(true);
  };

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin);
    setDialogOpen(true);
  };

  const handleDeleteAdmin = (id: string) => {
    if (confirm('确定要删除这个管理员吗？')) {
      if (deleteAdmin(id)) {
        setRefreshKey((k) => k + 1);
      } else {
        alert('无法删除超级管理员');
      }
    }
  };

  const handleResetPassword = (admin: Admin) => {
    setResettingAdmin(admin);
    setNewPassword('');
    setResetPasswordOpen(true);
  };

  const confirmResetPassword = () => {
    if (resettingAdmin && newPassword.trim()) {
      resetPassword(resettingAdmin.id, newPassword.trim());
      setResetPasswordOpen(false);
      setResettingAdmin(null);
      setNewPassword('');
    }
  };

  const getRoleBadge = (role: Admin['role']) => {
    const styles = {
      super_admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };
    const labels = {
      super_admin: '超级管理员',
      admin: '管理员',
    };
    return (
      <Badge className={styles[role]} variant="secondary">
        {labels[role]}
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
                  返回首页
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">管理员管理</h1>
                <p className="text-sm text-muted-foreground">管理系统管理员账号</p>
              </div>
            </div>
            <Button onClick={handleAddAdmin}>
              <Plus className="mr-2 h-4 w-4" />
              添加管理员
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">总管理员数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{admins.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">超级管理员</CardTitle>
              <Shield className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {admins.filter((a) => a.role === 'super_admin').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Table */}
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户名</TableHead>
                <TableHead>姓名</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>最后登录</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id} className="group">
                  <TableCell className="font-medium">{admin.username}</TableCell>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{getRoleBadge(admin.role)}</TableCell>
                  <TableCell>{formatDateTime(admin.createdAt)}</TableCell>
                  <TableCell>{formatDateTime(admin.lastLogin)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResetPassword(admin)}
                      >
                        <KeyRound className="mr-1 h-3 w-3" />
                        重置密码
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAdmin(admin)}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        编辑
                      </Button>
                      {admin.role !== 'super_admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteAdmin(admin.id)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          删除
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Admin Dialog */}
      <AdminDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        admin={editingAdmin}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重置密码</DialogTitle>
            <DialogDescription>
              为管理员 {resettingAdmin?.name} 设置新密码
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="newPassword">新密码</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="请输入新密码"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPasswordOpen(false)}>
              取消
            </Button>
            <Button onClick={confirmResetPassword} disabled={!newPassword.trim()}>
              确认重置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Admin Dialog Component
function AdminDialog({
  open,
  onOpenChange,
  admin,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin?: Admin | null;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<AdminFormData>({
    username: '',
    password: '',
    name: '',
    role: 'admin',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (admin) {
      setFormData({
        username: admin.username,
        password: '',
        name: admin.name,
        role: admin.role,
      });
    } else {
      setFormData({
        username: '',
        password: '',
        name: '',
        role: 'admin',
      });
    }
    setError('');
  }, [admin, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (admin) {
        // 编辑模式
        const updateData: Partial<AdminFormData> = {
          username: formData.username,
          name: formData.name,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        const result = updateAdmin(admin.id, updateData);
        if (result) {
          onSuccess();
          onOpenChange(false);
        } else {
          setError('用户名已存在');
        }
      } else {
        // 新建模式
        if (!formData.password) {
          setError('请输入密码');
          setLoading(false);
          return;
        }
        const result = createAdmin(formData);
        if (result) {
          onSuccess();
          onOpenChange(false);
        } else {
          setError('用户名已存在');
        }
      }
    } catch {
      setError('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{admin ? '编辑管理员' : '添加管理员'}</DialogTitle>
            <DialogDescription>
              {admin ? '修改管理员信息' : '创建新的管理员账号'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名 *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="登录用户名"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">姓名 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="管理员姓名"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                密码 {admin ? '(留空保持不变)' : '*'}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={admin ? '留空保持不变' : '请输入密码'}
                required={!admin}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">角色</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as AdminFormData['role'] })}
                disabled={admin?.role === 'super_admin'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="super_admin">超级管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <div className="text-sm text-red-500">{error}</div>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '保存中...' : admin ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
