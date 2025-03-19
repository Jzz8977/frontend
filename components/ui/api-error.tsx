import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ApiErrorProps {
  status?: number;
  message?: string;
  onRetry?: () => void;
}

export function ApiError({ status, message, onRetry }: ApiErrorProps) {
  // 根据HTTP状态码确定标题和消息
  const getErrorInfo = () => {
    switch (status) {
      case 401:
        return {
          title: '未授权',
          message: message || '您没有权限访问此资源，请重新登录'
        };
      case 403:
        return {
          title: '禁止访问',
          message: message || '您没有权限执行此操作'
        };
      case 404:
        return {
          title: '资源未找到',
          message: message || '请求的资源不存在'
        };
      case 500:
        return {
          title: '服务器错误',
          message: message || '服务器发生错误，请稍后再试'
        };
      default:
        return {
          title: '请求失败',
          message: message || '发生未知错误，请稍后再试'
        };
    }
  };

  const errorInfo = getErrorInfo();

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-2" />
        <CardTitle className="text-xl">{errorInfo.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground">{errorInfo.message}</p>
        {status && (
          <div className="mt-4 text-center">
            <span className="inline-flex items-center justify-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-sm font-medium text-destructive">
              错误 {status}
            </span>
          </div>
        )}
      </CardContent>
      {onRetry && (
        <CardFooter className="flex justify-center">
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            重试
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 