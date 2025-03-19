import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  FileText, 
  Settings, 
  LogOut,
  Bell,
  MessageSquare,
  Shield,
  ClipboardList,
  Sliders
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  active?: boolean;
}

const SidebarItem = ({ href, icon, title, active }: SidebarItemProps) => {
  return (
    <Link 
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary',
        active ? 'bg-accent text-primary' : 'text-muted-foreground hover:bg-accent/50'
      )}
    >
      {icon}
      <span className="text-sm font-medium">{title}</span>
    </Link>
  )
}

const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  
  // 根据用户角色控制显示的菜单项
  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');
  
  return (
    <aside className="flex flex-col h-full bg-background border-r w-64 p-4">
      <div className="flex items-center gap-2 px-2 mb-6">
        <div className="bg-primary rounded-md p-1">
          <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-lg font-semibold">微信小程序管理系统</h1>
      </div>
      
      <nav className="space-y-1 flex-1">
        <SidebarItem 
          href="/dashboard" 
          icon={<LayoutDashboard className="h-5 w-5" />} 
          title="仪表盘" 
          active={pathname === '/dashboard'} 
        />
        
        <SidebarItem 
          href="/users" 
          icon={<Users className="h-5 w-5" />} 
          title="用户管理" 
          active={pathname.startsWith('/users')} 
        />
        
        <SidebarItem 
          href="/products" 
          icon={<ShoppingBag className="h-5 w-5" />} 
          title="产品管理" 
          active={pathname.startsWith('/products')} 
        />
        
        <SidebarItem 
          href="/orders" 
          icon={<FileText className="h-5 w-5" />} 
          title="订单管理" 
          active={pathname.startsWith('/orders')} 
        />
        
        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-medium text-muted-foreground">系统管理</p>
            </div>
            
            <SidebarItem 
              href="/system/announcements" 
              icon={<Bell className="h-5 w-5" />} 
              title="公告管理" 
              active={pathname.startsWith('/system/announcements')} 
            />
            
            <SidebarItem 
              href="/system/feedback" 
              icon={<MessageSquare className="h-5 w-5" />} 
              title="反馈管理" 
              active={pathname.startsWith('/system/feedback')} 
            />
            
            <SidebarItem 
              href="/system/roles" 
              icon={<Shield className="h-5 w-5" />} 
              title="角色权限" 
              active={pathname.startsWith('/system/roles')} 
            />
            
            <SidebarItem 
              href="/system/logs" 
              icon={<ClipboardList className="h-5 w-5" />} 
              title="系统日志" 
              active={pathname.startsWith('/system/logs')} 
            />
            
            <SidebarItem 
              href="/system/config" 
              icon={<Sliders className="h-5 w-5" />} 
              title="系统配置" 
              active={pathname.startsWith('/system/config')} 
            />
            
            <SidebarItem 
              href="/settings" 
              icon={<Settings className="h-5 w-5" />} 
              title="高级设置" 
              active={pathname.startsWith('/settings')} 
            />
          </>
        )}
      </nav>
      
      <div className="border-t pt-4 mt-4">
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">登出</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 