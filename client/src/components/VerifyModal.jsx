import { useState } from 'react';
import { IoClose } from 'react-icons/io5';

function VerifyModal({ email, onClose, onVerify, loading, error, onResend }) {
  const [code, setCode] = useState('');

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
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
          Enter the 6-digit code sent to <strong>{email}</strong>
        </p>

        <input
          type='text'
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          placeholder='••••••'
          className='form-input tracking-widest text-center text-xl mb-3'
        />

        {error && <p className='text-sm text-red-600 text-center'>{error}</p>}

        <button
          onClick={() => onVerify(code)}
          disabled={loading}
          className='primary-btn w-full mt-3'
        >
          {loading ? 'Verifying...' : 'Create account'}
        </button>

        <div className='text-center text-sm mt-4 text-slate-600'>
          Didn’t receive the email?{' '}
          <button
            type='button'
            className='text-brand-main font-semibold hover:underline'
            onClick={onResend}
          >
            Resend code
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyModal;
