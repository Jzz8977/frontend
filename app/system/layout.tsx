"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/lib/store/authStore';

export default function SystemLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();

  // 检查用户是否有权限访问系统管理
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <DashboardLayout>
      <div className="container px-4 py-6 max-w-7xl">
        {children}
      </div>
    </DashboardLayout>
  );
} 