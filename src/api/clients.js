import apiClient from './client';

export const getClients = (status) => {
  const params = status ? { status } : {};
  return apiClient.get('/api/clients', { params }).then((r) => r.data);
};

export const getClient = (id) =>
  apiClient.get(`/api/clients/${id}`).then((r) => r.data);

export const createClient = (data) =>
  apiClient.post('/api/clients', data).then((r) => r.data);

export const updateClient = (id, data) =>
  apiClient.put(`/api/clients/${id}`, data).then((r) => r.data);
