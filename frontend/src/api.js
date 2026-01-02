// frontend/src/api.js
import axios from 'axios';

// --- 智能获取后端地址 ---
// 逻辑：前端用什么 IP 访问的，就去连这个 IP 的 8000 端口
const getBaseUrl = () => {
  const protocol = window.location.protocol; // 获取协议 (http: 或 https:)
  const host = window.location.hostname;     // 自动获取 IP (localhost 或 10.162.x.x)
  return `${protocol}//${host}:8000`;        // 拼接成 http://10.162.x.x:8000
};

// 1. 创建 axios 实例
const api = axios.create({
  baseURL: getBaseUrl(), // 不写死，调用函数动态获取
});

// 2. 请求拦截器：每次发请求前，自动看看有没有 Token，有就带上
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. 响应拦截器：如果后端返回 401 (未授权)，说明 Token 过期了，强制登出
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login'; // 跳回登录页
    }
    return Promise.reject(error);
  }
);

export default api;