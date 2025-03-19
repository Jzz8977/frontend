import { create } from 'zustand';
import { userAPI } from '../api';
import { User } from './authStore';

interface UserState {
  users: User[];
  currentUser: User | null;
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  
  fetchUsers: (page?: number, limit?: number) => Promise<void>;
  fetchUser: (id: string) => Promise<void>;
  createUser: (userData: Omit<User, 'id'> & { password: string }) => Promise<void>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  currentUser: null,
  totalUsers: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
  
  fetchUsers: async (page = 1, limit = 10) => {
    try {
      set({ isLoading: true, error: null });
      const response = await userAPI.getUsers(page, limit);
      const { data, totalPages, totalDocs } = response.data;
      
      set({ 
        users: data, 
        totalUsers: totalDocs, 
        totalPages, 
        currentPage: page,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '获取用户列表失败', 
        isLoading: false 
      });
    }
  },
  
  fetchUser: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await userAPI.getUser(id);
      set({ currentUser: response.data.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '获取用户详情失败', 
        isLoading: false 
      });
    }
  },
  
  createUser: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      await userAPI.createUser(userData);
      
      // 重新获取用户列表
      await get().fetchUsers(get().currentPage);
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '创建用户失败', 
        isLoading: false 
      });
    }
  },
  
  updateUser: async (id: string, userData) => {
    try {
      set({ isLoading: true, error: null });
      await userAPI.updateUser(id, userData);
      
      // 如果更新的是当前查看的用户，更新currentUser
      if (get().currentUser && get().currentUser.id === id) {
        const response = await userAPI.getUser(id);
        set({ currentUser: response.data.data });
      }
      
      // 重新获取用户列表
      await get().fetchUsers(get().currentPage);
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '更新用户失败', 
        isLoading: false 
      });
    }
  },
  
  deleteUser: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await userAPI.deleteUser(id);
      
      // 如果删除的是当前查看的用户，清空currentUser
      if (get().currentUser && get().currentUser.id === id) {
        set({ currentUser: null });
      }
      
      // 重新获取用户列表
      await get().fetchUsers(get().currentPage);
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '删除用户失败', 
        isLoading: false 
      });
    }
  },
  
  clearError: () => set({ error: null }),
})); 