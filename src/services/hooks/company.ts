import { useCallback } from 'react';
import useAPI from './base';
import { companyAPI } from '../api';

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

export default useCompanyAPI;
