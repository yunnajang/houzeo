import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { updateUser } from '../api/user';
import { toast } from 'react-hot-toast';

export const useUserUpdate = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (user) => {
      setAuth(user), toast.success('Profile updated!');
    },
  });
};
