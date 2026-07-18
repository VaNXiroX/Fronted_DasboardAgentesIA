import { useState, useEffect, useCallback } from 'react';
import { getAgencyUsageSummary } from '../api/usage';

export function useAgencyUsage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAgencyUsageSummary();
      setData(res);
    } catch (error) {
      console.error('Error fetching agency usage summary:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return { data, loading, refetch: fetchUsage };
}
