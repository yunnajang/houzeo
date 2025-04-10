import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

export const useSignOut = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      clearAuth();
      toast.success('Signed out successfully.');
      navigate('/sign-in');
    },
    onError: () => {
      toast.error("Couldn't sign you out. Please try again.");
    },
  });
};
