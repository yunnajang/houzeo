import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice.js';
import OAuth from '../components/OAuth.jsx';

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
    } catch (err) {
      setErrors({ general: 'Something went wrong. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-md w-full mx-auto py-20'>
      <h1 className='text-3xl font-bold text-center text-brand-main mb-6'>
        Sign In
      </h1>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          type='email'
          id='email'
          name='email'
          placeholder='Email'
          autoComplete='email'
          required
          className='form-input'
          onChange={handleChange}
        />
        {errors.email && <p className='text-sm text-red-600'>{errors.email}</p>}

        <input
          type='password'
          id='password'
          name='password'
          placeholder='Password'
          autoComplete='current-password'
          required
          className='form-input'
          onChange={handleChange}
        />
        {errors.password && (
          <p className='text-sm text-red-600'>{errors.password}</p>
        )}

        <button type='submit' disabled={loading} className='primary-btn'>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        {errors.general && (
          <p className='text-sm text-red-600 text-center'>{errors.general}</p>
        )}

        <OAuth />
      </form>

      <div className='text-center text-sm mt-6'>
        <p className='text-slate-600'>
          Don’t have an account?{' '}
          <Link
            to='/sign-up'
            className='text-brand-main font-semibold hover:underline'
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
