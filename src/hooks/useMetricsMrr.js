import { useState, useEffect, useCallback } from 'react';
import { getMrrMetrics } from '../api/metrics';
import { useToast } from './use-toast';

export function useMetricsMrr() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMrrMetrics();
      setData(res || []);
    } catch (error) {
      console.error('Error fetching MRR metrics:', error);
      toast({
        title: 'Error de carga',
        description: 'No se pudieron obtener las métricas de MRR.',
        variant: 'destructive',
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { data, loading, refetch: fetchMetrics };
}
