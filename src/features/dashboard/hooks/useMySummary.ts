import { useCallback, useEffect, useState } from 'react';
import indicatorsApi from '../services/indicatorsApi';
import type { MySummary } from '../types/summary';

// ─── State ────────────────────────────────────────────────────────────────────

interface UseMySummaryState {
  summary: MySummary | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMySummary(): UseMySummaryState {
  const [summary, setSummary] = useState<MySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setSummary(await indicatorsApi.getMySummary());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar tu resumen');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { summary, isLoading, error, refresh: fetch };
}
