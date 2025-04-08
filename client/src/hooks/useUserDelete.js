import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { deleteUser } from '../api/user';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

export const useUserDelete = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      clearAuth();
      toast.success('Your account has been deleted');
      navigate('/');
    },
    onError: () => {
      toast.error('Failed to delete account');
    },
  });
};
