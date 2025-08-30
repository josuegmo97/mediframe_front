import client from './client';

export const login = async (credentials) => {
  const response = await client.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await client.post('/auth/register', userData);
  return response.data;
};

export const logout = async () => {
  const response = await client.post('/auth/logout');
  return response.data;
};

export const refreshToken = async (refreshToken) => {
  const response = await client.post('/auth/refresh', { refreshToken });
  return response.data;
};

export const verifyToken = async () => {
  const response = await client.get('/auth/verify');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await client.get('/users/profile');
  return response.data.data;
};