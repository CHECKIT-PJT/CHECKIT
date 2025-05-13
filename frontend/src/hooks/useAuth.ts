import { useCallback } from 'react';

export const useAuth = () => {
  const getToken = useCallback(() => {
    return localStorage.getItem('token') || '';
  }, []);

  return {
    token: getToken(),
  };
}; 