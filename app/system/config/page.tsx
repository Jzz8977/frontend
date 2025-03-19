"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2,
  Save
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { toast } from 'sonner';
import { systemConfigAPI } from '@/lib/api';
import { useForm } from 'react-hook-form';

interface SystemConfig {
  _id: string;
  key: string;
  value: string | number | boolean | object;
  group: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface ConfigFormData {
  key: string;
  value: string;
  group: string;
  description: string;
}

export default function SystemConfigPage() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<SystemConfig | null>(null);
  const [editBatch, setEditBatch] = useState(false);
  const [batchConfigs, setBatchConfigs] = useState<Array<{key: string, value: string}>>([]);
  
  const form = useForm<ConfigFormData>({
    defaultValues: {
      key: '',
      value: '',
      group: '基础设置',
      description: ''
    }
  });
  
  // 获取配置列表
  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await systemConfigAPI.getSystemConfigs(group || undefined);
      setConfigs(response.data.data);
    } catch (error) {
      console.error('获取系统配置失败:', error);
      toast.error('获取系统配置列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 首次加载时获取数据
  useEffect(() => {
    fetchConfigs();
  }, [group]);
  
  // 添加新配置
  const handleAddConfig = async (data: ConfigFormData) => {
    try {
      await systemConfigAPI.createSystemConfig(data);
      toast.success('配置创建成功');
      setShowAddDialog(false);
      form.reset();
      fetchConfigs();
    } catch (error) {
      console.error('创建配置失败:', error);
      toast.error('创建配置失败');
    }
  };
  
  // 编辑配置
  const handleEditConfig = async (data: ConfigFormData) => {
    if (!currentConfig) return;
    
    try {
      await systemConfigAPI.updateSystemConfig(currentConfig.key, {
        value: data.value,
        description: data.description
      });
      toast.success('配置更新成功');
      setShowEditDialog(false);
      fetchConfigs();
    } catch (error) {
      console.error('更新配置失败:', error);
      toast.error('更新配置失败');
    }
  };
  
  // 删除配置
  const handleDeleteConfig = async () => {
    if (!currentConfig) return;
    
    try {
      await systemConfigAPI.deleteSystemConfig(currentConfig.key);
      toast.success('配置删除成功');
      setShowDeleteDialog(false);
      fetchConfigs();
    } catch (error) {
      console.error('删除配置失败:', error);
      toast.error('删除配置失败');
    }
  };
  
  // 批量更新配置
  const handleBatchUpdate = async () => {
    try {
      await systemConfigAPI.batchUpdateSystemConfig(batchConfigs);
      toast.success('批量更新配置成功');
      setEditBatch(false);
      fetchConfigs();
    } catch (error) {
      console.error('批量更新配置失败:', error);
      toast.error('批量更新配置失败');
    }
  };
  
  // 打开编辑对话框
  const openEditDialog = (config: SystemConfig) => {
    setCurrentConfig(config);
    form.reset({
      key: config.key,
      value: String(config.value),
      group: config.group,
      description: config.description
    });
    setShowEditDialog(true);
  };
  
  // 打开删除对话框
  const openDeleteDialog = (config: SystemConfig) => {
    setCurrentConfig(config);
    setShowDeleteDialog(true);
  };
  
  // 切换批量编辑模式
  const toggleBatchEdit = () => {
    if (!editBatch) {
      // 进入批量编辑模式，初始化批量配置数据
      const batchData = configs.map(config => ({
        key: config.key,
        value: String(config.value)
      }));
      setBatchConfigs(batchData);
    }
    setEditBatch(!editBatch);
  };
  
  // 更新批量编辑值
  const updateBatchValue = (key: string, value: string) => {
    setBatchConfigs(prev => 
      prev.map(item => 
        item.key === key ? { ...item, value } : item
      )
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">系统配置</h1>
          <p className="text-muted-foreground">管理系统基础配置参数</p>
        </div>
        <div className="flex gap-2">
          <Button variant={editBatch ? "default" : "outline"} onClick={toggleBatchEdit}>
            {editBatch ? "取消批量编辑" : "批量编辑"}
          </Button>
          {editBatch && (
            <Button onClick={handleBatchUpdate}>
              <Save className="mr-2 h-4 w-4" />
              保存所有更改
            </Button>
          )}
          {!editBatch && (
            <Button onClick={() => {
              form.reset();
              setShowAddDialog(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              添加配置
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>筛选配置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div>
              <select
                className="p-2 border rounded-md w-40"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
              >
                <option value="">所有分组</option>
                <option value="基础设置">基础设置</option>
                <option value="微信设置">微信设置</option>
                <option value="支付设置">支付设置</option>
                <option value="通知设置">通知设置</option>
                <option value="安全设置">安全设置</option>
                <option value="其他设置">其他设置</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">配置键</TableHead>
                <TableHead>配置值</TableHead>
                <TableHead>分组</TableHead>
                <TableHead>描述</TableHead>
                {!editBatch && <TableHead className="text-right">操作</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={editBatch ? 4 : 5} className="text-center py-10">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : configs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={editBatch ? 4 : 5} className="text-center py-10">
                    暂无配置数据
                  </TableCell>
                </TableRow>
              ) : (
                editBatch ? (
                  // 批量编辑模式
                  batchConfigs.map((config) => {
                    const fullConfig = configs.find(c => c.key === config.key);
                    if (!fullConfig) return null;
                    
                    return (
                      <TableRow key={config.key}>
                        <TableCell className="font-medium">
                          {config.key}
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={config.value}
                            onChange={(e) => updateBatchValue(config.key, e.target.value)}
                          />
                        </TableCell>
                        <TableCell>{fullConfig.group}</TableCell>
                        <TableCell>{fullConfig.description}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  // 普通查看模式
                  configs.map((config) => (
                    <TableRow key={config._id}>
                      <TableCell className="font-medium">
                        {config.key}
                      </TableCell>
                      <TableCell>
                        {typeof config.value === 'object' 
                          ? JSON.stringify(config.value) 
                          : String(config.value)}
                      </TableCell>
                      <TableCell>{config.group}</TableCell>
                      <TableCell>{config.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => openEditDialog(config)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => openDeleteDialog(config)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* 添加配置对话框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加新配置</DialogTitle>
            <DialogDescription>
              创建新的系统配置参数
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddConfig)} className="space-y-4">
              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>配置键</FormLabel>
                    <FormControl>
                      <Input placeholder="如: site.name" {...field} />
                    </FormControl>
                    <FormDescription>键名不能重复，建议使用点号分隔的格式</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>配置值</FormLabel>
                    <FormControl>
                      <Input placeholder="配置的值" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>分组</FormLabel>
                    <FormControl>
                      <select
                        className="w-full p-2 border rounded-md"
                        {...field}
                      >
                        <option value="基础设置">基础设置</option>
                        <option value="微信设置">微信设置</option>
                        <option value="支付设置">支付设置</option>
                        <option value="通知设置">通知设置</option>
                        <option value="安全设置">安全设置</option>
                        <option value="其他设置">其他设置</option>
                      </select>
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
                    <FormLabel>配置描述</FormLabel>
                    <FormControl>
                      <Input placeholder="描述该配置的用途" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">取消</Button>
                </DialogClose>
                <Button type="submit">保存配置</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* 编辑配置对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑配置</DialogTitle>
            <DialogDescription>
              修改配置信息 (配置键不可修改)
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditConfig)} className="space-y-4">
              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>配置键</FormLabel>
                    <FormControl>
                      <Input disabled {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>配置值</FormLabel>
                    <FormControl>
                      <Input placeholder="配置的值" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>分组</FormLabel>
                    <FormControl>
                      <Input disabled {...field} />
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
                    <FormLabel>配置描述</FormLabel>
                    <FormControl>
                      <Input placeholder="描述该配置的用途" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">取消</Button>
                </DialogClose>
                <Button type="submit">更新配置</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* 删除配置确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除配置 &ldquo;{currentConfig?.key}&rdquo; 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">取消</Button>
            </DialogClose>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteConfig}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 