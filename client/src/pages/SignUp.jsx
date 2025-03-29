import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth.jsx';
import VerifyModal from '../components/VerifyModal.jsx';

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
    <div className='max-w-md w-full mx-auto py-20'>
      <h1 className='text-3xl font-bold text-center text-brand-main mb-6'>
        Sign Up
      </h1>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          type='text'
          id='username'
          name='username'
          placeholder='Username'
          required
          className='form-input'
          onChange={handleChange}
        />
        {errors.username && (
          <p className='text-sm text-red-600'>{errors.username}</p>
        )}

        <input
          type='email'
          id='email'
          name='email'
          placeholder='Email'
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
          className='form-input'
          onChange={handleChange}
        />
        {errors.password && (
          <p className='text-sm text-red-600'>{errors.password}</p>
        )}

        <button type='submit' disabled={loading} className='primary-btn'>
          {loading ? 'Sending code...' : 'Sign Up'}
        </button>

        {errors.general && (
          <p className='text-sm text-red-600 text-center'>{errors.general}</p>
        )}

        <OAuth />
      </form>

      <div className='text-center text-sm mt-6'>
        <p className='text-slate-600'>
          Already have an account?{' '}
          <Link
            to='/sign-up'
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
    </div>
  );
}

export default SignUp;
