import { useCallback, useState } from 'react';
import { ordersAPI, authAPI, productsAPI, companyAPI } from '../services/api';
import { setAuthToken, setUserData } from '../services/authStorage';
import { useAuth } from './AuthProvider';

/**
 * Custom hook for API calls with error handling and loading states
 */
export const useAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: any, defaultMessage: string = 'An error occurred') => {
    let errorMessage = defaultMessage;
    
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    setError(errorMessage);
    console.error('API Error:', errorMessage);
  };

  const clearError = () => setError(null);

  return {
    loading,
    error,
    setLoading,
    setError,
    handleError,
    clearError,
  };
};

export const useAuthAPI = () => {
  const { loading, error, setLoading, handleError, setError } = useAPI();
  const { signIn, signOut } = useAuth();

  const getProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.getProfile();
      const user = response.data?.user ?? response.data;
      await setUserData(user);
      setLoading(false);
      return user;
    } catch (err) {
      handleError(err, 'Failed to fetch profile');
      setLoading(false);
      throw err;
    }
  }, [setLoading, setError, handleError]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authAPI.login({ email, password });
        const { user } = response.data;
        const { accessToken, refreshToken } = user;

          // Store auth tokens and user data
          await setAuthToken(accessToken, refreshToken);
          await setUserData(user);

          // update auth context
          await signIn(accessToken, refreshToken, user);

        setLoading(false);
        return response.data;
      } catch (err) {
          // Detailed logging for debugging 404 / endpoint issues
          const axiosErr = err as any;
          if (axiosErr?.response) {
            const status = axiosErr.response.status;
            const data = axiosErr.response.data;
            const url = axiosErr.config?.url || axiosErr.response.config?.url;
            console.error(`Login error ${status} @ ${url}:`, data);
            const serverMsg = data?.message || JSON.stringify(data);
            setError(`Login failed (${status}): ${serverMsg}`);
          } else {
            handleError(err, 'Login failed');
          }
          setLoading(false);
          throw err;
      }
    },
    [setLoading, setError, handleError, signIn]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authAPI.logout();
      await signOut();
      setLoading(false);
    } catch (err) {
      handleError(err, 'Logout failed');
      setLoading(false);
    }
  }, [setLoading, handleError, signOut]);

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authAPI.register({ email, password, name });
        const { user } = response.data;
        // For register, we need to then login to get tokens
        // So we'll just store the user data and return it

        // Store auth tokens and user data
        await setUserData(user);

        setLoading(false);
        return response.data;
      } catch (err) {
        handleError(err, 'Registration failed');
        setLoading(false);
        throw err;
      }
    },
    [setLoading, setError, handleError]
  );

  return { login, logout, register, getProfile, loading, error };
};

/**
 * Custom hook for orders API calls
 */
export const useOrdersAPI = () => {
  const { loading, error, setLoading, handleError, setError } = useAPI();

  const fetchOrders = useCallback(
    async (params?: any) => {
      setLoading(true);
      setError(null);
      try {
        const response = await ordersAPI.getAllOrders(params);
        setLoading(false);
        return response.data;
      } catch (err) {
        handleError(err, 'Failed to fetch orders');
        setLoading(false);
        throw err;
      }
    },
    [setLoading, setError, handleError]
  );

  const fetchOrderById = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await ordersAPI.getOrderById(id);
        setLoading(false);
        return response.data;
      } catch (err) {
        handleError(err, 'Failed to fetch order');
        setLoading(false);
        throw err;
      }
    },
    [setLoading, setError, handleError]
  );

  const createOrder = useCallback(
    async (data: any) => {
      setLoading(true);
      setError(null);
      try {
        const response = await ordersAPI.createOrder(data);
        setLoading(false);
        return response.data;
      } catch (err) {
        handleError(err, 'Failed to create order');
        setLoading(false);
        throw err;
      }
    },
    [setLoading, setError, handleError]
  );

  const updateOrder = useCallback(
    async (id: string, data: any) => {
      setLoading(true);
      setError(null);
      try {
        const response = await ordersAPI.updateOrder(id, data);
        setLoading(false);
        return response.data;
      } catch (err) {
        handleError(err, 'Failed to update order');
        setLoading(false);
        throw err;
      }
    },
    [setLoading, setError, handleError]
  );

  const deleteOrder = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await ordersAPI.deleteOrder(id);
        setLoading(false);
        return response.data;
      } catch (err) {
        handleError(err, 'Failed to delete order');
        setLoading(false);
        throw err;
      }
    },
    [setLoading, setError, handleError]
  );

  return { fetchOrders, fetchOrderById, createOrder, updateOrder, deleteOrder, loading, error };
};

/**
 * Custom hook for products API calls
 */
export const useProductsAPI = () => {
  const { loading, error, setLoading, handleError, setError } = useAPI();

  const fetchProducts = useCallback(
    async (params?: any) => {
      setLoading(true);
      setError(null);
      try {
        const response = await productsAPI.getAllProducts(params);
        setLoading(false);
        return response.data;
      } catch (err) {
        handleError(err, 'Failed to fetch products');
        setLoading(false);
        throw err;
      }
    },
    [setLoading, setError, handleError]
  );

  return { fetchProducts, loading, error };
};

/**
 * Custom hook for company API calls
 */
export const useCompanyAPI = () => {
  const { loading, error, setLoading, handleError, setError } = useAPI();

  const fetchCompanyDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await companyAPI.getCompanyDetails();
      setLoading(false);
      return response.data;
    } catch (err) {
      handleError(err, 'Failed to fetch company details');
      setLoading(false);
      throw err;
    }
  }, [setLoading, setError, handleError]);

  return { fetchCompanyDetails, loading, error };
};
