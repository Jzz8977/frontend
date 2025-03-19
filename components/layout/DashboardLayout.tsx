import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import Sidebar from './Sidebar';
import Header from './Header';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/sonner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const { user, token } = useAuthStore();
  
  // 检查是否已登录，未登录则重定向到登录页
  React.useEffect(() => {
    if (!token && typeof window !== 'undefined') {
      router.push('/auth/login');
    }
  }, [token, router]);
  
  // 如果未登录，不显示主面板
  if (!user) {
    return null;
  }
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="flex h-screen bg-background">
      {/* 桌面侧边栏 */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* 移动端侧边栏 */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
      
      {/* 全局消息提示 */}
      <Toaster position="top-right" />
    </div>
  );
};

export default DashboardLayout; 