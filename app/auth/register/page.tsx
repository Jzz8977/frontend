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
const registerSchema = z.object({
  name: z.string()
    .min(1, { message: '姓名不能为空' })
    .min(2, { message: '姓名至少需要2个字符' })
    .max(50, { message: '姓名不能超过50个字符' }),
  email: z.string()
    .min(1, { message: '邮箱不能为空' })
    .email({ message: '请输入有效的邮箱地址' }),
  password: z.string()
    .min(1, { message: '密码不能为空' })
    .min(6, { message: '密码至少需要6个字符' })
    .max(50, { message: '密码不能超过50个字符' })
    .regex(/[a-z]/, { message: '密码必须包含小写字母' })
    .regex(/[A-Z]/, { message: '密码必须包含大写字母' })
    .regex(/[0-9]/, { message: '密码必须包含数字' }),
  confirmPassword: z.string()
    .min(1, { message: '确认密码不能为空' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "密码和确认密码不匹配",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError, token } = useAuthStore();
  
  // 路由保护：如果用户已登录，重定向到仪表盘
  useEffect(() => {
    if (token) {
      router.push('/dashboard');
    }
  }, [token, router]);
  
  // 初始化表单
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange', // 输入时就验证
  });
  
  // 处理表单提交
  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await register(data.name, data.email, data.password);
      
      // 注册成功，跳转到仪表盘
      toast.success('注册成功');
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
  
  // 如果已登录，不显示注册页面
  if (token) {
    return null;
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">注册账户</CardTitle>
          <CardDescription>
            创建您的账户以访问管理系统
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>姓名</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="输入您的姓名"
                        {...field}
                        disabled={isLoading}
                        autoComplete="name"
                      />
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
                        autoComplete="new-password"
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
                        placeholder="再次输入您的密码"
                        {...field}
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '注册中...' : '注册'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            已有账号?{' '}
            <Link href="/auth/login" className="text-primary underline">
              登录
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 