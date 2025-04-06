import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase.js';
import { useNavigate } from 'react-router-dom';
import { useGoogleSignIn } from '../hooks/useGoogleSignIn.js';

function OAuth() {
  const navigate = useNavigate();
  const { mutate, isPending, isError, error } = useGoogleSignIn();

  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
      });
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      mutate(idToken, { onSuccess: () => navigate('/') });
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  return (
    <>
      <button
        onClick={handleGoogleClick}
        disabled={isPending}
        type='button'
        className='border border-slate-300 flex items-center justify-center gap-3 bg-white text-slate-700 hover:bg-slate-100 button-full'
      >
        <img
          src='https://www.svgrepo.com/show/475656/google-color.svg'
          alt='Google logo'
          className='w-5 h-5'
        />
        <span className='whitespace-nowrap'>
          {isPending ? 'Signing in...' : 'Continue with Google'}
        </span>
      </button>

      {isError && <p className='text-sm text-red-600 mt-2'>{error.message}</p>}
    </>
  );
}

export default OAuth;
