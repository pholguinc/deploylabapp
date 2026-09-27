import { create } from 'zustand';
import authApi from '../services/authApi';
import type { AuthUser, LoginRequest } from '../types/auth';

export type AuthState = Readonly<{
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Acciones
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}>;

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (credentials: LoginRequest): Promise<boolean> => {
    set({ isLoading: true, error: null });

    try {
      // Autenticación directa contra la API del backend
      const data = await authApi.login(credentials);

      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err: unknown) {
      let errorMessage = 'Ocurrió un error inesperado al iniciar sesión';

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
      });

      return false;
    }
  },

  logout: () => {
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },
}));

export default useAuthStore;
