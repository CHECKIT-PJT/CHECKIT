import { useCallback } from 'react';

export const useAuth = () => {
  const getToken = useCallback(() => {
    return sessionStorage.getItem('accessToken') || '';
  }, []);

  return {
    token: getToken(),
  };
};
