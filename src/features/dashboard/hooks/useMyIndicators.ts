import { useCallback, useEffect, useState } from 'react';
import indicatorsApi from '../services/indicatorsApi';
import type { MyIndicator } from '../types/indicators';

// ─── State ────────────────────────────────────────────────────────────────────

interface UseMyIndicatorsState {
  indicators: MyIndicator[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMyIndicators(): UseMyIndicatorsState {
  const [indicators, setIndicators] = useState<MyIndicator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await indicatorsApi.getMine();
      setIndicators(res.indicators);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar tus indicadores',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { indicators, isLoading, error, refresh: fetch };
}
