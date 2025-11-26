import { useCallback } from 'react';
import useAPI from './base';
import { authAPI } from '../api';
import { setAuthToken, setUserData } from '../authStorage';
import { useAuth } from '../AuthProvider';

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
        console.log("response",response)
        const data = response.data;
        
        const accessToken = data?.accessToken || data?.user?.accessToken;
        const refreshToken = data?.refreshToken || data?.user?.refreshToken;
        const user = data?.user || data;

        if (!accessToken) {
          setError('Login failed: No access token received');
          setLoading(false);
          throw new Error('No access token in response');
        }

        // Store auth tokens and user data
        await setAuthToken(accessToken, refreshToken);
        await setUserData(user);

        // update auth context
        await signIn(accessToken, refreshToken, user);

        setLoading(false);
        return response.data;
      } catch (err) {
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
        // store user; login step will fetch tokens
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

export default useAuthAPI;
