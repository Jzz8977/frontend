'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertCircle, 
  Check, 
  EditIcon, 
  Eye, 
  FileIcon, 
  MoreHorizontal, 
  Pencil, 
  PlusIcon, 
  Trash
} from 'lucide-react';
import { moduleAPI, permissionAPI } from '@/lib/api';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Pagination } from '@/components/ui/pagination';
import { useAuthStore } from '@/lib/store/authStore';

interface Module {
  id: string;
  name: string;
  key: string;
  description: string;
  icon: string;
  path: string;
  sortOrder: number;
  isSystem: boolean;
  isActive: boolean;
  permissions: Permission[];
}

interface Permission {
  id: string;
  name: string;
  key: string;
}

// 状态标签
const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <Badge variant={isActive ? 'success' : 'destructive'}>
    {isActive ? '已启用' : '已禁用'}
  </Badge>
);

// 模块管理页面
export default function ModulesPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  
  // 如果未登录，重定向到登录页面
  useEffect(() => {
    if (!token) {
      router.push('/auth/login?returnUrl=/admin/modules');
    }
  }, [token, router]);
  
  // 模块数据和分页
  const [modules, setModules] = useState<Module[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 添加/编辑模块相关状态
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentModule, setCurrentModule] = useState<Partial<Module>>({});
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  
  // 删除确认对话框
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null);
  
  // 获取模块数据
  const fetchModules = async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      const response = await moduleAPI.getModules(page, 10, search);
      setModules(response.data.data);
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('获取模块列表失败', error);
      toast.error('获取模块列表失败');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 获取权限列表
  const fetchPermissions = async () => {
    try {
      const response = await permissionAPI.getPermissions(1, 100);
      setAvailablePermissions(response.data.data);
    } catch (error) {
      console.error('获取权限列表失败', error);
      toast.error('获取权限列表失败');
    }
  };
  
  // 初始化数据
  useEffect(() => {
    if (token) {
      fetchModules(1);
      fetchPermissions();
    }
  }, [token]);
  
  // 搜索处理
  const handleSearch = () => {
    fetchModules(1, searchTerm);
  };
  
  // 翻页处理
  const handlePageChange = (page: number) => {
    fetchModules(page, searchTerm);
  };
  
  // 添加模块
  const handleAddModule = () => {
    setIsEditing(false);
    setCurrentModule({
      name: '',
      key: '',
      description: '',
      icon: '',
      path: '',
      sortOrder: 0,
      isSystem: false,
      isActive: true
    });
    setSelectedPermissions([]);
    setIsDialogOpen(true);
  };
  
  // 编辑模块
  const handleEditModule = async (moduleId: string) => {
    setIsLoading(true);
    try {
      const response = await moduleAPI.getModule(moduleId);
      const moduleData = response.data;
      setCurrentModule(moduleData);
      setSelectedPermissions(moduleData.permissions?.map((p: Permission) => p.id) || []);
      setIsEditing(true);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('获取模块详情失败', error);
      toast.error('获取模块详情失败');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 切换模块状态
  const handleToggleStatus = async (moduleId: string) => {
    try {
      await moduleAPI.toggleModuleStatus(moduleId);
      toast.success('更新模块状态成功');
      fetchModules(currentPage, searchTerm);
    } catch (error) {
      console.error('更新模块状态失败', error);
      toast.error('更新模块状态失败');
    }
  };
  
  // 确认删除模块
  const confirmDeleteModule = (moduleItem: Module) => {
    setModuleToDelete(moduleItem);
    setIsDeleteDialogOpen(true);
  };
  
  // 执行删除模块
  const handleDeleteModule = async () => {
    if (!moduleToDelete) return;
    
    try {
      await moduleAPI.deleteModule(moduleToDelete.id);
      toast.success('删除模块成功');
      setIsDeleteDialogOpen(false);
      fetchModules(currentPage, searchTerm);
    } catch (error) {
      console.error('删除模块失败', error);
      toast.error('删除模块失败');
    }
  };
  
  // 表单输入处理
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentModule({
      ...currentModule,
      [name]: value
    });
  };
  
  // 处理权限选择
  const handlePermissionChange = (permissionId: string) => {
    if (selectedPermissions.includes(permissionId)) {
      setSelectedPermissions(selectedPermissions.filter(id => id !== permissionId));
    } else {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    }
  };
  
  // 处理开关类型输入
  const handleSwitchChange = (name: string, checked: boolean) => {
    setCurrentModule({
      ...currentModule,
      [name]: checked
    });
  };
  
  // 保存模块
  const handleSaveModule = async () => {
    try {
      if (!currentModule.name || !currentModule.key) {
        toast.error('模块名称和标识为必填项');
        return;
      }
      
      const moduleData = {
        ...currentModule,
        permissions: selectedPermissions
      };
      
      if (isEditing && currentModule.id) {
        await moduleAPI.updateModule(currentModule.id, moduleData);
        toast.success('更新模块成功');
      } else {
        await moduleAPI.createModule(moduleData);
        toast.success('创建模块成功');
      }
      
      setIsDialogOpen(false);
      fetchModules(currentPage, searchTerm);
    } catch (error) {
      console.error('保存模块失败', error);
      toast.error('保存模块失败');
    }
  };
  
  // 如果未登录，不显示内容
  if (!token) {
    return null;
  }

  return (
    <AdminLayout>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>系统模块管理</CardTitle>
          <Button onClick={handleAddModule} className="flex items-center gap-1">
            <PlusIcon size={16} />
            <span>添加模块</span>
          </Button>
        </CardHeader>
        <CardContent>
          {/* 搜索栏 */}
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="搜索模块名称或标识..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline" onClick={handleSearch}>
              搜索
            </Button>
          </div>
          
          {/* 模块列表 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>标识</TableHead>
                  <TableHead>路径</TableHead>
                  <TableHead>排序</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : modules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      未找到模块
                    </TableCell>
                  </TableRow>
                ) : (
                  modules.map((moduleItem) => (
                    <TableRow key={moduleItem.id}>
                      <TableCell className="font-medium">{moduleItem.name}</TableCell>
                      <TableCell>{moduleItem.key}</TableCell>
                      <TableCell>{moduleItem.path}</TableCell>
                      <TableCell>{moduleItem.sortOrder}</TableCell>
                      <TableCell>
                        <StatusBadge isActive={moduleItem.isActive} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {moduleItem.isSystem ? '系统' : '自定义'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditModule(moduleItem.id)}
                            title="编辑"
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(moduleItem.id)}
                            disabled={moduleItem.isSystem}
                            title={moduleItem.isActive ? "禁用" : "启用"}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDeleteModule(moduleItem)}
                            disabled={moduleItem.isSystem}
                            title="删除"
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* 分页组件 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 添加/编辑模块对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? '编辑模块' : '添加模块'}</DialogTitle>
            <DialogDescription>
              {isEditing ? '修改模块信息与配置' : '添加新的系统模块'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">模块名称</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="模块名称"
                  value={currentModule.name || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="key">模块标识</Label>
                <Input
                  id="key"
                  name="key"
                  placeholder="模块的唯一标识"
                  value={currentModule.key || ''}
                  onChange={handleInputChange}
                  disabled={isEditing && (currentModule.isSystem || false)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="模块功能描述"
                value={currentModule.description || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">图标</Label>
                <Input
                  id="icon"
                  name="icon"
                  placeholder="图标标识"
                  value={currentModule.icon || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="path">路径</Label>
                <Input
                  id="path"
                  name="path"
                  placeholder="模块访问路径"
                  value={currentModule.path || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sortOrder">排序</Label>
                <Input
                  id="sortOrder"
                  name="sortOrder"
                  type="number"
                  placeholder="显示顺序"
                  value={currentModule.sortOrder?.toString() || '0'}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="isActive">启用状态</Label>
                <Switch
                  id="isActive"
                  checked={currentModule.isActive === undefined ? true : currentModule.isActive}
                  onCheckedChange={(checked) => handleSwitchChange('isActive', checked)}
                  disabled={currentModule.isSystem}
                />
              </div>
              
              {!isEditing && (
                <div className="flex items-center space-x-2">
                  <Label htmlFor="isSystem">系统模块</Label>
                  <Switch
                    id="isSystem"
                    checked={currentModule.isSystem || false}
                    onCheckedChange={(checked) => handleSwitchChange('isSystem', checked)}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>关联权限</Label>
              <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`permission-${permission.id}`}
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => handlePermissionChange(permission.id)}
                      />
                      <Label htmlFor={`permission-${permission.id}`} className="cursor-pointer">
                        {permission.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveModule}>
              {isEditing ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除模块 &quot;{moduleToDelete?.name}&quot; 吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center my-4">
            <AlertCircle className="text-destructive" size={64} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteModule}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
} 