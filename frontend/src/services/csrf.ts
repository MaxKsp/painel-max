declare global {
  interface Window { CSRF_TOKEN?: string }
}

export function getCsrfToken(): string {
  const token = typeof window === 'undefined' ? '' : window.CSRF_TOKEN?.trim();
  if (!token) throw new Error('csrf_not_configured');
  return token;
}
