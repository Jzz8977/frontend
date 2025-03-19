/**
 * 权限辅助函数
 */

// 用户角色类型
type UserRole = 'user' | 'admin' | 'superadmin';

// 用户对象接口
interface User {
  id: string;
  roleKey: string;
  permissions?: Permission[];
}

// 权限对象接口
interface Permission {
  id: string;
  key: string;
  name: string;
}

// 检查用户是否有管理员权限
export const isAdmin = (user: User | null | undefined): boolean => {
  if (!user) return false;
  return user.roleKey === 'admin' || user.roleKey === 'superadmin';
};

// 检查用户是否是超级管理员
export const isSuperAdmin = (user: User | null | undefined): boolean => {
  if (!user) return false;
  return user.roleKey === 'superadmin';
};

// 检查用户是否有特定角色
export const hasRole = (user: User | null | undefined, roles: UserRole | UserRole[]): boolean => {
  if (!user) return false;
  
  const rolesToCheck = Array.isArray(roles) ? roles : [roles];
  return rolesToCheck.includes(user.roleKey as UserRole);
};

// 检查用户是否有特定权限
export const hasPermission = (user: User | null | undefined, permissionKey: string): boolean => {
  if (!user || !user.permissions) return false;
  
  // 超级管理员拥有所有权限
  if (user.roleKey === 'superadmin') return true;
  
  // 检查具体权限
  return user.permissions.some((p: Permission) => p.key === permissionKey);
};

// 检查用户是否有一组权限中的任意一个
export const hasAnyPermission = (user: User | null | undefined, permissionKeys: string[]): boolean => {
  if (!user) return false;
  
  // 超级管理员拥有所有权限
  if (user.roleKey === 'superadmin') return true;
  
  // 没有权限列表
  if (!user.permissions) return false;
  
  // 检查是否有任意一个权限
  return permissionKeys.some(key => 
    user.permissions!.some((p: Permission) => p.key === key)
  );
};

// 检查用户是否有一组权限中的所有权限
export const hasAllPermissions = (user: User | null | undefined, permissionKeys: string[]): boolean => {
  if (!user) return false;
  
  // 超级管理员拥有所有权限
  if (user.roleKey === 'superadmin') return true;
  
  // 没有权限列表
  if (!user.permissions) return false;
  
  // 检查是否有所有权限
  return permissionKeys.every(key => 
    user.permissions!.some((p: Permission) => p.key === key)
  );
};

// 获取用户角色的友好名称
export const getRoleName = (roleKey: string): string => {
  const roleMap: Record<string, string> = {
    user: '普通用户',
    admin: '管理员',
    superadmin: '超级管理员'
  };
  
  return roleMap[roleKey] || roleKey;
};

// 角色优先级
export const ROLE_PRIORITY: Record<string, number> = {
  user: 1,
  admin: 10,
  superadmin: 100
};

// 检查用户角色优先级
export const hasHigherPriority = (userRole: string, targetRole: string): boolean => {
  const userPriority = ROLE_PRIORITY[userRole] || 0;
  const targetPriority = ROLE_PRIORITY[targetRole] || 0;
  
  return userPriority > targetPriority;
};

// 检查用户是否可以管理目标用户
export const canManageUser = (currentUser: User | null | undefined, targetUser: User | null | undefined): boolean => {
  if (!currentUser || !targetUser) return false;
  
  // 不能管理自己
  if (currentUser.id === targetUser.id) return false;
  
  // 超级管理员可以管理所有人
  if (currentUser.roleKey === 'superadmin') return true;
  
  // 检查角色优先级
  return hasHigherPriority(currentUser.roleKey, targetUser.roleKey);
}; 