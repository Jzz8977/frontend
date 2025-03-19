'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, Users, ShoppingBag, FileText, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { dashboardAPI } from '@/lib/api';
import { toast } from 'sonner';

interface StatsData {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

const defaultStats: StatsData = {
  totalUsers: 0,
  totalProducts: 0,
  totalOrders: 0,
  totalRevenue: 0
};

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await dashboardAPI.getStats();
        setStats(response.data.data);
      } catch (error) {
        toast.error('获取统计数据失败');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">仪表盘</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* 用户数统计卡片 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总用户数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '加载中...' : stats.totalUsers}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500 inline-flex items-center mr-1">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  12%
                </span>
                较上月
              </p>
            </CardContent>
          </Card>
          
          {/* 产品数统计卡片 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总产品数</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '加载中...' : stats.totalProducts}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500 inline-flex items-center mr-1">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  8%
                </span>
                较上月
              </p>
            </CardContent>
          </Card>
          
          {/* 订单数统计卡片 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总订单数</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '加载中...' : stats.totalOrders}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-500 inline-flex items-center mr-1">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  5%
                </span>
                较上月
              </p>
            </CardContent>
          </Card>
          
          {/* 收入统计卡片 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总收入</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '加载中...' : `¥${stats.totalRevenue.toLocaleString()}`}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500 inline-flex items-center mr-1">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  15%
                </span>
                较上月
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* 图表和表格区域 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* 图表区域 */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>销售概览</CardTitle>
              <CardDescription>
                过去30天的销售和访问数据
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">图表组件待实现</p>
              </div>
            </CardContent>
          </Card>
          
          {/* 近期活动区域 */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>近期活动</CardTitle>
              <CardDescription>
                最近系统活动记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="mr-4 rounded-full bg-primary/10 p-2">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">新用户注册</p>
                    <p className="text-xs text-muted-foreground">10分钟前</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="mr-4 rounded-full bg-primary/10 p-2">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">新产品添加</p>
                    <p className="text-xs text-muted-foreground">1小时前</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="mr-4 rounded-full bg-primary/10 p-2">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">新订单创建</p>
                    <p className="text-xs text-muted-foreground">2小时前</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="mr-4 rounded-full bg-primary/10 p-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">订单支付完成</p>
                    <p className="text-xs text-muted-foreground">3小时前</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 