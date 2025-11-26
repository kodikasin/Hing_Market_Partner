import { useState } from 'react';

export const useAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: any, defaultMessage: string = 'An error occurred') => {
    let errorMessage = defaultMessage;

    if (err?.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err?.message) {
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

export default useAPI;
