export const signIn = async (formData) => {
  const res = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(formData),
  });

  if (!res.ok) throw new Error('Invalid email or password');
  return res.json();
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

  if (!res.ok) throw new Error('Google sign-in failed');
  return res.json();
};

export const fetchMe = async () => {
  let res = await fetch('/api/auth/me', {
    credentials: 'include',
  });

  if (res.status === 401) {
    await fetch('/api/auth/refresh', { credentials: 'include' });
    res = await fetch('/api/auth/me', { credentials: 'include' });
  }

  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
};
