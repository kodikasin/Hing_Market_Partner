import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRefreshToken, setAuthToken, clearAuthData } from './authStorage';

const API_BASE_URL = 'https://hing-market-backend.vercel.app';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      
      // Add token to headers if it exists
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ Response from ${response.config.url}:`, response.status);
    return response;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as any;
    
    // Handle both 401 and 403 status codes for expired/invalid tokens
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Check if this is an "Invalid or expired token" error
      const isExpiredTokenError = error.response?.data?.message?.includes('Invalid or expired token') 
        || error.response?.status === 401;
      
      if (!isExpiredTokenError && error.response?.status === 403) {
        // If 403 but not token error, reject immediately
        console.warn('⛔ Forbidden - Access denied');
        return Promise.reject(error);
      }

      console.warn('⚠️ Token expired or invalid - Attempting to refresh');

      // Avoid infinite loop
      if (originalRequest._retry) {
        // Already tried refresh, force logout
        await clearAuthData();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const refresh = await getRefreshToken();
        if (!refresh) {
          await clearAuthData();
          return Promise.reject(error);
        }

        // call refresh endpoint directly with axios to avoid interceptor
        const refreshRes = await axios.post(`${API_BASE_URL}/auth/refreshToken`, null, {
          headers: { rt: refresh },
          timeout: 8000,
        });

        // Refresh response may include new tokens in data.user or data
        const newAccess = refreshRes.data?.accessToken || refreshRes.data?.user?.accessToken;
        const newRefresh = refreshRes.data?.refreshToken || refreshRes.data?.user?.refreshToken || refresh;

        if (newAccess) {
          await setAuthToken(newAccess, newRefresh);
          // set header and retry original request
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return apiClient(originalRequest);
        }
      } catch (e) {
        console.error('Token refresh failed:', e);
        await clearAuthData();
        return Promise.reject(e);
      }
    }

    if (error.response?.status === 404) {
      console.warn('❌ Not Found - Resource not found');
      return Promise.reject(error);
    }

    if (error.response?.status === 500) {
      console.error('🔥 Server Error - Something went wrong on the server');
      return Promise.reject(error);
    }

    if (error.response?.status === 429) {
      console.warn('⏱️ Rate Limited - Too many requests');
      return Promise.reject(error);
    }

    // Network error
    if (!error.response) {
      console.error('🌐 Network Error:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        originalError: error,
      });
    }

    console.error(`❌ Error ${error.response?.status}:`, error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
