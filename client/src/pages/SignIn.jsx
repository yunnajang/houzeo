import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useSignIn } from '../hooks/useSignIn.js';
import OAuth from '../components/OAuth.jsx';
import AuthLayout from '../components/layouts/AuthLayout.jsx';

const schema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Must be at least 8 characters long')
    .required('Password is required.'),
});

function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    shouldFocusError: true,
  });

  const { mutate, isPending, isError, error } = useSignIn();
  const navigate = useNavigate();

  const onSubmit = (formData) => {
    mutate(formData, { onSuccess: () => navigate('/') });
  };

  return (
    <AuthLayout>
      <h1 className='text-3xl font-bold text-brand-main mb-8 text-center'>
        Sign In
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 mb-6'>
        <div className='space-y-4'>
          <div>
            <input
              type='email'
              id='email'
              placeholder='Email'
              autoComplete='email'
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
              name='password'
              placeholder='Password'
              autoComplete='current-password'
              {...register('password')}
              className={`form-input ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.password && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.password.message}
              </p>
            )}
          </div>

          {isError && (
            <p className='text-sm text-red-600' role='alert'>
              {error.message}
            </p>
          )}
        </div>

        <button
          type='submit'
          disabled={isPending}
          className='
            button-full loading-disabled'
          aria-busy={isPending}
        >
          {isPending ? (
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
              Signing in...
            </span>
          ) : (
            'Sign In'
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
        <p className='text-gray-600'>
          Don't have an account?{' '}
          <Link
            to='/sign-up'
            className='text-brand-main font-semibold hover:underline'
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default SignIn;
