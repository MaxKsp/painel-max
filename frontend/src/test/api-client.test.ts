import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiRequest } from '../services/api-client';
import { getCsrfToken } from '../services/csrf';

afterEach(() => {
  vi.restoreAllMocks();
  delete window.CSRF_TOKEN;
});

describe('apiRequest', () => {
  it('envia cookie de sessão na mesma origem', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } }));
    await apiRequest('/api/data.php?all=1');
    expect(fetchMock).toHaveBeenCalledWith('/api/data.php?all=1', expect.objectContaining({ credentials: 'same-origin' }));
  });

  it('expõe plano e Retry-After como erro tipado', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ error: 'plan_required' }), { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '12' } }));
    await expect(apiRequest('/api/import-ofx.php')).rejects.toMatchObject({ status: 429, code: 'plan_required', retryAfter: 12 });
  });
  it.each([402, 403, 413, 500])('preserva status HTTP %s em erro tipado', async (status) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ error: `erro_${status}` }), { status, headers: { 'Content-Type': 'application/json' } }));
    await expect(apiRequest('/api/data.php')).rejects.toMatchObject({ status, code: `erro_${status}` });
  });

  it('distingue falha de rede como estado offline', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('network'));
    await expect(apiRequest('/api/data.php')).rejects.toMatchObject({ status: 0, code: 'offline' });
  });
});

describe('CSRF', () => {
  it('bloqueia mutation quando o shell PHP não fornece token', () => {
    expect(() => getCsrfToken()).toThrow('csrf_not_configured');
  });

  it('lê o token injetado pelo shell PHP', () => {
    window.CSRF_TOKEN = 'token-seguro';
    expect(getCsrfToken()).toBe('token-seguro');
  });
});
