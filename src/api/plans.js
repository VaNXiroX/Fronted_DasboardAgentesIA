import apiClient from './client';

export const getPlans = () =>
  apiClient.get('/api/plans').then((r) => r.data);
