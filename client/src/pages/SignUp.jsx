import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth.jsx';
import VerifyModal from '../components/VerifyModal.jsx';
import AuthLayout from '../components/layouts/AuthLayout.jsx';

function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [codeError, setCodeError] = useState('');

  const navigate = useNavigate();

  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

  const validate = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[\w-.]+@[\w-]+\.[a-z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        'Password must be at least 8 characters and include a number, a letter, and a special character.';
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
      const res = await fetch('/api/auth/verify/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        setErrors({ general: data.message || 'Something went wrong.' });
        return;
      }

      setModalOpen(true);
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (code) => {
    if (!code || code.trim().length !== 6) {
      setCodeError('Please enter a valid 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, code }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        setCodeError(data.message || 'Invalid or expired code.');
        return;
      }

      setModalOpen(false);
      navigate('/');
    } catch (error) {
      setCodeError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    setCodeError('');
    handleSubmit(new Event('submit'));
  };

  const handleCloseModal = () => {
    setCodeError('');
    setModalOpen(false);
  };

  return (
    <AuthLayout>
      <h1 className='text-3xl font-bold text-center text-brand-main mb-8'>
        Sign Up
      </h1>

      <form onSubmit={handleSubmit} className='space-y-6 mb-6'>
        <div className='space-y-4'>
          <div>
            <input
              type='text'
              id='username'
              name='username'
              placeholder='Username'
              required
              className={`form-input ${errors.email && 'border-red-500'}`}
              onChange={handleChange}
            />
            {errors.username && (
              <p className='text-xm text-red-600 mt-1'>{errors.username}</p>
            )}
          </div>

          <div>
            <input
              type='email'
              id='email'
              name='email'
              placeholder='Email'
              required
              className={`form-input ${errors.email && 'border-red-500'}`}
              onChange={handleChange}
            />
            {errors.email && (
              <p className='text-xm text-red-600 mt-1'>{errors.email}</p>
            )}
          </div>

          <div>
            <input
              type='password'
              id='password'
              name='password'
              placeholder='Password'
              className={`form-input ${errors.email && 'border-red-500'}`}
              onChange={handleChange}
            />
            {errors.password && (
              <p className='text-xm text-red-600 mt-1'>{errors.password}</p>
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
          className='button-full loading-disabled'
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

      {modalOpen && (
        <VerifyModal
          email={formData.email}
          onClose={handleCloseModal}
          onVerify={handleVerify}
          loading={loading}
          error={codeError}
          onResend={handleResendCode}
        />
      )}
    </AuthLayout>
  );
}

export default SignUp;
