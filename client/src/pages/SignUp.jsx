import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import OAuth from '../components/OAuth.jsx';
import VerifyModal from '../components/VerifyModal.jsx';
import AuthLayout from '../components/layouts/AuthLayout.jsx';
import { useSendCode } from '../hooks/useEmailVerification.js';
import { useSignUp } from '../hooks/useSignUp.js';

const schema = yup.object().shape({
  username: yup
    .string()
    .min(3, 'Must be at least 3 characters long')
    .required('Username is required'),
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Must be at least 8 characters long')
    .required('Password is required.')
    .matches(/[a-z]/, 'Must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .matches(
      /[!@#$%^&*()\-_=+{};:,<.>]/,
      'Must contain at least one special character'
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
});

function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    shouldFocusError: true,
  });

  const [formData, setFormData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const {
    mutate: sendCode,
    isPending: isSendCodePending,
    isError: isSendCodeError,
    error: sendCodeError,
  } = useSendCode();
  const {
    mutate: signUp,
    isError: isSignUpError,
    error: signUpError,
  } = useSignUp();

  const isError = isSendCodeError || isSignUpError;

  const onSubmit = (data) => {
    setFormData(data);

    sendCode(data.email, { onSuccess: () => setShowModal(true) });
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <AuthLayout>
      <h1 className='text-3xl font-bold text-center text-brand-main mb-8'>
        Sign Up
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 mb-6'>
        <div className='space-y-4'>
          <div>
            <input
              type='text'
              id='username'
              placeholder='Username'
              {...register('username')}
              className={`form-input ${errors.username && 'border-red-500'}`}
            />
            {errors.username && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <input
              type='email'
              id='email'
              placeholder='Email'
              {...register('email')}
              className={`form-input ${errors.email && 'border-red-500'}`}
            />
            {errors.email && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <input
              type='password'
              id='password'
              placeholder='Password'
              {...register('password')}
              className={`form-input ${errors.password && 'border-red-500'}`}
            />
            {errors.password && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.password.message}
              </p>
            )}
          </div>

          <input
            type='password'
            id='confirmPassword'
            placeholder='Confirm Password'
            {...register('confirmPassword')}
            className={`form-input ${
              errors.confirmPassword && 'border-red-500'
            }`}
          />
          {errors.confirmPassword && (
            <p className='text-xs text-red-600 mt-1'>
              {errors.confirmPassword.message}
            </p>
          )}

          {isError && (
            <p className='text-sm text-red-600' role='alert'>
              {isSignUpError
                ? signUpError?.message || 'Sign-up failed'
                : sendCodeError?.message || 'Failed to send email'}
            </p>
          )}
        </div>

        <button
          type='submit'
          disabled={isSendCodePending}
          className='button-full loading-disabled'
        >
          {isSendCodePending ? (
            <span className='flex items-center justify-center'>
              <svg
                className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              Sending code...
            </span>
          ) : (
            'Sign Up'
          )}
        </button>

        <div className='relative my-6'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300'></div>
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-2 bg-white text-gray-500'>
              Or continue with
            </span>
          </div>
        </div>

        <OAuth />
      </form>

      <div className='text-center text-base'>
        <p className='text-slate-600'>
          Already have an account?{' '}
          <Link
            to='/sign-in'
            className='text-brand-main font-semibold hover:underline'
          >
            Sign In
          </Link>
        </p>
      </div>

      {showModal && formData && (
        <VerifyModal
          formData={formData}
          onClose={handleCloseModal}
          onSuccess={() =>
            signUp(formData, {
              onSuccess: () => {
                setShowModal(false);
                toast.success('🎉 Sign-up complete! Please log in.');
                setTimeout(() => {
                  navigate('/sign-in');
                }, 1000);
              },
              onError: () => setShowModal(false),
            })
          }
        />
      )}
    </AuthLayout>
  );
}

export default SignUp;
