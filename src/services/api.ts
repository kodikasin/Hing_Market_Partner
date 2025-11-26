import apiClient from './apiClient';
import { AxiosResponse } from 'axios';

/**
 * Auth API calls
 */
export const authAPI = {
  login: (credentials: { email: string; password: string }): Promise<AxiosResponse<any>> =>
    apiClient.post('/auth/login', credentials),

  register: (data: { email: string; password: string; name: string }): Promise<AxiosResponse<any>> =>
    apiClient.post('/auth/register', data),

  logout: (): Promise<AxiosResponse<any>> =>
    apiClient.post('/auth/logout'),

  refreshToken: (): Promise<AxiosResponse<any>> =>
    apiClient.post('/auth/refreshToken'),

  getProfile: (): Promise<AxiosResponse<any>> =>
    apiClient.get('/auth/me'),

  updateProfile: (data: any): Promise<AxiosResponse<any>> =>
    apiClient.put('/auth/profile', data),
};

/**
 * Orders API calls
 */
export const ordersAPI = {
  getAllOrders: (params?: any): Promise<AxiosResponse<any>> =>
    apiClient.get('/orders', { params }),

  getOrderById: (id: string): Promise<AxiosResponse<any>> =>
    apiClient.get(`/orders/${id}`),

  createOrder: (data: any): Promise<AxiosResponse<any>> =>
    apiClient.post('/orders', data),

  updateOrder: (id: string, data: any): Promise<AxiosResponse<any>> =>
    apiClient.put(`/orders/${id}`, data),

  deleteOrder: (id: string): Promise<AxiosResponse<any>> =>
    apiClient.delete(`/orders/${id}`),

  updateOrderStatus: (id: string, status: any): Promise<AxiosResponse<any>> =>
    apiClient.patch(`/orders/${id}/status`, status),
};

/**
 * Products API calls
 */
export const productsAPI = {
  getAllProducts: (params?: any): Promise<AxiosResponse<any>> =>
    apiClient.get('/products', { params }),

  getProductById: (id: string): Promise<AxiosResponse<any>> =>
    apiClient.get(`/products/${id}`),

  createProduct: (data: any): Promise<AxiosResponse<any>> =>
    apiClient.post('/products', data),

  updateProduct: (id: string, data: any): Promise<AxiosResponse<any>> =>
    apiClient.put(`/products/${id}`, data),

  deleteProduct: (id: string): Promise<AxiosResponse<any>> =>
    apiClient.delete(`/products/${id}`),
};

/**
 * Company API calls
 */
export const companyAPI = {
  getCompanyDetails: (): Promise<AxiosResponse<any>> =>
    apiClient.get('/company/details'),

  updateCompanyDetails: (data: any): Promise<AxiosResponse<any>> =>
    apiClient.put('/company/details', data),

  getCompanyStats: (): Promise<AxiosResponse<any>> =>
    apiClient.get('/company/stats'),
};

/**
 * Generic API call function for any endpoint
 */
export const apiCall = {
  get: (url: string, config?: any): Promise<AxiosResponse<any>> =>
    apiClient.get(url, config),

  post: (url: string, data?: any, config?: any): Promise<AxiosResponse<any>> =>
    apiClient.post(url, data, config),

  put: (url: string, data?: any, config?: any): Promise<AxiosResponse<any>> =>
    apiClient.put(url, data, config),

  patch: (url: string, data?: any, config?: any): Promise<AxiosResponse<any>> =>
    apiClient.patch(url, data, config),

  delete: (url: string, config?: any): Promise<AxiosResponse<any>> =>
    apiClient.delete(url, config),
};

export default apiClient;
