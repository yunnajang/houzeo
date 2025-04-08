export const updateUser = async ({ userId, updatedUser }) => {
  const res = await fetch(`/api/user/update/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updatedUser),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Failed to update profile');

  return data;
};

export const deleteUser = async (userId) => {
  const res = await fetch(`/api/user/delete/${userId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Failed to delete account');

  return data;
};
