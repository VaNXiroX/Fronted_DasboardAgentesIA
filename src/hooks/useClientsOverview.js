import { useState, useEffect, useCallback } from 'react';
import { getClients } from '../api/clients';
import { getBilling } from '../api/payments';
import { getClientAgents } from '../api/agents';

/**
 * Fan-out hook: fetches all clients, then billing + agents per client in parallel.
 * Returns enriched list with billing and agents attached.
 */
export function useClientsOverview() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const clients = await getClients();
      const enriched = await Promise.all(
        clients.map(async (client) => {
          const [billing, agents] = await Promise.allSettled([
            getBilling(client.id),
            getClientAgents(client.id),
          ]);
          return {
            ...client,
            billing: billing.status === 'fulfilled' ? billing.value : null,
            agents: agents.status === 'fulfilled' ? agents.value : [],
          };
        })
      );
      setData(enriched);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
