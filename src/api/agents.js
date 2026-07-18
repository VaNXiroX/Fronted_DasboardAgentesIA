import apiClient from './client';


export const getClientAgents = (clientId) =>
  apiClient.get(`/api/clients/${clientId}/agents`).then((r) => r.data);

export const createAgent = (clientId, data) =>
  apiClient.post(`/api/clients/${clientId}/agents`, data).then((r) => r.data);

export const updateAgent = (clientId, agentId, data) =>
  apiClient.put(`/api/clients/${clientId}/agents/${agentId}`, data).then((r) => r.data);

export const deleteAgent = (clientId, agentId) =>
  apiClient.delete(`/api/clients/${clientId}/agents/${agentId}`).then((r) => r.data);

// Optimized: Get all agents in a single request, client_name is provided by the backend
export const getAllAgents = () =>
  apiClient.get('/api/agents').then((r) => r.data);
