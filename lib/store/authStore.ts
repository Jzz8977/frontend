import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api';

export interface User {
  id: string;
  name: string;
  email: string;
  roleKey: string;
  avatar?: string;
  registrationType: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  wechatLogin: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authAPI.login({ email, password });
          const { token, user } = response.data.data;
          set({ token, user, isLoading: false });
          
          // 保存到localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || '登录失败，请检查您的凭据', 
            isLoading: false 
          });
        }
      },
      
      register: async (name: string, email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authAPI.register({ name, email, password });
          const { token, user } = response.data.data;
          set({ token, user, isLoading: false });
          
          // 保存到localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || '注册失败，请稍后再试', 
            isLoading: false 
          });
        }
      },
      
      wechatLogin: async (code: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authAPI.wechatLogin(code);
          const { token, user } = response.data.data;
          set({ token, user, isLoading: false });
          
          // 保存到localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || '微信登录失败，请稍后再试', 
            isLoading: false 
          });
        }
      },
      
      logout: async () => {
        try {
          set({ isLoading: true });
          await authAPI.logout();
          
          // 清除localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          set({ token: null, user: null, isLoading: false });
        } catch (error) {
          // 即使API调用失败也清除本地状态
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          set({ token: null, user: null, isLoading: false });
        }
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
); 