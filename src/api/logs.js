import apiClient from './client';

/**
 * Obtener logs del sistema: GET /api/logs
 * Requiere header Authorization: Bearer <token>
 */
export async function getLogs(limit = 100) {
  const { data } = await apiClient.get('/api/logs', { params: { limit } });
  return data; // { logs: [...], total: number }
}
