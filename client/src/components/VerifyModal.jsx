import { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { useSendCode, useVerifyCode } from '../hooks/useEmailVerification';

function VerifyModal({ formData, onClose, onSuccess }) {
  const [code, setCode] = useState('');
  const [inputError, setInputError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const {
    mutate: resendCode,
    isPending: isResendCodePending,
    isError: isResendCodeError,
    error: resendCodeError,
  } = useSendCode();
  const {
    mutate: verifyCode,
    isPending: isVerifyCodePending,
    isError: isVerifyCodeError,
    error: verifyCodeError,
  } = useVerifyCode();

  const isError = isResendCodeError || isVerifyCodeError;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = () => {
    setInputError('');

    if (!code || code.length !== 6) {
      setInputError('Please enter the 6-digit code');
      return;
    }

    verifyCode(
      { email: formData.email, code },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      }
    );
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    resendCode(formData.email, {
      onSuccess: () => setCooldown(60),
    });
  };

  return (
    <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm'>
      <div className='bg-white w-full max-w-md p-6 rounded-xl relative shadow-xl animate-fadeIn'>
        <button
          className='absolute top-4 right-4 text-xl text-gray-500 hover:text-gray-700'
          onClick={onClose}
          aria-label='Close'
        >
          <IoClose />
        </button>

        <h2 className='text-xl font-semibold text-center mb-2'>
          Confirm your account
        </h2>
        <p className='text-sm text-center text-slate-600 mb-6'>
          Enter the 6-digit code sent to <strong>{formData.email}</strong>
        </p>

        <input
          type='text'
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleVerify();
          }}
          maxLength={6}
          placeholder='••••••'
          className='form-input tracking-widest text-center text-xl mb-3'
        />

        {inputError && (
          <p className='text-sm text-red-600 text-center'>{inputError}</p>
        )}
        {isError && (
          <p className='text-sm text-red-600 text-center'>
            {isVerifyCodeError
              ? verifyCodeError.message
              : resendCodeError.message}
          </p>
        )}

        <button
          onClick={handleVerify}
          disabled={isVerifyCodePending}
          className='button-full'
        >
          {isVerifyCodePending ? 'Verifying...' : 'Verify email'}
        </button>

        <div className='text-center text-sm mt-4 text-slate-600'>
          Didn’t receive the email?{' '}
          <button
            type='button'
            onClick={handleResend}
            disabled={isResendCodePending || cooldown > 0}
            className='text-brand-main font-semibold hover:underline'
          >
            {isResendCodePending
              ? 'Resending...'
              : cooldown > 0
              ? `Resend in ${cooldown}s`
              : 'Resend code'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyModal;
