export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    public readonly retryAfter: number | null = null,
    public readonly details: Record<string, unknown> = {},
  ) {
    super(code);
    this.name = 'ApiError';
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown; csrf?: string };

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  let body: BodyInit | undefined;

  if (options.body instanceof FormData || typeof options.body === 'string') {
    body = options.body;
  } else if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }
  if (options.csrf) headers.set('X-CSRF-Token', options.csrf);

  let response: Response;
  try {
    response = await fetch(path, { ...options, body, headers, credentials: 'same-origin' });
  } catch {
    throw new ApiError(0, 'offline');
  }

  if (response.status === 401) {
    if (typeof window !== 'undefined') window.location.assign('/login.php');
    throw new ApiError(401, 'unauthorized');
  }

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    const details = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
    const code = typeof details.error === 'string' ? details.error : `http_${response.status}`;
    const retry = Number.parseInt(response.headers.get('Retry-After') ?? '', 10);
    throw new ApiError(response.status, code, Number.isFinite(retry) ? retry : null, details);
  }
  return payload as T;
}
