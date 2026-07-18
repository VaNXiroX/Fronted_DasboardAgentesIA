import { useState, useEffect, useCallback } from 'react';
import { getMonthSummary } from '../api/billing';
import { useToast } from './use-toast';

export function useBillingMonth() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMonthSummary();
      setData(res);
    } catch (error) {
      console.error('Error fetching billing month summary:', error);
      toast({
        title: 'Error de carga',
        description: 'No se pudo obtener el resumen de cobranza del mes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { data, loading, refetch: fetchSummary };
}
