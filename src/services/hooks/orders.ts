import { useCallback } from 'react';
import useAPI from './base';
import { ordersAPI } from '../api';

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

export default useOrdersAPI;
