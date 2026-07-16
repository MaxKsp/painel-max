import { apiRequest } from './api-client';
import { getCsrfToken } from './csrf';

export type BootstrapData = Record<string, unknown>;

export const getBootstrap = () => apiRequest<BootstrapData>('/api/data.php?all=1');
export const getDataKey = async <T>(key: string) => (await apiRequest<{ value: T | null }>(`/api/data.php?key=${encodeURIComponent(key)}`)).value;
export const saveDataKey = (key: string, value: unknown) => apiRequest<{ ok: true }>('/api/data.php', { method: 'POST', csrf: getCsrfToken(), body: { key, value } });
