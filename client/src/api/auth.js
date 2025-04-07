export const signIn = async (formData) => {
  const res = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(formData),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Invalid email or password');

  return data;
};

export const googleSignIn = async (idToken) => {
  const res = await fetch('/api/auth/google', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      idToken,
    }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Google sign-in failed');

  return data;
};

export const fetchMe = async () => {
  let res = await fetch('/api/auth/me', {
    credentials: 'include',
  });

  if (res.status === 401) {
    await fetch('/api/auth/refresh', { credentials: 'include' });
    res = await fetch('/api/auth/me', { credentials: 'include' });
  }
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Not authenticated');

  return data;
};

export const sendCode = async (email) => {
  const res = await fetch('/api/auth/send-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Email send failed');

  return data;
};

export const verifyCode = async ({ email, code }) => {
  const res = await fetch('/api/auth/verify-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Email verification failed');

  return data;
};

export const signUp = async (formData) => {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Sign-up failed');

  return data;
};
