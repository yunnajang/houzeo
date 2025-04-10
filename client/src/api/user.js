export const updateUser = async ({ userId, updatedUser }) => {
  let res = await fetch(`/api/user/update/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updatedUser),
  });

  if (res.status === 401) {
    const refreshRes = await fetch('/api/auth/refresh', {
      credentials: 'include',
    });

    if (!refreshRes.ok) {
      const err = await refreshRes.json();
      throw new Error(err.message || 'Failed to refresh token');
    }

    res = await fetch(`/api/user/update/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(updatedUser),
    });
  }

  const data = await res.json();

  if (!res.ok)
    throw new Error(
      data.message || "Couldn't update your profile. Please try again"
    );

  return data;
};

export const deleteUser = async (userId) => {
  const res = await fetch(`/api/user/delete/${userId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok)
    throw new Error("Couldn't delete your account. Please try again");

  const data = await res.json();
  return data;
};
