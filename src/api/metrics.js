import apiClient from './client';

export async function getMrrMetrics() {
  const { data } = await apiClient.get('/api/metrics/mrr');
  return data;
}
