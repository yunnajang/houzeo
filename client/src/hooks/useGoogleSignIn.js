import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { googleSignIn } from '../api/auth';

export const useGoogleSignIn = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: googleSignIn,
    onSuccess: (user) => setAuth(user),
  });
};
