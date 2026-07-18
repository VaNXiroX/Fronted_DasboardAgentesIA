import apiClient from './client';

export async function getMonthSummary() {
  const { data } = await apiClient.get('/api/billing/month-summary');
  return data;
}
