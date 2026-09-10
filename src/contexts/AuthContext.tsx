import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  apiFetch,
  getStoredAccessToken,
  refreshAccessToken,
  setAccessToken,
} from '../utils/api';

interface UsuarioAutenticado {
  id: string;
  email: string;
}

interface AuthContextValue {
  usuario: UsuarioAutenticado | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

// Decodifica só o payload (sem verificar assinatura) para saber quando
// renovar proativamente — a verificação de fato é sempre feita no backend.
function decodificarExpiracaoMs(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [carregando, setCarregando] = useState(true);
  const timeoutRefreshRef = useRef<ReturnType<typeof setTimeout>>();

  // Renova ~60s antes do access token expirar (dura 15min) — refresh
  // reativo em 401 (ver src/utils/api.ts) cobre o restante dos casos.
  const agendarRenovacao = useCallback((token: string) => {
    clearTimeout(timeoutRefreshRef.current);
    const expiraEm = decodificarExpiracaoMs(token);
    if (!expiraEm) return;

    const atraso = Math.max(expiraEm - Date.now() - 60_000, 5_000);
    timeoutRefreshRef.current = setTimeout(() => {
      void refreshAccessToken().then(novoToken => {
        if (novoToken) agendarRenovacao(novoToken);
      });
    }, atraso);
  }, []);

  const carregarUsuarioAtual = useCallback(async () => {
    const res = await apiFetch('/api/v1/auth/me');
    if (!res.ok) {
      setUsuario(null);
      return;
    }
    const data = await res.json();
    setUsuario(data.user);
  }, []);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      const tokenSalvo = getStoredAccessToken();
      const token = tokenSalvo ?? (await refreshAccessToken());

      if (token && !cancelado) {
        setAccessToken(token);
        agendarRenovacao(token);
        await carregarUsuarioAtual();
      }

      if (!cancelado) setCarregando(false);
    })();

    return () => {
      cancelado = true;
      clearTimeout(timeoutRefreshRef.current);
    };
  }, [agendarRenovacao, carregarUsuarioAtual]);

  const login = useCallback(
    async (email: string, senha: string) => {
      const res = await apiFetch('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: senha }),
      });

      if (!res.ok) {
        const erro = await res.json().catch(() => ({}));
        throw new Error(erro.error ?? 'Não foi possível entrar');
      }

      const data = await res.json();
      setAccessToken(data.accessToken);
      agendarRenovacao(data.accessToken);
      setUsuario(data.user);
    },
    [agendarRenovacao]
  );

  const sair = useCallback(async () => {
    clearTimeout(timeoutRefreshRef.current);
    await apiFetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => {});
    setAccessToken(null);
    setUsuario(null);
  }, []);

  const value = useMemo(
    () => ({ usuario, carregando, login, sair }),
    [usuario, carregando, login, sair]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
