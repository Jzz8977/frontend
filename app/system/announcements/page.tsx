"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Send,
  X,
  ExternalLink
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
  CardFooter, 
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
import { announcementAPI } from '@/lib/api';
import { useForm } from 'react-hook-form';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  author: string;
  status: string;
  type: string;
  publishAt: string;
  expireAt?: string;
  readCount: number;
  isPinned: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementFormData {
  title: string;
  content: string;
  type: string;
  publishAt: string;
  expireAt?: string;
  isPinned: boolean;
  isPublished: boolean;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  
  const form = useForm<AnnouncementFormData>({
    defaultValues: {
      title: '',
      content: '',
      type: '系统通知',
      publishAt: new Date().toISOString().split('T')[0],
      expireAt: '',
      isPinned: false,
      isPublished: false
    }
  });
  
  // 获取公告列表
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const filters = { keyword, type, status };
      const response = await announcementAPI.getAnnouncements(page, 10, filters);
      setAnnouncements(response.data.data.data);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error('获取公告失败:', error);
      toast.error('获取公告列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 首次加载时获取数据
  useEffect(() => {
    fetchAnnouncements();
  }, [page, keyword, type, status]);
  
  // 搜索公告
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAnnouncements();
  };
  
  // 重置筛选条件
  const resetFilters = () => {
    setKeyword('');
    setType('');
    setStatus('');
    setPage(1);
  };
  
  // 添加新公告
  const handleAddAnnouncement = async (data: AnnouncementFormData) => {
    try {
      await announcementAPI.createAnnouncement(data);
      toast.success('公告创建成功');
      setShowAddDialog(false);
      form.reset();
      fetchAnnouncements();
    } catch (error) {
      console.error('创建公告失败:', error);
      toast.error('创建公告失败');
    }
  };
  
  // 编辑公告
  const handleEditAnnouncement = async (data: AnnouncementFormData) => {
    if (!currentAnnouncement) return;
    
    try {
      await announcementAPI.updateAnnouncement(currentAnnouncement._id, data);
      toast.success('公告更新成功');
      setShowEditDialog(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('更新公告失败:', error);
      toast.error('更新公告失败');
    }
  };
  
  // 发布公告
  const handlePublishAnnouncement = async (id: string) => {
    try {
      await announcementAPI.publishAnnouncement(id);
      toast.success('公告已发布');
      fetchAnnouncements();
    } catch (error) {
      console.error('发布公告失败:', error);
      toast.error('发布公告失败');
    }
  };
  
  // 取消发布公告
  const handleUnpublishAnnouncement = async (id: string) => {
    try {
      await announcementAPI.unpublishAnnouncement(id);
      toast.success('公告已取消发布');
      fetchAnnouncements();
    } catch (error) {
      console.error('取消发布公告失败:', error);
      toast.error('取消发布公告失败');
    }
  };
  
  // 删除公告
  const handleDeleteAnnouncement = async () => {
    if (!currentAnnouncement) return;
    
    try {
      await announcementAPI.deleteAnnouncement(currentAnnouncement._id);
      toast.success('公告删除成功');
      setShowDeleteDialog(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('删除公告失败:', error);
      toast.error('删除公告失败');
    }
  };
  
  // 打开编辑对话框
  const openEditDialog = (announcement: Announcement) => {
    setCurrentAnnouncement(announcement);
    form.reset({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      publishAt: new Date(announcement.publishAt).toISOString().split('T')[0],
      expireAt: announcement.expireAt ? new Date(announcement.expireAt).toISOString().split('T')[0] : '',
      isPinned: announcement.isPinned,
      isPublished: announcement.isPublished
    });
    setShowEditDialog(true);
  };
  
  // 打开删除对话框
  const openDeleteDialog = (announcement: Announcement) => {
    setCurrentAnnouncement(announcement);
    setShowDeleteDialog(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">公告管理</h1>
          <p className="text-muted-foreground">管理系统公告，发布重要通知给用户</p>
        </div>
        <Button onClick={() => {
          form.reset();
          setShowAddDialog(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          添加公告
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>筛选公告</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="搜索标题关键词"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div>
              <select
                className="p-2 border rounded-md w-40"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">所有类型</option>
                <option value="系统通知">系统通知</option>
                <option value="功能更新">功能更新</option>
                <option value="维护公告">维护公告</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div>
              <select
                className="p-2 border rounded-md w-40"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">所有状态</option>
                <option value="草稿">草稿</option>
                <option value="已发布">已发布</option>
                <option value="已过期">已过期</option>
              </select>
            </div>
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              查询
            </Button>
            <Button variant="outline" type="button" onClick={resetFilters}>
              重置
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>发布时间</TableHead>
                <TableHead>浏览次数</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : announcements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    暂无公告数据
                  </TableCell>
                </TableRow>
              ) : (
                announcements.map((announcement) => (
                  <TableRow key={announcement._id} className={announcement.isPinned ? 'bg-muted/50' : ''}>
                    <TableCell className="font-medium flex items-center gap-2">
                      {announcement.isPinned && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                          置顶
                        </span>
                      )}
                      {announcement.title}
                    </TableCell>
                    <TableCell>{announcement.type}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        announcement.status === '已发布' 
                          ? 'bg-green-100 text-green-800'
                          : announcement.status === '草稿'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {announcement.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(announcement.publishAt).toLocaleDateString()}</TableCell>
                    <TableCell>{announcement.readCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {announcement.status === '草稿' ? (
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handlePublishAnnouncement(announcement._id)}
                            title="发布"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleUnpublishAnnouncement(announcement._id)}
                            title="取消发布"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => openEditDialog(announcement)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => openDeleteDialog(announcement)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {announcement.isPublished && (
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => window.open(`/announcements/${announcement._id}`, '_blank')}
                            title="预览"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            显示 {announcements.length} 条，共 {totalPages} 页
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              下一页
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* 添加公告对话框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>添加新公告</DialogTitle>
            <DialogDescription>
              创建新的系统公告，可选择立即发布或者保存为草稿
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddAnnouncement)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>公告标题</FormLabel>
                    <FormControl>
                      <Input placeholder="输入公告标题" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>公告内容</FormLabel>
                    <FormControl>
                      <textarea 
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[200px]"
                        placeholder="输入公告内容"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>公告类型</FormLabel>
                      <FormControl>
                        <select
                          className="w-full p-2 border rounded-md"
                          {...field}
                        >
                          <option value="系统通知">系统通知</option>
                          <option value="功能更新">功能更新</option>
                          <option value="维护公告">维护公告</option>
                          <option value="其他">其他</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="publishAt"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>发布时间</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="expireAt"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>过期时间 (可选)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>设置过期时间后，过期的公告将不再展示给用户</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="isPinned"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <input 
                          type="checkbox" 
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4" 
                        />
                      </FormControl>
                      <FormLabel className="m-0">置顶公告</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <input 
                          type="checkbox" 
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4" 
                        />
                      </FormControl>
                      <FormLabel className="m-0">立即发布</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">取消</Button>
                </DialogClose>
                <Button type="submit">保存公告</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* 编辑公告对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑公告</DialogTitle>
            <DialogDescription>
              修改公告信息
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditAnnouncement)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>公告标题</FormLabel>
                    <FormControl>
                      <Input placeholder="输入公告标题" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>公告内容</FormLabel>
                    <FormControl>
                      <textarea 
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[200px]"
                        placeholder="输入公告内容"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>公告类型</FormLabel>
                      <FormControl>
                        <select
                          className="w-full p-2 border rounded-md"
                          {...field}
                        >
                          <option value="系统通知">系统通知</option>
                          <option value="功能更新">功能更新</option>
                          <option value="维护公告">维护公告</option>
                          <option value="其他">其他</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="publishAt"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>发布时间</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="expireAt"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>过期时间 (可选)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>设置过期时间后，过期的公告将不再展示给用户</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="isPinned"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <input 
                          type="checkbox" 
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4" 
                        />
                      </FormControl>
                      <FormLabel className="m-0">置顶公告</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <input 
                          type="checkbox" 
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4" 
                        />
                      </FormControl>
                      <FormLabel className="m-0">已发布</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">取消</Button>
                </DialogClose>
                <Button type="submit">更新公告</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* 删除公告确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除公告 &ldquo;{currentAnnouncement?.title}&rdquo; 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">取消</Button>
            </DialogClose>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteAnnouncement}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 