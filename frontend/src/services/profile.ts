import { apiRequest } from './api-client';
import { getCsrfToken } from './csrf';

export interface Profile { username: string; email: string; avatar: string | null; totp_enabled: boolean; notify_email: boolean; has_password: boolean }
export const getProfile = () => apiRequest<Profile>('/api/me.php');
export const updateEmailPreference = (notify_email: boolean) => apiRequest<{ ok: true }>('/api/prefs.php', { method: 'POST', csrf: getCsrfToken(), body: { notify_email } });
export const uploadAvatar = (file: File) => { const body = new FormData(); body.append('avatar', file); return apiRequest<{ ok: true; avatar: string }>('/api/avatar.php', { method: 'POST', csrf: getCsrfToken(), body }); };
export const enrollTotp = () => apiRequest<{ secret: string; otpauth_uri: string }>('/api/totp-enroll.php', { method: 'POST', csrf: getCsrfToken() });
export const confirmTotp = (code: string) => apiRequest<{ ok: true; backup_codes: string[] }>('/api/totp-confirm.php', { method: 'POST', csrf: getCsrfToken(), body: { code } });
export const disableTotp = (password: string) => apiRequest<{ ok: true }>('/api/totp-disable.php', { method: 'POST', csrf: getCsrfToken(), body: { password } });
export const restoreBackup = async (file: File) => apiRequest<{ ok: true }>('/api/import.php', { method: 'POST', csrf: getCsrfToken(), headers: { 'Content-Type': 'application/json' }, body: await file.text() });
