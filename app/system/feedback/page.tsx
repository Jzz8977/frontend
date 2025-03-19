"use client";

import { useState, useEffect } from 'react';
import { 
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { feedbackAPI } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

interface Feedback {
  _id: string;
  userId: string;
  type: string;
  content: string;
  contact: string;
  status: 'pending' | 'processing' | 'resolved' | 'rejected';
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
  userName?: string;
}

interface AdminReplyFormData {
  adminReply: string;
  status: 'processing' | 'resolved' | 'rejected';
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);
  
  const form = useForm<AdminReplyFormData>({
    defaultValues: {
      adminReply: '',
      status: 'processing'
    }
  });
  
  // 获取反馈列表
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const query: Record<string, string | number> = {
        page,
        limit
      };
      
      if (keyword) query.keyword = keyword;
      if (status) query.status = status;
      if (type) query.type = type;
      
      const response = await feedbackAPI.getFeedbacks(query);
      setFeedbacks(response.data.data);
      setTotalPages(Math.ceil(response.data.total / limit));
    } catch (error) {
      console.error('获取反馈列表失败:', error);
      toast.error('获取反馈列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 首次加载时获取数据
  useEffect(() => {
    fetchFeedbacks();
  }, [page, limit]);
  
  // 处理搜索
  const handleSearch = () => {
    setPage(1);
    fetchFeedbacks();
  };
  
  // 重置筛选条件
  const resetFilters = () => {
    setKeyword('');
    setStatus('');
    setType('');
    setPage(1);
    fetchFeedbacks();
  };
  
  // 回复反馈
  const handleReplyFeedback = async (data: AdminReplyFormData) => {
    if (!currentFeedback) return;
    
    try {
      await feedbackAPI.replyFeedback(currentFeedback._id, {
        adminReply: data.adminReply,
        status: data.status
      });
      toast.success('反馈回复成功');
      setShowReplyDialog(false);
      form.reset();
      fetchFeedbacks();
    } catch (error) {
      console.error('回复反馈失败:', error);
      toast.error('回复反馈失败');
    }
  };
  
  // 更新反馈状态
  const handleUpdateStatus = async (id: string, status: 'pending' | 'processing' | 'resolved' | 'rejected') => {
    try {
      await feedbackAPI.updateFeedbackStatus(id, { status });
      toast.success('状态更新成功');
      fetchFeedbacks();
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('更新状态失败');
    }
  };
  
  // 打开查看详情对话框
  const openViewDialog = (feedback: Feedback) => {
    setCurrentFeedback(feedback);
    setShowViewDialog(true);
  };
  
  // 打开回复对话框
  const openReplyDialog = (feedback: Feedback) => {
    setCurrentFeedback(feedback);
    form.reset({
      adminReply: feedback.adminReply || '',
      status: feedback.status === 'pending' ? 'processing' : feedback.status
    });
    setShowReplyDialog(true);
  };
  
  // 获取状态标签
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">待处理</Badge>;
      case 'processing':
        return <Badge variant="secondary">处理中</Badge>;
      case 'resolved':
        return <Badge variant="success">已解决</Badge>;
      case 'rejected':
        return <Badge variant="destructive">已拒绝</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // 获取反馈类型标签
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'suggestion':
        return '功能建议';
      case 'bug':
        return '问题反馈';
      case 'complaint':
        return '投诉';
      case 'question':
        return '咨询';
      default:
        return type;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">反馈管理</h1>
          <p className="text-muted-foreground">管理用户反馈和建议</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>筛选反馈</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索关键词"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <select
                className="p-2 border rounded-md w-32"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">所有类型</option>
                <option value="suggestion">功能建议</option>
                <option value="bug">问题反馈</option>
                <option value="complaint">投诉</option>
                <option value="question">咨询</option>
              </select>
            </div>
            
            <div>
              <select
                className="p-2 border rounded-md w-32"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">所有状态</option>
                <option value="pending">待处理</option>
                <option value="processing">处理中</option>
                <option value="resolved">已解决</option>
                <option value="rejected">已拒绝</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                搜索
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                <Filter className="h-4 w-4 mr-2" />
                重置
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>反馈内容</TableHead>
                <TableHead>联系方式</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>提交时间</TableHead>
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
              ) : feedbacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    暂无反馈数据
                  </TableCell>
                </TableRow>
              ) : (
                feedbacks.map((feedback) => (
                  <TableRow key={feedback._id}>
                    <TableCell className="font-medium">
                      {feedback.userName || feedback.userId.substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      {getTypeLabel(feedback.type)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {feedback.content}
                    </TableCell>
                    <TableCell>
                      {feedback.contact || '-'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(feedback.status)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(feedback.createdAt), 'yyyy-MM-dd HH:mm')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openViewDialog(feedback)}>
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openReplyDialog(feedback)}>
                            回复
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>修改状态</DropdownMenuLabel>
                          {feedback.status !== 'pending' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(feedback._id, 'pending')}>
                              设为待处理
                            </DropdownMenuItem>
                          )}
                          {feedback.status !== 'processing' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(feedback._id, 'processing')}>
                              设为处理中
                            </DropdownMenuItem>
                          )}
                          {feedback.status !== 'resolved' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(feedback._id, 'resolved')}>
                              设为已解决
                            </DropdownMenuItem>
                          )}
                          {feedback.status !== 'rejected' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(feedback._id, 'rejected')}>
                              设为已拒绝
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page <= 1}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={pageNumber === page}
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page >= totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
      
      {/* 查看详情对话框 */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>反馈详情</DialogTitle>
          </DialogHeader>
          
          {currentFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">用户</p>
                  <p>{currentFeedback.userName || currentFeedback.userId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">类型</p>
                  <p>{getTypeLabel(currentFeedback.type)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">联系方式</p>
                  <p>{currentFeedback.contact || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">状态</p>
                  <p>{getStatusBadge(currentFeedback.status)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">提交时间</p>
                  <p>{format(new Date(currentFeedback.createdAt), 'yyyy-MM-dd HH:mm:ss')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">更新时间</p>
                  <p>{format(new Date(currentFeedback.updatedAt), 'yyyy-MM-dd HH:mm:ss')}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">反馈内容</p>
                <div className="p-3 bg-muted rounded-md whitespace-pre-wrap">{currentFeedback.content}</div>
              </div>
              
              {currentFeedback.adminReply && (
                <div>
                  <p className="text-sm font-medium mb-1">管理员回复</p>
                  <div className="p-3 bg-muted rounded-md whitespace-pre-wrap">{currentFeedback.adminReply}</div>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>关闭</Button>
                <Button onClick={() => {
                  setShowViewDialog(false);
                  openReplyDialog(currentFeedback);
                }}>回复</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* 回复对话框 */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>回复反馈</DialogTitle>
            <DialogDescription>
              回复用户的反馈并更新处理状态
            </DialogDescription>
          </DialogHeader>
          
          {currentFeedback && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">反馈内容</p>
                <div className="p-3 bg-muted rounded-md whitespace-pre-wrap">{currentFeedback.content}</div>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleReplyFeedback)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="adminReply"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>回复内容</FormLabel>
                        <FormControl>
                          <Textarea placeholder="请输入回复内容" rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>状态</FormLabel>
                        <FormControl>
                          <select
                            className="w-full p-2 border rounded-md"
                            {...field}
                          >
                            <option value="processing">处理中</option>
                            <option value="resolved">已解决</option>
                            <option value="rejected">已拒绝</option>
                          </select>
                        </FormControl>
                        <FormDescription>更新反馈的处理状态</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">取消</Button>
                    </DialogClose>
                    <Button type="submit">提交回复</Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 