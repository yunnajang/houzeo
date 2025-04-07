import { useMutation } from '@tanstack/react-query';
import { sendCode, verifyCode } from '../api/auth';

export const useSendCode = () => {
  return useMutation({
    mutationFn: sendCode,
  });
};

export const useVerifyCode = () => {
  return useMutation({
    mutationFn: verifyCode,
  });
};
