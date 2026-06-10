// API 服务层
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL,
  timeout: 15000,
});

// 请求拦截器：添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：token 过期自动刷新
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${baseURL}/api/auth/refresh`, {
            refresh_token: refresh,
          });
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ─── 认证 ───
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/api/auth/login', { username, password }),
  register: (data: { username: string; email: string; password: string; phone?: string; company?: string }) =>
    api.post('/api/auth/register', data),
  me: () => api.get('/api/auth/me'),
};

// ─── 设备 ───
export const deviceAPI = {
  list: (params?: { page?: number; page_size?: number; search?: string; status?: string }) =>
    api.get('/api/devices', { params }),
  get: (id: string) => api.get(`/api/devices/${id}`),
  create: (data: { device_id: string; name: string; model?: string; sim_number?: string; install_location?: string; vehicle_type?: string; battery_type?: string; bms_protocol?: string }) =>
    api.post('/api/devices', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/devices/${id}`, data),
  delete: (id: string) => api.delete(`/api/devices/${id}`),
  summary: () => api.get('/api/devices/stats/summary'),
};

// ─── 数据 ───
export const dataAPI = {
  trajectory: (deviceId: string, start?: string, end?: string, limit?: number) =>
    api.get(`/api/data/trajectory/${deviceId}`, { params: { start, end, limit } }),
  bmsHistory: (deviceId: string, start?: string, end?: string, limit?: number) =>
    api.get(`/api/data/bms/${deviceId}`, { params: { start, end, limit } }),
  latest: (deviceId: string) => api.get(`/api/data/latest/${deviceId}`),
  statistics: (deviceId: string, days?: number) =>
    api.get(`/api/data/statistics/${deviceId}`, { params: { days } }),
};

// ─── 远程控制 ───
export const commandAPI = {
  powerOff: (deviceId: string) => api.post(`/api/commands/power-off/${deviceId}`),
  powerOn: (deviceId: string) => api.post(`/api/commands/power-on/${deviceId}`),
  reboot: (deviceId: string) => api.post(`/api/commands/reboot/${deviceId}`),
  lock: (deviceId: string) => api.post(`/api/commands/lock/${deviceId}`),
  unlock: (deviceId: string) => api.post(`/api/commands/unlock/${deviceId}`),
  list: (deviceId: string) => api.get('/api/commands', { params: { device_id: deviceId } }),
};

// ─── OTA ───
export const otaAPI = {
  firmwares: () => api.get('/api/ota/firmwares'),
  upload: (formData: FormData) => api.post('/api/ota/upload', formData),
  upgrade: (deviceId: string, firmwareId: string) =>
    api.post(`/api/ota/upgrade/${deviceId}`, { firmware_id: firmwareId }, {
      headers: { 'Content-Type': 'multipart/form-data' },
    } as never),
  status: (deviceId: string) => api.get(`/api/ota/status/${deviceId}`),
  delete: (firmwareId: string) => api.delete(`/api/ota/${firmwareId}`),
};

// ─── 订阅 ───
export const subscriptionAPI = {
  plans: () => api.get('/api/subscription/plans'),
  current: () => api.get('/api/subscription/current'),
  renew: (plan: string, months: number) =>
    api.post('/api/subscription/renew', { plan, months }),
  history: () => api.get('/api/subscription/history'),
};

export default api;
