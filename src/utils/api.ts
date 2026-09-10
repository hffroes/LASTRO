// Helper de fetch com Authorization automático e refresh silencioso em 401.
// Access token: 15min, guardado em memória + localStorage (decisão técnica
// #4 do plan.md). Refresh token: cookie httpOnly, nunca tocado pelo JS —
// enviado automaticamente pelo browser via credentials: 'include'.

const ACCESS_TOKEN_STORAGE_KEY = 'lastro:accessToken';

let accessTokenEmMemoria: string | null = null;
let refreshEmAndamento: Promise<string | null> | null = null;

export function getStoredAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string | null): void {
  accessTokenEmMemoria = token;
  try {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    }
  } catch {
    // localStorage indisponível (modo privado, etc.) — sessão continua
    // funcionando apenas em memória para esta aba.
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshEmAndamento) {
    refreshEmAndamento = fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
      .then(async res => {
        if (!res.ok) return null;
        const data = await res.json();
        setAccessToken(data.accessToken);
        return data.accessToken as string;
      })
      .catch(() => null)
      .finally(() => {
        refreshEmAndamento = null;
      });
  }
  return refreshEmAndamento;
}

function montarHeaders(options: RequestInit, token: string | null): Headers {
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return headers;
}

// Retenta uma vez com token renovado se a primeira tentativa vier 401 —
// cobre access token expirado sem exigir novo login enquanto o refresh
// token (7 dias) ainda for válido.
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = accessTokenEmMemoria ?? getStoredAccessToken();
  const res = await fetch(path, {
    ...options,
    headers: montarHeaders(options, token),
    credentials: 'include',
  });

  if (res.status !== 401 || !token) {
    return res;
  }

  const novoToken = await refreshAccessToken();
  if (!novoToken) {
    return res;
  }

  return fetch(path, {
    ...options,
    headers: montarHeaders(options, novoToken),
    credentials: 'include',
  });
}
