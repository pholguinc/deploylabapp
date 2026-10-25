export type LoginRequest = Readonly<{
  email: string;
  password: string;
}>;

export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'DOCENTE' | 'USER' | string;

/** Etiqueta legible del rol que devuelve el backend. */
export const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: 'Superadministrador',
  ADMIN: 'Administrador',
  DOCENTE: 'Docente',
  USER: 'Estudiante',
};

export type AuthUser = Readonly<{
  id: string;
  email: string;
  name?: string | null;
  lastname?: string | null;
  // El backend envía un único rol por usuario
  role: UserRole;
}>;

export type AuthTokens = Readonly<{
  accessToken: string;
  refreshToken: string;
}>;

export type AuthData = Readonly<{
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}>;

export type ApiResponse<T = unknown> = Readonly<{
  statusCode: number;
  status: 'success' | false;
  message: string;
  data?: T | null;
  error?: unknown;
}>;
