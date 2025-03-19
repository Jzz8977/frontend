"use client";

import { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Search,
  X,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/components/ui/use-toast';
import { userAPI, roleAPI } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { ApiError } from '@/components/ui/api-error';
import { DataNotFound } from '@/components/ui/data-not-found';
import { Pagination } from '@/components/ui/pagination';

interface User {
  id: string;
  name: string;
  email: string;
  roleKey: string;
  registrationType: string;
  isActive: boolean;
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  key: string;
  description: string;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  roleKey: string;
  isActive: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ status?: number; message?: string } | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { toast } = useToast();
  
  const form = useForm<UserFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      roleKey: '',
      isActive: true
    }
  });
  
  // 获取用户列表
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userAPI.getAdminUsers(page, limit, searchTerm);
      
      if (response.data.success) {
        setUsers(response.data.data.data);
        setTotalPages(response.data.data.totalPages);
      } else {
        setError({ message: '获取用户列表失败' });
      }
    } catch (error: any) {
      console.error('获取用户列表失败:', error);
      setError({ 
        status: error.response?.status, 
        message: error.response?.data?.message || '获取用户列表失败' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  // 获取角色列表
  const fetchRoles = async () => {
    try {
      const response = await roleAPI.getRoles(1, 100);
      if (response.data.success) {
        setRoles(response.data.data.data);
      } else {
        toast({
          title: '获取角色列表失败',
          description: response.data.message,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('获取角色列表失败:', error);
      toast({
        title: '获取角色列表失败',
        description: error.response?.data?.message || '服务器错误',
        variant: 'destructive'
      });
    }
  };
  
  // 首次加载时获取数据
  useEffect(() => {
    fetchRoles();
    fetchUsers(page);
  }, []);
  
  // 当页码或搜索条件变化时重新获取数据
  useEffect(() => {
    fetchUsers(page);
  }, [page, searchTerm]);
  
  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // 重置为第一页
    fetchUsers(1);
  };
  
  // 清除搜索
  const clearSearch = () => {
    setSearchTerm('');
    setPage(1);
    fetchUsers(1);
  };
  
  // 添加新用户
  const handleAddUser = async (data: UserFormData) => {
    try {
      if (data.password !== data.confirmPassword) {
        toast({
          title: '密码不匹配',
          description: '两次输入的密码不一致',
          variant: 'destructive'
        });
        return;
      }
      
      const { confirmPassword, ...userData } = data;
      
      await userAPI.createUser(userData);
      
      toast({
        title: '用户创建成功',
        description: `用户 ${data.name} 已成功创建`
      });
      
      setShowAddDialog(false);
      form.reset();
      fetchUsers(page);
    } catch (error: any) {
      console.error('创建用户失败:', error);
      toast({
        title: '创建用户失败',
        description: error.response?.data?.message || '服务器错误',
        variant: 'destructive'
      });
    }
  };
  
  // 编辑用户
  const handleEditUser = async (data: UserFormData) => {
    if (!currentUser) return;
    
    try {
      const updateData: {
        name?: string;
        email?: string;
        roleKey?: string;
        isActive?: boolean;
        password?: string;
      } = {
        name: data.name,
        email: data.email,
        roleKey: data.roleKey,
        isActive: data.isActive
      };
      
      // 仅当输入了密码时才更新密码
      if (data.password) {
        if (data.password !== data.confirmPassword) {
          toast({
            title: '密码不匹配',
            description: '两次输入的密码不一致',
            variant: 'destructive'
          });
          return;
        }
        updateData.password = data.password;
      }
      
      await userAPI.updateUser(currentUser.id, updateData);
      
      toast({
        title: '用户更新成功',
        description: `用户 ${data.name} 已成功更新`
      });
      
      setShowEditDialog(false);
      fetchUsers(page);
    } catch (error: any) {
      console.error('更新用户失败:', error);
      toast({
        title: '更新用户失败',
        description: error.response?.data?.message || '服务器错误',
        variant: 'destructive'
      });
    }
  };
  
  // 删除用户
  const handleDeleteUser = async () => {
    if (!currentUser) return;
    
    try {
      await userAPI.deleteUser(currentUser.id);
      
      toast({
        title: '用户删除成功',
        description: `用户 ${currentUser.name} 已成功删除`
      });
      
      setShowDeleteDialog(false);
      // 如果当前页只有一个用户且不是第一页，则返回上一页
      if (users.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchUsers(page);
      }
    } catch (error: any) {
      console.error('删除用户失败:', error);
      toast({
        title: '删除用户失败',
        description: error.response?.data?.message || '服务器错误',
        variant: 'destructive'
      });
    }
  };
  
  // 打开编辑对话框
  const openEditDialog = (user: User) => {
    setCurrentUser(user);
    form.reset({
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
      roleKey: user.roleKey,
      isActive: user.isActive
    });
    setShowEditDialog(true);
  };
  
  // 打开删除对话框
  const openDeleteDialog = (user: User) => {
    setCurrentUser(user);
    setShowDeleteDialog(true);
  };
  
  // 获取角色名称
  const getRoleName = (roleKey: string) => {
    const role = roles.find(r => r.key === roleKey);
    return role?.name || roleKey;
  };
  
  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '从未登录';
    return new Date(dateString).toLocaleString('zh-CN');
  };
  
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <ApiError 
          status={error.status || 500}
          message={error.message}
          onRetry={() => fetchUsers(page)}
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">用户管理</h1>
          <p className="text-muted-foreground">管理系统用户账号和权限</p>
        </div>
        <Button onClick={() => {
          form.reset({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            roleKey: '',
            isActive: true
          });
          setShowAddDialog(true);
        }}>
          <UserPlus className="mr-2 h-4 w-4" />
          添加用户
        </Button>
      </div>
      
      {/* 搜索栏 */}
      <Card className="overflow-hidden">
        <form onSubmit={handleSearch}>
          <div className="flex p-4 items-center">
            <Input 
              placeholder="搜索用户名或邮箱..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-lg"
            />
            <Button type="submit" className="ml-2">
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
            {searchTerm && (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={clearSearch} 
                className="ml-2"
              >
                <X className="h-4 w-4 mr-2" />
                清除
              </Button>
            )}
          </div>
        </form>
      </Card>
      
      {/* 用户列表 */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">用户名</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>注册方式</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>最后登录</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10">
                    <DataNotFound
                      title="未找到用户"
                      description="没有符合条件的用户，或者用户列表为空"
                      showRetry={false}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name}
                    </TableCell>
                    <TableCell>
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getRoleName(user.roleKey)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.registrationType === 'email' ? '邮箱注册' : 
                       user.registrationType === 'wechat' ? '微信登录' : 
                       user.registrationType}
                    </TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>活跃</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          <span>禁用</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDate(user.lastLogin)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openDeleteDialog(user)}
                          disabled={user.roleKey === 'superadmin'} // 防止删除超级管理员
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* 分页 */}
          {!loading && users.length > 0 && (
            <div className="flex justify-end mt-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* 添加用户对话框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>添加用户</DialogTitle>
            <DialogDescription>
              创建新用户账号并分配角色
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddUser)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名</FormLabel>
                    <FormControl>
                      <Input placeholder="输入用户名..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮箱</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="输入邮箱地址..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="输入密码..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>确认密码</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="再次输入密码..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="roleKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>角色</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择用户角色" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.key} value={role.key}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>账号状态</FormLabel>
                      <FormDescription>
                        是否启用此用户账号
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    取消
                  </Button>
                </DialogClose>
                <Button type="submit">创建用户</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* 编辑用户对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
            <DialogDescription>
              修改用户信息和权限
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditUser)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名</FormLabel>
                    <FormControl>
                      <Input placeholder="输入用户名..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮箱</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="输入邮箱地址..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator className="my-2" />
              <div className="text-sm text-muted-foreground mb-2">
                <p>如需修改密码，请填写以下字段，否则请留空</p>
              </div>
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>新密码</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="输入新密码..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>确认新密码</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="再次输入新密码..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator className="my-2" />
              
              <FormField
                control={form.control}
                name="roleKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>角色</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={currentUser?.roleKey === 'superadmin'} // 防止修改超级管理员角色
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择用户角色" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.key} value={role.key}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>账号状态</FormLabel>
                      <FormDescription>
                        是否启用此用户账号
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={currentUser?.roleKey === 'superadmin'} // 防止禁用超级管理员
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    取消
                  </Button>
                </DialogClose>
                <Button type="submit">保存更改</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* 删除用户确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除用户 &ldquo;{currentUser?.name}&rdquo; 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                取消
              </Button>
            </DialogClose>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteUser}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 