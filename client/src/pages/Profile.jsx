import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useState, useEffect } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/layouts/AuthLayout';
import ConfirmModal from '../components/ConfirmModal';
import VerifyModal from '../components/VerifyModal';
import { useUserUpdate } from '../hooks/useUserUpdate';
import { useUserDelete } from '../hooks/useUserDelete';
import { useSignOut } from '../hooks/useSignOut';
import { useSendCode } from '../hooks/useEmailVerification';

const schema = yup.object().shape({
  username: yup
    .string()
    .min(3, 'Must be at least 3 characters long')
    .required('Username is required'),
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  avatar: yup
    .mixed()
    .test('fileSize', 'Max file size is 2MB', (value) => {
      if (!value?.[0]) return true;
      return value[0].size <= 2 * 1024 * 1024;
    })
    .test('fileType', 'Unsupported format', (value) => {
      if (!value?.[0]) return true;
      return ['image/jpeg', 'image/png', 'image/webp'].includes(value[0].type);
    }),
});

function Profile() {
  const user = useAuthStore((state) => state.user);

  const { mutate: sendCode, isPending: isSendingCode } = useSendCode();
  const { mutate: updateUser, isPending, isError, error } = useUserUpdate();
  const { mutate: deleteUser } = useUserDelete();
  const { mutate: signOut } = useSignOut();

  const {
    register,
    getValues,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: user.username,
      email: user.email,
    },
  });

  const avatarFile = watch('avatar');
  const watchedEmail = watch('email');

  const isEmailChanged = watchedEmail !== user.email;

  const [uploadedImageUrl, setUploadedImageUrl] = useState(user.avatar);
  const [preview, setPreview] = useState(user.avatar);
  const [uploading, setUploading] = useState(false);
  const [modalEmail, setModalEmail] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    const file = avatarFile?.[0];
    if (!file || !(file instanceof File)) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const storage = getStorage(app);
    const storageRef = ref(storage, `avatars/${Date.now()}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    const unsubscribe = uploadTask.on(
      'state_changed',
      null,
      (error) => {
        console.error('Upload failed:', error);
        toast.error('Failed to upload your image. Please try again.');
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setUploadedImageUrl(downloadURL);
        setUploading(false);
      }
    );

    return () => {
      unsubscribe();
      URL.revokeObjectURL(preview);
    };
  }, [avatarFile]);

  const handleVerifyClick = () => {
    const email = getValues('email');

    if (!email.includes('@')) {
      toast.error('Invalid email format.');
      return;
    }

    setModalEmail(email);

    sendCode(email, {
      onSuccess: () => setShowVerifyModal(true),
      onError: () => toast.error('Email is already registered.'),
    });
  };

  const onSubmit = async (data) => {
    const updatedUser = {
      username: data.username,
      email: data.email,
      avatar: uploadedImageUrl,
    };

    updateUser(
      { userId: user.id, updatedUser },
      { onSuccess: () => reset(updatedUser) }
    );
  };

  return (
    <AuthLayout>
      <h1 className='text-3xl font-bold text-center text-brand-main mb-8'>
        Profile
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 mb-6'>
        <div className='space-y-4'>
          <div>
            <input
              type='file'
              accept='image/*'
              {...register('avatar')}
              className='form-input'
            />
            {errors.avatar && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.avatar.message}
              </p>
            )}

            {uploading ? (
              <div className='mt-2 w-24 h-24 flex items-center justify-center bg-gray-100 rounded-full animate-pulse text-sm text-slate-500'>
                Uploading...
              </div>
            ) : preview ? (
              <img
                src={preview}
                alt='preview'
                className='mt-2 h-24 w-24 object-cover rounded-full border'
              />
            ) : null}
          </div>

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
            <div className='flex gap-1'>
              <input
                type='email'
                id='email'
                placeholder='Email'
                {...register('email')}
                className={`form-input ${errors.email && 'border-red-500'}`}
              />
              <button
                type='button'
                onClick={handleVerifyClick}
                disabled={isEmailVerified || !isEmailChanged || isSendingCode}
                className='button-hover rounded-lg disabled:bg-opacity-50'
              >
                {isSendingCode ? 'Sending...' : 'Verify'}
              </button>
            </div>
            {errors.email && (
              <p className='text-xs text-red-600 mt-1'>
                {errors.email.message}
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
          disabled={
            uploading || isPending || (isEmailChanged && !isEmailVerified)
          }
          className='button-full loading-disabled'
          aria-busy={uploading || isPending}
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
              Updating...
            </span>
          ) : (
            'Save Changes'
          )}
        </button>
      </form>

      {showVerifyModal && (
        <VerifyModal
          isOpen={showVerifyModal}
          email={modalEmail}
          onClose={() => setShowVerifyModal(false)}
          onSuccess={() => {
            setShowVerifyModal(false);
            toast.success('Your email has been verified successfully.');
            setIsEmailVerified(true);
          }}
        />
      )}

      {showConfirmModal && (
        <ConfirmModal
          title='Delete Account'
          message='Are you absolutely sure? Your data will be gone forever'
          isOpen={showConfirmModal}
          onConfirm={() => deleteUser(user.id)}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      <Link
        to='/user-listings'
        className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95'
      >
        Show Listings
      </Link>
      <Link
        to='/change-password'
        className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95'
      >
        Change Password
      </Link>

      <div className='flex justify-between mt-5'>
        <span
          onClick={() => setShowConfirmModal(true)}
          className='text-red-700 cursor-pointer'
        >
          Delete Account
        </span>
        <span onClick={() => signOut()} className='text-red-700 cursor-pointer'>
          Sign out
        </span>
      </div>
    </AuthLayout>
  );
}

export default Profile;
