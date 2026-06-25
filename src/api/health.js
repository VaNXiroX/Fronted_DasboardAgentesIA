import apiClient from './client';

export const getHealth = () =>
  apiClient.get('/api/health').then((r) => r.data);
