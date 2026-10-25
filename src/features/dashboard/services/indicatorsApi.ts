import { ENV } from '../../../shared/config/env';
import { useAuthStore } from '../../auth/store/useAuthStore';
import type { MyIndicatorsResponse } from '../types/indicators';
import type { MySummary } from '../types/summary';

// ─── Constants ────────────────────────────────────────────────────────────────

const INDICATORS_BASE = `${ENV.BACKEND_URL}/indicators`;
const REPORTS_BASE = `${ENV.BACKEND_URL}/reports`;
const API_TIMEOUT_MS = 10_000;

// ─── Error ────────────────────────────────────────────────────────────────────

export class IndicatorsApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'IndicatorsApiError';
    this.statusCode = statusCode;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function withTimeout(ms: number): AbortController {
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl;
}

async function authGet<T>(url: string, timeoutMessage: string): Promise<T> {
  const ctrl = withTimeout(API_TIMEOUT_MS);
  const token = useAuthStore.getState().accessToken;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: ctrl.signal,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const msg =
        res.status === 401
          ? 'Tu sesión expiró. Vuelve a iniciar sesión.'
          : (json?.message ?? `Error del servidor (${res.status})`);
      throw new IndicatorsApiError(
        Array.isArray(msg) ? msg.join(', ') : String(msg),
        res.status,
      );
    }

    // El ResponseInterceptor de NestJS envuelve la respuesta como { data }
    return (json?.data ?? json) as T;
  } catch (err: unknown) {
    if (err instanceof IndicatorsApiError) throw err;

    if (err instanceof Error && err.name === 'AbortError') {
      throw new IndicatorsApiError(timeoutMessage, 408);
    }

    const rawMsg = err instanceof Error ? err.message : String(err);
    throw new IndicatorsApiError(
      `No se pudo conectar con el servidor. Detalle: ${rawMsg}`,
      0,
    );
  }
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const indicatorsApi = {
  async getMine(): Promise<MyIndicatorsResponse> {
    const payload = await authGet<MyIndicatorsResponse>(
      `${INDICATORS_BASE}/me`,
      'Tiempo de espera agotado al cargar tus indicadores',
    );
    return {
      variable: payload?.variable ?? '',
      indicators: Array.isArray(payload?.indicators) ? payload.indicators : [],
    };
  },

  async getMySummary(): Promise<MySummary> {
    return await authGet<MySummary>(
      `${REPORTS_BASE}/me`,
      'Tiempo de espera agotado al cargar tu resumen',
    );
  },
};

export default indicatorsApi;
