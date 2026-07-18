import apiClient from './client';

/**
 * Expected shape from Angel's backend:
 * {
 *   tokens_used: number,
 *   cost_usd: number,
 *   previous_month_tokens: number,
 *   previous_month_cost_usd: number
 * }
 */
export const getClientUsage = (clientId) =>
  apiClient.get(`/api/clients/${clientId}/usage`).then((r) => r.data);

/**
 * Expected shape from Angel's backend:
 * {
 *   total_cost_usd: number
 * }
 */
export const getAgencyUsageSummary = () =>
  apiClient.get(`/api/usage/summary`).then((r) => r.data);
