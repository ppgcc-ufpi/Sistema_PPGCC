import { API_BASE_URL } from '../config/api';

const SESSION_KEY = 'ppgcc-auth-session';
let refreshPromise = null;

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const readPayload = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return null;
  return response.json();
};

const assertSuccessful = async (response) => {
  const payload = await readPayload(response);
  if (!response.ok) {
    const message = Array.isArray(payload?.message)
      ? payload.message.join(' ')
      : payload?.message || 'Não foi possível concluir a solicitação.';
    throw new ApiError(message, response.status, payload);
  }
  return payload;
};

export const readSession = () => {
  try {
    const value = window.sessionStorage.getItem(SESSION_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const saveSession = (session) => {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  window.sessionStorage.removeItem(SESSION_KEY);
};

const fetchApi = (path, options = {}) => fetch(`${API_BASE_URL}${path}`, {
  ...options,
  headers: {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  },
});

export const login = async (email, password) => {
  const response = await fetchApi('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const session = await assertSuccessful(response);
  saveSession(session);
  return session;
};

const refreshSession = async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const current = readSession();
    if (!current?.refreshToken) throw new ApiError('Sessão expirada.', 401);

    const response = await fetchApi('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: current.refreshToken }),
    });
    const renewed = await assertSuccessful(response);
    saveSession(renewed);
    return renewed;
  })()
    .catch((error) => {
      clearSession();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

export const authenticatedRequest = async (path, options = {}, retry = true) => {
  const session = readSession();
  if (!session?.accessToken) throw new ApiError('Faça login para continuar.', 401);

  const response = await fetchApi(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (response.status === 401 && retry) {
    await refreshSession();
    return authenticatedRequest(path, options, false);
  }
  return assertSuccessful(response);
};

export const logout = async () => {
  const session = readSession();
  try {
    if (session?.refreshToken) {
      await fetchApi('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });
    }
  } finally {
    clearSession();
  }
};

export const publicRequest = async (path, options = {}) => {
  const response = await fetchApi(path, options);
  return assertSuccessful(response);
};
