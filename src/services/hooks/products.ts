import { useCallback } from 'react';
import useAPI from './base';
import { productsAPI } from '../api';

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

export default useProductsAPI;
