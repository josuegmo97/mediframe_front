import client from './client';

export const getLicenses = async () => {
  const response = await client.get('/licenses');
  return response.data.data;
};

export const getLicenseById = async (id) => {
  const response = await client.get(`/licenses/${id}`);
  return response.data.data;
};

export const createLicense = async (licenseData) => {
  const response = await client.post('/licenses', licenseData);
  return response.data.data;
};

export const createBatchLicenses = async (batchData) => {
  const response = await client.post('/licenses/batch', batchData);
  return response.data.data;
};

export const deleteLicense = async (id) => {
  const response = await client.delete(`/licenses/${id}`);
  return response.data;
};

export const activateLicense = async (activationData) => {
  const response = await client.post('/licenses/activate', activationData);
  return response.data.data;
};

export const verifyLicense = async (licenseKey) => {
  const response = await client.post('/licenses/verify', { licenseKey });
  return response.data.data;
};

export const getLicenseStats = async () => {
  const response = await client.get('/licenses/stats');
  return response.data.data;
};