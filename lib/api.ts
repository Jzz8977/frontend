import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器添加token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 处理401错误（未授权）
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // 重定向到登录页
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  login: (data: { email: string; password: string }) => 
    api.post('/auth/login', data),
    
  register: (data: { name: string; email: string; password: string }) => 
    api.post('/auth/register', data),
    
  wechatLogin: (code: string) => 
    api.post('/auth/wechat-login', { code }),
    
  getMe: () => 
    api.get('/auth/me'),
    
  logout: () => 
    api.get('/auth/logout'),
};

// 用户相关API
export const userAPI = {
  getUsers: (page = 1, limit = 10) => 
    api.get(`/users?page=${page}&limit=${limit}`),
    
  getUser: (id: string) => 
    api.get(`/users/${id}`),
    
  createUser: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    avatar?: string;
    isActive?: boolean;
  }) => 
    api.post('/users', data),
    
  updateUser: (id: string, data: {
    name?: string;
    email?: string;
    role?: string;
    avatar?: string;
    isActive?: boolean;
  }) => 
    api.put(`/users/${id}`, data),
    
  deleteUser: (id: string) => 
    api.delete(`/users/${id}`),
    
  updatePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.put('/users/password/update', data),
};

// 产品相关API
export const productAPI = {
  getProducts: (page = 1, limit = 10) => 
    api.get(`/products?page=${page}&limit=${limit}`),
    
  getProduct: (id: string) => 
    api.get(`/products/${id}`),
    
  createProduct: (data: {
    name: string;
    description: string;
    price: number;
    category?: string;
    images?: string[];
    stock?: number;
    isActive?: boolean;
  }) => 
    api.post('/products', data),
    
  updateProduct: (id: string, data: {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    images?: string[];
    stock?: number;
    isActive?: boolean;
  }) => 
    api.put(`/products/${id}`, data),
    
  deleteProduct: (id: string) => 
    api.delete(`/products/${id}`),
    
  // 微信小程序公开API (无需认证)
  getPublicProducts: (page = 1, limit = 10) => 
    axios.get(`${API_URL}/products/public?page=${page}&limit=${limit}`),
    
  getPublicProduct: (id: string) => 
    axios.get(`${API_URL}/products/public/${id}`),
};

// 订单相关API
export const orderAPI = {
  getOrders: (page = 1, limit = 10) => 
    api.get(`/orders?page=${page}&limit=${limit}`),
    
  getOrder: (id: string) => 
    api.get(`/orders/${id}`),
    
  createOrder: (data: {
    products: Array<{productId: string; quantity: number}>;
    address: string;
    paymentMethod: string;
    status?: string;
  }) => 
    api.post('/orders', data),
    
  updateOrder: (id: string, data: {
    status?: string;
    paymentStatus?: string;
    deliveryStatus?: string;
    trackingNumber?: string;
  }) => 
    api.put(`/orders/${id}`, data),
    
  deleteOrder: (id: string) => 
    api.delete(`/orders/${id}`),
};

// 仪表盘相关API
export const dashboardAPI = {
  getStats: () => 
    api.get('/dashboard/stats'),
    
  getUsersGrowth: () => 
    api.get('/dashboard/users-growth'),
    
  getSales: () => 
    api.get('/dashboard/sales'),
    
  getActiveUsers: () => 
    api.get('/dashboard/active-users'),
};

// 日志管理API
export const logAPI = {
  getLogs: (page = 1, limit = 20, filters: Record<string, string | number> = {}) => {
    let url = `/logs?page=${page}&limit=${limit}`;
    
    // 添加筛选条件
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          url += `&${key}=${value}`;
        }
      });
    }
    
    return api.get(url);
  },
  
  getLog: (id: string) => 
    api.get(`/logs/${id}`),
    
  getLogStats: () => 
    api.get('/logs/stats/summary'),
    
  clearExpiredLogs: (days?: number) => 
    api.delete(`/logs/clear-expired${days ? `?days=${days}` : ''}`),
};

// 系统配置API
export const systemConfigAPI = {
  getSystemConfigs: (group?: string) => {
    let url = '/system-config';
    if (group) {
      url += `?group=${group}`;
    }
    return api.get(url);
  },
  
  getSystemConfig: (key: string) => 
    api.get(`/system-config/${key}`),
    
  createSystemConfig: (data: { key: string; value: unknown; group: string; description: string }) => 
    api.post('/system-config', data),
    
  updateSystemConfig: (key: string, data: { value?: unknown; description?: string }) => 
    api.put(`/system-config/${key}`, data),
    
  batchUpdateSystemConfig: (configs: Array<{key: string, value: unknown}>) => 
    api.put('/system-config/batch/update', { configs }),
    
  deleteSystemConfig: (key: string) => 
    api.delete(`/system-config/${key}`),
};

