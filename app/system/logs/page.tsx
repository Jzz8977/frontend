"use client";

import { useState, useEffect } from 'react';
import { 
  Search,
  Filter,
  Eye,
  Trash2
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
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { logAPI } from '@/lib/api';
import { Pagination } from '@/components/ui/pagination';

interface Log {
  _id: string;
  action: string;
  userId: string;
  ip: string;
  userAgent: string;
  resource: string;
  method: string;
  status: number;
  message: string;
  details?: Record<string, unknown>;
  createdAt: string;
  userName?: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [action, setAction] = useState('');
  const [resource, setResource] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [currentLog, setCurrentLog] = useState<Log | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearDays, setClearDays] = useState(30);
  const [clearLoading, setClearLoading] = useState(false);
  
  // 获取日志列表
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await logAPI.getLogs(page, limit, {
        keyword,
        action,
        resource,
        startDate,
        endDate
      });
      setLogs(response.data.data);
      setTotalPages(Math.ceil(response.data.total / limit));
    } catch (error) {
      console.error('获取日志失败:', error);
      toast.error('获取日志列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 首次加载时获取数据
  useEffect(() => {
    fetchLogs();
  }, [page, limit]);
  
  // 处理搜索
  const handleSearch = () => {
    setPage(1);
    fetchLogs();
  };
  
  // 重置筛选条件
  const resetFilters = () => {
    setKeyword('');
    setAction('');
    setResource('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    fetchLogs();
  };
  
  // 打开日志详情对话框
  const openDetailsDialog = (log: Log) => {
    setCurrentLog(log);
    setShowDetailsDialog(true);
  };
  
  // 获取操作类型标签
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return <Badge className="bg-green-500">创建</Badge>;
      case 'update':
        return <Badge className="bg-blue-500">更新</Badge>;
      case 'delete':
        return <Badge className="bg-red-500">删除</Badge>;
      case 'login':
        return <Badge className="bg-purple-500">登录</Badge>;
      case 'logout':
        return <Badge variant="outline">登出</Badge>;
      case 'view':
        return <Badge variant="secondary">查看</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };
  
  // 格式化HTTP方法
  const getMethodBadge = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'GET':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">GET</Badge>;
      case 'POST':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">POST</Badge>;
      case 'PUT':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">PUT</Badge>;
      case 'DELETE':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">DELETE</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };
  
  // 获取状态码样式
  const getStatusStyle = (status: number) => {
    if (status >= 200 && status < 300) {
      return "text-green-600";
    } else if (status >= 300 && status < 400) {
      return "text-blue-600";
    } else if (status >= 400 && status < 500) {
      return "text-yellow-600";
    } else if (status >= 500) {
      return "text-red-600";
    }
    return "";
  };
  
  // 清除过期日志
  const handleClearExpiredLogs = async () => {
    try {
      setClearLoading(true);
      const response = await logAPI.clearExpiredLogs(clearDays);
      toast.success(response.data.message || `成功清除了${response.data.deletedCount}条日志`);
      setShowClearDialog(false);
      // 刷新日志列表
      fetchLogs();
    } catch (error) {
      console.error('清除日志失败:', error);
      toast.error('清除过期日志失败');
    } finally {
      setClearLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">系统日志</h1>
          <p className="text-muted-foreground">查看系统操作记录和活动历史</p>
        </div>
        <Button 
          variant="destructive" 
          onClick={() => setShowClearDialog(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          清除过期日志
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>筛选日志</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <Input
                placeholder="搜索关键词"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <select
                className="p-2 border rounded-md w-full"
                value={action}
                onChange={(e) => setAction(e.target.value)}
              >
                <option value="">所有操作类型</option>
                <option value="create">创建</option>
                <option value="update">更新</option>
                <option value="delete">删除</option>
                <option value="login">登录</option>
                <option value="logout">登出</option>
                <option value="view">查看</option>
              </select>
            </div>
            
            <div>
              <select
                className="p-2 border rounded-md w-full"
                value={resource}
                onChange={(e) => setResource(e.target.value)}
              >
                <option value="">所有资源类型</option>
                <option value="user">用户</option>
                <option value="product">商品</option>
                <option value="order">订单</option>
                <option value="announcement">公告</option>
                <option value="feedback">反馈</option>
                <option value="role">角色</option>
                <option value="systemConfig">系统配置</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">开始日期</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">结束日期</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex items-end gap-2">
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
                <TableHead>操作类型</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>资源</TableHead>
                <TableHead>方法</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>IP地址</TableHead>
                <TableHead>时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    暂无日志数据
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      {getActionBadge(log.action)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.userName || log.userId?.substring(0, 8) || '系统'}
                    </TableCell>
                    <TableCell>
                      {log.resource || '-'}
                    </TableCell>
                    <TableCell>
                      {getMethodBadge(log.method)}
                    </TableCell>
                    <TableCell>
                      <span className={getStatusStyle(log.status)}>
                        {log.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {log.ip || '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openDetailsDialog(log)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        详情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          <div className="flex justify-center mt-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* 清除日志确认对话框 */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认清除过期日志</AlertDialogTitle>
            <AlertDialogDescription>
              这将会删除{clearDays}天前的所有日志记录，此操作不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">清除多少天前的日志:</label>
            <Input
              type="number"
              value={clearDays}
              onChange={(e) => setClearDays(parseInt(e.target.value) || 30)}
              min={1}
              max={365}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearLoading}>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearExpiredLogs}
              disabled={clearLoading}
            >
              {clearLoading ? '处理中...' : '确认清除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* 日志详情对话框 */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>日志详情</DialogTitle>
          </DialogHeader>
          
          {currentLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">ID</p>
                  <p className="text-xs">{currentLog._id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">操作类型</p>
                  <p>{getActionBadge(currentLog.action)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">用户</p>
                  <p>{currentLog.userName || currentLog.userId || '系统'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">资源</p>
                  <p>{currentLog.resource || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">方法</p>
                  <p>{getMethodBadge(currentLog.method)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">状态码</p>
                  <p className={getStatusStyle(currentLog.status)}>{currentLog.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">IP地址</p>
                  <p>{currentLog.ip || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">用户代理</p>
                  <p className="text-xs truncate">{currentLog.userAgent || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">时间</p>
                  <p>{format(new Date(currentLog.createdAt), 'yyyy-MM-dd HH:mm:ss')}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">消息</p>
                <div className="p-3 bg-muted rounded-md whitespace-pre-wrap">{currentLog.message}</div>
              </div>
              
              {currentLog.details && Object.keys(currentLog.details).length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">详细信息</p>
                  <div className="p-3 bg-muted rounded-md overflow-auto max-h-[300px]">
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(currentLog.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>关闭</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 