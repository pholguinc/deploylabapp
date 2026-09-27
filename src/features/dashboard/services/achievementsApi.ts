import { ENV } from '../../../shared/config/env';
import type { PaginatedAchievements } from '../types/achievement';

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE = `${ENV.BACKEND_URL}/achievements`;
const API_TIMEOUT_MS = 10_000;

// ─── Error ────────────────────────────────────────────────────────────────────

export class AchievementsApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'AchievementsApiError';
    this.statusCode = statusCode;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function withTimeout(ms: number): AbortController {
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const achievementsApi = {
  async list(page = 1, limit = 10): Promise<PaginatedAchievements> {
    const ctrl = withTimeout(API_TIMEOUT_MS);

    try {
      const res = await fetch(`${BASE}/list?page=${page}&limit=${limit}`, {
        headers: { Accept: 'application/json' },
        signal: ctrl.signal,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = json?.message ?? `Error del servidor (${res.status})`;
        throw new AchievementsApiError(
          Array.isArray(msg) ? msg.join(', ') : String(msg),
          res.status,
        );
      }

      // El ResponseInterceptor de NestJS puede envolver como { data: { data, meta } }
      const payload: PaginatedAchievements =
        json?.data?.data !== undefined ? json.data : json;

      return {
        data: Array.isArray(payload?.data) ? payload.data : [],
        meta: payload?.meta ?? {
          firstPage: 1,
          lastPage: 1,
          currentPage: page,
          totalPages: 1,
          totalItems: 0,
        },
      };
    } catch (err: unknown) {
      if (err instanceof AchievementsApiError) throw err;

      if (err instanceof Error && err.name === 'AbortError') {
        throw new AchievementsApiError(
          'Tiempo de espera agotado al cargar los logros',
          408,
        );
      }

      const rawMsg = err instanceof Error ? err.message : String(err);
      throw new AchievementsApiError(
        `No se pudo conectar con el servidor. Detalle: ${rawMsg}`,
        0,
      );
    }
  },
};

export default achievementsApi;
