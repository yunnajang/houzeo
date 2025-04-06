import { useEffect } from 'react';
import { fetchMe } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export const useAuthInit = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    fetchMe()
      .then((user) => setAuth(user))
      .catch(() => clearAuth());
  }, []);
};
