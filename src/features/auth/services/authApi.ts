import { ENV } from '../../../shared/config/env';
import type { ApiResponse, AuthData, LoginRequest } from '../types/auth';

const API_TIMEOUT_MS = 10000;

export class AuthApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'AuthApiError';
    this.statusCode = statusCode;
  }
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthData> {
    const url = `${ENV.BACKEND_URL}/auth/login`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const json = (await response.json().catch(() => null)) as
        | ApiResponse<AuthData>
        | null;

      if (!response.ok) {
        const errorMsg =
          json?.message ||
          (response.status === 401
            ? 'Credenciales inválidas. Verifica tu correo y contraseña.'
            : `Error del servidor (${response.status})`);
        throw new AuthApiError(
          Array.isArray(errorMsg) ? errorMsg.join(', ') : String(errorMsg),
          response.status,
        );
      }

      // El backend envuelve la respuesta en data por el ResponseInterceptor
      const authData = (json?.data ?? json) as AuthData;

      if (!authData || !authData.accessToken) {
        throw new AuthApiError('Respuesta inesperada del servidor de autenticación', 500);
      }

      return authData;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err instanceof AuthApiError) {
        throw err;
      }

      if (err instanceof Error && err.name === 'AbortError') {
        throw new AuthApiError(
          'Tiempo de espera agotado al conectar con el servidor',
          408,
        );
      }

      const rawMsg = err instanceof Error ? err.message : String(err);
      throw new AuthApiError(
        `No se pudo conectar con el servidor (${ENV.BACKEND_URL}). Verifica que el backend esté activo. Detalle: ${rawMsg}`,
        0,
      );
    }
  },
};

export default authApi;
