import apiClient from './client';
import { getClients } from './clients';

export const getClientAgents = (clientId) =>
  apiClient.get(`/api/clients/${clientId}/agents`).then((r) => r.data);

export const createAgent = (clientId, data) =>
  apiClient.post(`/api/clients/${clientId}/agents`, data).then((r) => r.data);

export const updateAgent = (clientId, agentId, data) =>
  apiClient.put(`/api/clients/${clientId}/agents/${agentId}`, data).then((r) => r.data);

// Fan-out: get all agents from all clients, attaching client_name
export const getAllAgents = async () => {
  const clients = await getClients();
  const results = await Promise.allSettled(
    clients.map((c) =>
      getClientAgents(c.id).then((agents) =>
        agents.map((a) => ({ ...a, client_name: c.name, client_slug: c.slug }))
      )
    )
  );
  return results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value);
};
