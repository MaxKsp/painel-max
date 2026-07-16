import { afterEach, describe, expect, it, vi } from 'vitest';
import { previewOfx, saveFinanceSet } from '../services/finance';
import { updateEmailPreference, uploadAvatar } from '../services/profile';

afterEach(() => { vi.restoreAllMocks(); delete window.CSRF_TOKEN; });

describe('mutations de domínio', () => {
  it('faz replace total financeiro com sessão e CSRF', async () => {
    window.CSRF_TOKEN = 'csrf';
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } }));
    await saveFinanceSet('income_lines', [{ id: '1' }]);
    const [, request] = fetchMock.mock.calls[0];
    expect(request?.credentials).toBe('same-origin');
    expect(new Headers(request?.headers).get('X-CSRF-Token')).toBe('csrf');
    expect(request?.body).toBe(JSON.stringify({ key: 'income_lines', value: [{ id: '1' }] }));
  });

  it('envia OFX e avatar como FormData sem definir Content-Type manual', async () => {
    window.CSRF_TOKEN = 'csrf';
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify({ ok: true, rows: [], avatar: 'avatar.jpg' }), { headers: { 'Content-Type': 'application/json' } }));
    const file = new File(['data'], 'arquivo.ofx');
    await previewOfx(file);
    await uploadAvatar(new File(['image'], 'avatar.png', { type: 'image/png' }));
    for (const [, request] of fetchMock.mock.calls) {
      expect(request?.body).toBeInstanceOf(FormData);
      expect(new Headers(request?.headers).has('Content-Type')).toBe(false);
    }
  });

  it('persiste preferência de e-mail no endpoint real', async () => {
    window.CSRF_TOKEN = 'csrf';
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } }));
    await updateEmailPreference(false);
    expect(fetchMock).toHaveBeenCalledWith('/api/prefs.php', expect.objectContaining({ body: JSON.stringify({ notify_email: false }) }));
  });
});
