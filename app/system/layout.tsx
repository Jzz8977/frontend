"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Toaster } from "@/components/ui/sonner";

export default function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, token } = useAuthStore();

  // 检查用户是否已登录并具有管理员权限
  useEffect(() => {
    // 未登录 - 重定向到登录页
    if (!token) {
      router.push("/auth/login");
      return;
    }

    // 检查是否有管理员权限
    if (!user || (user.roleKey !== 'admin' && user.roleKey !== 'superadmin')) {
      router.push("/dashboard");
    }
  }, [user, token, router]);

  // 如果没有token，不渲染内容
  if (!token) {
    return null;
  }

  return (
    <DashboardLayout>
      {children}
      <Toaster />
    </DashboardLayout>
  );
} 