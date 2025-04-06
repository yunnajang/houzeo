import { useMutation } from '@tanstack/react-query';
import { signIn } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export const useSignIn = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: signIn,
    onSuccess: (user) => {
      console.log(user);
      setAuth(user);
    },
  });
};
