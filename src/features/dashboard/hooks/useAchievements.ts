import { useCallback, useEffect, useState } from 'react';
import achievementsApi from '../services/achievementsApi';
import type { Achievement } from '../types/achievement';

// ─── State ────────────────────────────────────────────────────────────────────

interface UseAchievementsState {
  achievements: Achievement[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAchievements(): UseAchievementsState {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // We only need the first page with a generous limit to show recent ones
      const res = await achievementsApi.list(1, 20);
      // Show only active achievements, sorted by orden
      const active = res.data
        .filter(a => a.estado)
        .sort((a, b) => a.orden - b.orden);
      setAchievements(active);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar logros');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { achievements, isLoading, error, refresh: fetch };
}
