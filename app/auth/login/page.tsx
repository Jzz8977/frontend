'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from 'sonner';

// 定义表单验证规则
const loginSchema = z.object({
  email: z.string()
    .min(1, { message: '邮箱不能为空' })
    .email({ message: '请输入有效的邮箱地址' }),
  password: z.string()
    .min(1, { message: '密码不能为空' })
    .min(6, { message: '密码至少需要6个字符' })
    .max(50, { message: '密码不能超过50个字符' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError, token } = useAuthStore();
  
  // 路由保护：如果用户已登录，重定向到仪表盘
  useEffect(() => {
    if (token) {
      router.push('/dashboard');
    }
  }, [token, router]);
  
  // 初始化表单
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange', // 输入时就验证
  });
  
  // 处理表单提交
  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      
      // 登录成功，跳转到仪表盘
      toast.success('登录成功');
      router.push('/dashboard');
    } catch {
      // 错误已在store中处理
    }
  };
  
  // 显示错误信息
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);
  
  // 如果已登录，不显示登录页面
  if (token) {
    return null;
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">登录</CardTitle>
          <CardDescription>
            输入您的邮箱和密码登录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮箱</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="输入您的邮箱"
                        {...field}
                        disabled={isLoading}
                        type="email"
                        autoComplete="email"
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
                        placeholder="输入您的密码"
                        {...field}
                        disabled={isLoading}
                        autoComplete="current-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '登录中...' : '登录'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            没有账号?{' '}
            <Link href="/auth/register" className="text-primary underline">
              注册
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 