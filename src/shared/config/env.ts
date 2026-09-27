import { Platform } from 'react-native';

/**
 * Retorna la URL local por defecto según la plataforma:
 * - Android Emulator: 10.0.2.2 mapea a 127.0.0.1 de la máquina anfitriona
 * - iOS Simulator / macOS: localhost
 */
const getDefaultBackendUrl = (): string => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api/v1';
  }
  return 'http://localhost:3000/api/v1';
};

let envBackendUrl = '';
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const env = require('@env');
  envBackendUrl = env?.BACKEND_URL || env?.API_URL || '';
} catch {
  envBackendUrl = '';
}

const resolvedBackendUrl: string = envBackendUrl || getDefaultBackendUrl();

export const ENV = {
  BACKEND_URL: resolvedBackendUrl,
  API_URL: resolvedBackendUrl,
} as const;

export default ENV;
