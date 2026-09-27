export type LoginRequest = Readonly<{
  email: string;
  password: string;
}>;

export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'USER' | string;

export type AuthUser = Readonly<{
  id: string;
  email: string;
  name?: string | null;
  roles: readonly UserRole[];
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
