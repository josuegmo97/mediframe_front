import client from './client';

export const getUsers = async () => {
  const response = await client.get('/users');
  return response.data.data;
};

export const getUserById = async (id) => {
  const response = await client.get(`/users/${id}`);
  return response.data.data;
};

export const createUser = async (userData) => {
  const response = await client.post('/users/register', userData);
  return response.data.data;
};

export const updateUser = async (id, userData) => {
  const response = await client.put(`/users/${id}`, userData);
  return response.data.data;
};

export const updateProfile = async (userData) => {
  const response = await client.put('/users/profile', userData);
  return response.data.data;
};

export const deleteUser = async (id) => {
  const response = await client.delete(`/users/${id}`);
  return response.data.data;
};

export const getUserStats = async () => {
  const response = await client.get('/users/stats');
  return response.data.data;
};