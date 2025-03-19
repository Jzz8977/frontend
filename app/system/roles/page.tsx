"use client";

import { useState, useEffect } from 'react';
import { 
  UserPlus,
  Edit, 
  Trash2,
  Check,
  X
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
  CardContent
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from 'sonner';
import { roleAPI } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Permission {
  _id: string;
  name: string;
  description: string;
  group: string;
}

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  
  const form = useForm<RoleFormData>({
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
      isDefault: false
    }
  });
  
  // 获取角色列表
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await roleAPI.getRoles();
      setRoles(response.data.data);
    } catch (error) {
      console.error('获取角色列表失败:', error);
      toast.error('获取角色列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 获取权限列表
  const fetchPermissions = async () => {
    try {
      const response = await roleAPI.getPermissions();
      setPermissions(response.data.data);
      
      // 提取所有权限组
      const groups = Array.from(new Set(response.data.data.map((p: Permission) => p.group)));
      setPermissionGroups(groups);
    } catch (error) {
      console.error('获取权限列表失败:', error);
      toast.error('获取权限列表失败');
    }
  };
  
  // 首次加载时获取数据
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);
  
  // 添加新角色
  const handleAddRole = async (data: RoleFormData) => {
    try {
      await roleAPI.createRole(data);
      toast.success('角色创建成功');
      setShowAddDialog(false);
      form.reset();
      fetchRoles();
    } catch (error) {
      console.error('创建角色失败:', error);
      toast.error('创建角色失败');
    }
  };
  
  // 编辑角色
  const handleEditRole = async (data: RoleFormData) => {
    if (!currentRole) return;
    
    try {
      await roleAPI.updateRole(currentRole._id, data);
      toast.success('角色更新成功');
      setShowEditDialog(false);
      fetchRoles();
    } catch (error) {
      console.error('更新角色失败:', error);
      toast.error('更新角色失败');
    }
  };
  
  // 删除角色
  const handleDeleteRole = async () => {
    if (!currentRole) return;
    
    try {
      await roleAPI.deleteRole(currentRole._id);
      toast.success('角色删除成功');
      setShowDeleteDialog(false);
      fetchRoles();
    } catch (error) {
      console.error('删除角色失败:', error);
      toast.error('删除角色失败');
    }
  };
  
  // 设置为默认角色
  const handleSetDefault = async (roleId: string) => {
    try {
      await roleAPI.setDefaultRole(roleId);
      toast.success('默认角色设置成功');
      fetchRoles();
    } catch (error) {
      console.error('设置默认角色失败:', error);
      toast.error('设置默认角色失败');
    }
  };
  
  // 打开编辑对话框
  const openEditDialog = (role: Role) => {
    setCurrentRole(role);
    form.reset({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isDefault: role.isDefault
    });
    setShowEditDialog(true);
  };
  
  // 打开删除对话框
  const openDeleteDialog = (role: Role) => {
    setCurrentRole(role);
    setShowDeleteDialog(true);
  };
  
  // 按组获取权限
  const getPermissionsByGroup = (group: string) => {
    return permissions.filter(p => p.group === group);
  };
  
  // 检查权限是否选中
  const isPermissionSelected = (permissionId: string) => {
    return form.getValues().permissions.includes(permissionId);
  };
  
  // 处理权限组全选/取消全选
  const handleGroupCheckboxChange = (group: string, checked: boolean) => {
    const groupPermissionIds = getPermissionsByGroup(group).map(p => p._id);
    const currentPermissions = form.getValues().permissions;
    
    let newPermissions;
    if (checked) {
      // 添加组内所有权限
      newPermissions = Array.from(new Set([...currentPermissions, ...groupPermissionIds]));
    } else {
      // 移除组内所有权限
      newPermissions = currentPermissions.filter(id => !groupPermissionIds.includes(id));
    }
    
    form.setValue('permissions', newPermissions);
  };
  
  // 检查一个组内的权限是否全部选中
  const isGroupFullySelected = (group: string) => {
    const groupPermissionIds = getPermissionsByGroup(group).map(p => p._id);
    const currentPermissions = form.getValues().permissions;
    
    return groupPermissionIds.every(id => currentPermissions.includes(id));
  };
  
  // 检查一个组内是否有部分权限被选中
  const isGroupPartiallySelected = (group: string) => {
    const groupPermissionIds = getPermissionsByGroup(group).map(p => p._id);
    const currentPermissions = form.getValues().permissions;
    
    const hasAny = groupPermissionIds.some(id => currentPermissions.includes(id));
    const hasAll = groupPermissionIds.every(id => currentPermissions.includes(id));
    
    return hasAny && !hasAll;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">角色与权限</h1>
          <p className="text-muted-foreground">管理系统角色和访问权限</p>
        </div>
        <Button onClick={() => {
          form.reset({
            name: '',
            description: '',
            permissions: [],
            isDefault: false
          });
          setShowAddDialog(true);
        }}>
          <UserPlus className="mr-2 h-4 w-4" />
          添加角色
        </Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">角色名称</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>权限数量</TableHead>
                <TableHead>默认角色</TableHead>
                <TableHead>系统角色</TableHead>
                <TableHead>创建时间</TableHead>
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
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    暂无角色数据
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role._id}>
                    <TableCell className="font-medium">
                      {role.name}
                    </TableCell>
                    <TableCell>
                      {role.description}
                    </TableCell>
                    <TableCell>
                      {role.permissions.length}
                    </TableCell>
                    <TableCell>
                      {role.isDefault ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSetDefault(role._id)}
                          disabled={role.isSystem}
                        >
                          设为默认
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {role.isSystem ? (
                        <Check className="h-5 w-5 text-blue-600" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300" />
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(role.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => openEditDialog(role)}
                          disabled={role.isSystem}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => openDeleteDialog(role)}
                          disabled={role.isSystem || role.isDefault}
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
        </CardContent>
      </Card>
      
      {/* 添加角色对话框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>添加角色</DialogTitle>
            <DialogDescription>
              创建新的系统角色并分配权限
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddRole)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>角色名称</FormLabel>
                      <FormControl>
                        <Input placeholder="例如: 编辑人员" {...field} />
                      </FormControl>
                      <FormDescription>角色名称应当简洁明了，便于识别</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>角色描述</FormLabel>
                      <FormControl>
                        <Input placeholder="描述该角色的用途和职责" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          设为默认角色
                        </FormLabel>
                        <FormDescription>
                          新用户注册后将默认分配此角色
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <FormLabel className="text-base">权限分配</FormLabel>
                <FormDescription>
                  为该角色分配系统权限
                </FormDescription>
                
                <Tabs defaultValue={permissionGroups[0] || "base"} className="mt-2">
                  <TabsList className="mb-2">
                    {permissionGroups.map((group) => (
                      <TabsTrigger key={group} value={group}>
                        {group}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {permissionGroups.map((group) => (
                    <TabsContent key={group} value={group} className="space-y-4">
                      <div className="rounded-md border p-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`group-${group}`}
                            checked={isGroupFullySelected(group)}
                            onCheckedChange={(checked) => {
                              handleGroupCheckboxChange(group, !!checked);
                            }}
                            aria-label={`Select all ${group} permissions`}
                            className={isGroupPartiallySelected(group) ? "bg-primary/50" : ""}
                          />
                          <label
                            htmlFor={`group-${group}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            全选 / 取消全选
                          </label>
                        </div>
                      </div>
                      
                      <ScrollArea className="h-[300px] rounded-md border p-4">
                        <FormField
                          control={form.control}
                          name="permissions"
                          render={() => (
                            <FormItem>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {getPermissionsByGroup(group).map((permission) => (
                                  <FormItem
                                    key={permission._id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={isPermissionSelected(permission._id)}
                                        onCheckedChange={(checked) => {
                                          const currentPermissions = form.getValues().permissions;
                                          
                                          if (checked) {
                                            // 添加权限
                                            form.setValue('permissions', [...currentPermissions, permission._id]);
                                          } else {
                                            // 移除权限
                                            form.setValue(
                                              'permissions',
                                              currentPermissions.filter(id => id !== permission._id)
                                            );
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="text-sm font-medium">
                                        {permission.name}
                                      </FormLabel>
                                      <FormDescription className="text-xs">
                                        {permission.description}
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                ))}
                              </div>
                            </FormItem>
                          )}
                        />
                      </ScrollArea>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">取消</Button>
                </DialogClose>
                <Button type="submit">创建角色</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* 编辑角色对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>编辑角色</DialogTitle>
            <DialogDescription>
              修改角色信息和权限
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditRole)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>角色名称</FormLabel>
                      <FormControl>
                        <Input placeholder="例如: 编辑人员" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>角色描述</FormLabel>
                      <FormControl>
                        <Input placeholder="描述该角色的用途和职责" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={currentRole?.isDefault}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          设为默认角色
                        </FormLabel>
                        <FormDescription>
                          {currentRole?.isDefault 
                            ? "此角色当前已设为默认角色"
                            : "新用户注册后将默认分配此角色"}
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <FormLabel className="text-base">权限分配</FormLabel>
                <FormDescription>
                  为该角色分配系统权限
                </FormDescription>
                
                <Tabs defaultValue={permissionGroups[0] || "base"} className="mt-2">
                  <TabsList className="mb-2">
                    {permissionGroups.map((group) => (
                      <TabsTrigger key={group} value={group}>
                        {group}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {permissionGroups.map((group) => (
                    <TabsContent key={group} value={group} className="space-y-4">
                      <div className="rounded-md border p-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-group-${group}`}
                            checked={isGroupFullySelected(group)}
                            onCheckedChange={(checked) => {
                              handleGroupCheckboxChange(group, !!checked);
                            }}
                            aria-label={`Select all ${group} permissions`}
                            className={isGroupPartiallySelected(group) ? "bg-primary/50" : ""}
                          />
                          <label
                            htmlFor={`edit-group-${group}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            全选 / 取消全选
                          </label>
                        </div>
                      </div>
                      
                      <ScrollArea className="h-[300px] rounded-md border p-4">
                        <FormField
                          control={form.control}
                          name="permissions"
                          render={() => (
                            <FormItem>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {getPermissionsByGroup(group).map((permission) => (
                                  <FormItem
                                    key={permission._id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={isPermissionSelected(permission._id)}
                                        onCheckedChange={(checked) => {
                                          const currentPermissions = form.getValues().permissions;
                                          
                                          if (checked) {
                                            // 添加权限
                                            form.setValue('permissions', [...currentPermissions, permission._id]);
                                          } else {
                                            // 移除权限
                                            form.setValue(
                                              'permissions',
                                              currentPermissions.filter(id => id !== permission._id)
                                            );
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="text-sm font-medium">
                                        {permission.name}
                                      </FormLabel>
                                      <FormDescription className="text-xs">
                                        {permission.description}
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                ))}
                              </div>
                            </FormItem>
                          )}
                        />
                      </ScrollArea>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">取消</Button>
                </DialogClose>
                <Button type="submit">保存更改</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* 删除角色确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除角色 &ldquo;{currentRole?.name}&rdquo; 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">取消</Button>
            </DialogClose>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteRole}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 