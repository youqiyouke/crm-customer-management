'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Users, Shield, ArrowLeft, KeyRound } from 'lucide-react';
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
import { Admin } from '@/types/admin';
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from '@/lib/customer-store';
import { logoutAdmin, getCurrentAdmin } from '@/lib/admin-store';

interface AdminWithTimestamp {
  id: string;
  username: string;
  name: string;
  role: 'super_admin' | 'admin';
  createdAt: string;
  lastLogin?: string;
}

export default function AdminsPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminWithTimestamp | null>(null);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resettingAdmin, setResettingAdmin] = useState<AdminWithTimestamp | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [admins, setAdmins] = useState<AdminWithTimestamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<ReturnType<typeof getCurrentAdmin>>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'admin' as 'admin' | 'super_admin',
  });

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const data = await getAdmins();
      setAdmins(data);
    } catch (error) {
      console.error('加载管理员列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const admin = getCurrentAdmin();
    setCurrentAdmin(admin);
    if (!admin) {
      router.push('/login');
    } else if (admin.role !== 'super_admin') {
      router.push('/');
    } else {
      loadAdmins();
    }
  }, [router, refreshKey]);

  if (!currentAdmin || currentAdmin.role !== 'super_admin') {
    return null;
  }

  const handleAddAdmin = () => {
    setEditingAdmin(null);
    setFormData({ username: '', password: '', name: '', role: 'admin' });
    setDialogOpen(true);
  };

  const handleEditAdmin = (admin: AdminWithTimestamp) => {
    setEditingAdmin(admin);
    setFormData({
      username: admin.username,
      password: '',
      name: admin.name,
      role: admin.role,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.name) return;
    if (!editingAdmin && !formData.password) return;

    try {
      if (editingAdmin) {
        const updateData: {
          username?: string;
          password?: string;
          name?: string;
          role?: string;
        } = {
          username: formData.username,
          name: formData.name,
          role: formData.role,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await updateAdmin(editingAdmin.id, updateData);
      } else {
        await createAdmin({
          username: formData.username,
          password: formData.password,
          name: formData.name,
          role: formData.role,
        });
      }
      setDialogOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      console.error('保存管理员失败:', error);
      alert('保存失败');
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (confirm('确定要删除这个管理员吗？')) {
      const result = await deleteAdmin(id);
      if (result.success) {
        setRefreshKey((k) => k + 1);
      } else {
        alert(result.error || '删除失败');
      }
    }
  };

  const handleResetPassword = (admin: AdminWithTimestamp) => {
    setResettingAdmin(admin);
    setNewPassword('');
    setResetPasswordOpen(true);
  };

  const confirmResetPassword = async () => {
    if (resettingAdmin && newPassword.trim()) {
      const result = await updateAdmin(resettingAdmin.id, { password: newPassword.trim() });
      if (result.success) {
        setResetPasswordOpen(false);
        setResettingAdmin(null);
        setNewPassword('');
        alert('密码重置成功');
      } else {
        alert(result.error || '重置失败');
      }
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    router.push('/login');
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const getRoleBadge = (role: AdminWithTimestamp['role']) => {
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
            <div className="flex items-center gap-4">
              <Button onClick={handleAddAdmin}>
                <Plus className="mr-2 h-4 w-4" />
                添加管理员
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                退出登录
              </Button>
            </div>
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
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">加载中...</div>
          ) : (
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
                          编辑
                        </Button>
                        {admin.role !== 'super_admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteAdmin(admin.id)}
                          >
                            删除
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAdmin ? '编辑管理员' : '添加管理员'}</DialogTitle>
            <DialogDescription>
              {editingAdmin ? '修改管理员信息' : '创建新的管理员账号'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="用户名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="姓名"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  密码 {editingAdmin && '(留空保持不变)'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="密码"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">角色</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as 'admin' | 'super_admin' })}
                  disabled={editingAdmin?.role === 'super_admin'}
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
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>
              {editingAdmin ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重置密码</DialogTitle>
            <DialogDescription>
              为 {resettingAdmin?.name} 设置新密码
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
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPasswordOpen(false)}>
              取消
            </Button>
            <Button onClick={confirmResetPassword}>确认重置</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
