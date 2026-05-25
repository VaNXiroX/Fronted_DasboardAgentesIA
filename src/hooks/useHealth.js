import { useState, useEffect, useRef } from 'react';
import { getHealth } from '../api/health';

export function useHealth(pollIntervalMs = 30000) {
  const [healthy, setHealthy] = useState(null); // null = unknown
  const intervalRef = useRef(null);

  const check = async () => {
    try {
      await getHealth();
      setHealthy(true);
    } catch {
      setHealthy(false);
    }
  };

  useEffect(() => {
    check();
    intervalRef.current = setInterval(check, pollIntervalMs);
    return () => clearInterval(intervalRef.current);
  }, [pollIntervalMs]);

  return healthy;
}