// 角色管理API
export const roleAPI = {
  getRoles: (page = 1, limit = 10) => 
    api.get(`/roles?page=${page}&limit=${limit}`),
    
  getRole: (id: string) => 
    api.get(`/roles/${id}`),
    
  createRole: (data: { name: string; description: string; permissions: string[] }) => 
    api.post('/roles', data),
    
  updateRole: (id: string, data: { name?: string; description?: string; permissions?: string[] }) => 
    api.put(`/roles/${id}`, data),
    
  deleteRole: (id: string) => 
    api.delete(`/roles/${id}`),
    
  setDefaultRole: (id: string) => 
    api.put(`/roles/${id}/set-default`),
    
  getPermissions: () => 
    api.get('/permissions?limit=100'),
};

// 权限管理API
export const permissionAPI = {
  getPermissions: (page = 1, limit = 50, group?: string) => {
    let url = `/permissions?page=${page}&limit=${limit}`;
    if (group) {
      url += `&group=${group}`;
    }
    return api.get(url);
  },
  
  getPermission: (id: string) => 
    api.get(`/permissions/${id}`),
    
  createPermission: (data: { code: string; name: string; description: string; group: string }) => 
    api.post('/permissions', data),
    
  updatePermission: (id: string, data: { code?: string; name?: string; description?: string; group?: string }) => 
    api.put(`/permissions/${id}`, data),
    
  deletePermission: (id: string) => 
    api.delete(`/permissions/${id}`),
};

// 公告管理API
export const announcementAPI = {
  getAnnouncements: (page = 1, limit = 20, filters: Record<string, string | number> = {}) => {
    let url = `/announcements?page=${page}&limit=${limit}`;
    
    // 添加筛选条件
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          url += `&${key}=${value}`;
        }
      });
    }
    
    return api.get(url);
  },
  
  getAnnouncement: (id: string) => 
    api.get(`/announcements/${id}`),
  
  createAnnouncement: (data: {
    title: string;
    content: string;
    type?: string;
    publishAt?: Date | string;
    expireAt?: Date | string;
    isPinned?: boolean;
    isPublished?: boolean;
  }) => 
    api.post('/announcements', data),
    
  updateAnnouncement: (id: string, data: {
    title?: string;
    content?: string;
    type?: string;
    publishAt?: Date | string;
    expireAt?: Date | string;
    isPinned?: boolean;
    isPublished?: boolean;
  }) => 
    api.put(`/announcements/${id}`, data),
    
  publishAnnouncement: (id: string) => 
    api.put(`/announcements/${id}/publish`),
    
  unpublishAnnouncement: (id: string) => 
    api.put(`/announcements/${id}/unpublish`),
    
  deleteAnnouncement: (id: string) => 
    api.delete(`/announcements/${id}`),
    
  // 微信小程序公开API (无需认证)
  getPublishedAnnouncements: (page = 1, limit = 10, type?: string) => {
    let url = `${API_URL}/announcements/public?page=${page}&limit=${limit}`;
    if (type) {
      url += `&type=${type}`;
    }
    return axios.get(url);
  },
  
  getPublicAnnouncement: (id: string) => 
    axios.get(`${API_URL}/announcements/public/${id}`),
};

// 用户反馈API
export const feedbackAPI = {
  getFeedbacks: (filters: Record<string, string | number> = {}) => {
    let url = `/feedback`;
    
    // 添加查询参数
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    return api.get(url);
  },
  
  getFeedback: (id: string) => 
    api.get(`/feedback/${id}`),
    
  updateFeedbackStatus: (id: string, data: { status: 'pending' | 'processing' | 'resolved' | 'rejected' }) => 
    api.put(`/feedback/${id}/status`, data),
    
  replyFeedback: (id: string, data: { adminReply: string; status: 'processing' | 'resolved' | 'rejected' }) => 
    api.put(`/feedback/${id}/reply`, data),
    
  deleteFeedback: (id: string) => 
    api.delete(`/feedback/${id}`),
    
  getFeedbackStats: () => 
    api.get('/feedback/stats/summary'),
    
  // 微信小程序公开API (无需认证)
  createFeedback: (data: {
    userId?: string;
    contactInfo: string;
    content: string;
    type: string;
    images?: string[];
  }) => 
    axios.post(`${API_URL}/feedback`, data),
};

export default api; 