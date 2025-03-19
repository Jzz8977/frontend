import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Settings, 
  Bell, 
  MessageSquare,
  MenuIcon, 
  XIcon,
  Shield,
  KeyRound,
  Layers,
  LayoutGrid
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { moduleAPI } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface MenuItem {
  id: string;
  key: string;
  name: string;
  icon: string;
  path: string;
  sortOrder: number;
  isSystem: boolean;
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
  isCollapsed: boolean;
}

// 侧边导航项组件
const NavItem = ({ href, icon, title, isActive, isCollapsed }: NavItemProps) => {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        isCollapsed && "justify-center p-2"
      )}
    >
      {icon}
      {!isCollapsed && <span>{title}</span>}
    </Link>
  );
};

// 图标映射表
const iconMap: Record<string, React.ReactNode> = {
  'dashboard': <LayoutDashboard size={20} />,
  'users': <Users size={20} />,
  'products': <Package size={20} />,
  'orders': <ShoppingCart size={20} />,
  'roles': <Shield size={20} />,
  'permissions': <KeyRound size={20} />,
  'modules': <Layers size={20} />,
  'system-config': <Settings size={20} />,
  'announcements': <Bell size={20} />,
  'feedback': <MessageSquare size={20} />,
  'default': <LayoutGrid size={20} />
};

// 获取图标组件
const getIconComponent = (iconName: string): React.ReactNode => {
  return iconMap[iconName] || iconMap.default;
};

// 侧边导航组件
export default function SideNav() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const pathname = usePathname();
  const { token } = useAuthStore();
  
  // 获取菜单数据
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!token) return;
      
      setIsLoading(true);
      try {
        const response = await moduleAPI.getMenuStructure();
        if (response.data && response.data.menuItems) {
          // 按sortOrder排序
          const sortedItems = [...response.data.menuItems]
            .sort((a, b) => a.sortOrder - b.sortOrder);
          setMenuItems(sortedItems);
        }
        setError(null);
      } catch (err) {
        console.error('获取菜单数据失败', err);
        setError('无法加载菜单数据');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMenuItems();
  }, [token]);
  
  // 切换侧边栏展开/收起
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={cn(
      "relative flex flex-col h-full border-r bg-background transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* 顶部Logo区域 */}
      <div className="flex h-14 items-center border-b px-4">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <LayoutDashboard size={22} />
            <span>管理系统</span>
          </Link>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleCollapse}
          className={cn(
            "ml-auto h-8 w-8",
            isCollapsed && "mx-auto"
          )}
        >
          {isCollapsed ? <MenuIcon size={18} /> : <XIcon size={18} />}
        </Button>
      </div>
      
      {/* 菜单内容区域 */}
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-2">
          {isLoading ? (
            // 加载状态显示骨架屏
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2">
                <Skeleton className="h-5 w-5 rounded-md" />
                {!isCollapsed && <Skeleton className="h-4 w-24 rounded-md" />}
              </div>
            ))
          ) : error ? (
            // 错误状态
            <div className="px-3 py-2 text-sm text-red-500">
              {!isCollapsed && error}
              {isCollapsed && <XIcon size={20} className="mx-auto text-red-500" />}
            </div>
          ) : (
            // 渲染菜单项
            menuItems.map((item) => (
              <NavItem 
                key={item.id}
                href={item.path}
                icon={getIconComponent(item.key)}
                title={item.name}
                isActive={pathname === item.path || pathname.startsWith(`${item.path}/`)}
                isCollapsed={isCollapsed}
              />
            ))
          )}
        </nav>
      </ScrollArea>
    </div>
  );
} 