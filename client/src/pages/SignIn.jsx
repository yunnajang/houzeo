import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice.js';
import OAuth from '../components/OAuth.jsx';
import AuthLayout from '../components/layouts/AuthLayout.jsx';

function SignIn() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[\w-.]+@[\w-]+\.[a-z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setErrors((prev) => ({
      ...prev,
      [e.target.id]: null,
    }));

    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        setErrors({
          general: 'Incorrect email or password. Please try again.',
        });
        return;
      }

      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      setErrors({ general: 'Something went wrong. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className='text-3xl font-bold text-brand-main mb-8 text-center'>
        Sign In
      </h1>

      <form onSubmit={handleSubmit} className='space-y-6 mb-6'>
        <div className='space-y-4'>
          <div>
            <input
              type='email'
              id='email'
              name='email'
              placeholder='Email'
              autoComplete='email'
              required
              className={`form-input ${errors.email && 'border-red-500'}`}
              onChange={handleChange}
            />
            {errors.email && (
              <p className='text-xs text-red-600 mt-1'>{errors.email}</p>
            )}
          </div>

          <div>
            <input
              type='password'
              id='password'
              name='password'
              placeholder='Password'
              autoComplete='current-password'
              required
              className={`form-input ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              onChange={handleChange}
            />
            {errors.password && (
              <p className='text-xs text-red-600 mt-1'>{errors.password}</p>
            )}
          </div>

          {errors.general && (
            <p className='text-sm text-red-600' role='alert'>
              {errors.general}
            </p>
          )}
        </div>

        <button
          type='submit'
          disabled={loading}
          className='
            button-full loading-disabled'
          aria-busy={loading}
        >
          {loading ? (
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
