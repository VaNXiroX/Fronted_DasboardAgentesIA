import apiClient from './client';
import { getClients } from './clients';

export const getClientAgents = (clientId) =>
  apiClient.get(`/api/clients/${clientId}/agents`).then((r) => r.data);

export const createAgent = (clientId, data) =>
  apiClient.post(`/api/clients/${clientId}/agents`, data).then((r) => r.data);

export const updateAgent = (clientId, agentId, data) =>
  apiClient.put(`/api/clients/${clientId}/agents/${agentId}`, data).then((r) => r.data);

export const deleteAgent = (clientId, agentId) =>
  apiClient.delete(`/api/clients/${clientId}/agents/${agentId}`).then((r) => r.data);

// Optimized: Get all agents in a single request and join with clients
export const getAllAgents = async () => {
  const [clients, agents] = await Promise.all([
    getClients(),
    apiClient.get('/api/agents').then((r) => r.data)
  ]);

  const clientsMap = new Map(clients.map((c) => [c.id, c]));

  return agents.map((a) => {
    const c = clientsMap.get(a.client_id) || {};
    return { ...a, client_name: c.name, client_slug: c.slug };
  });
};
