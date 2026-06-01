export interface FetchError extends Error {
  status?: number;
  details?: unknown;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (response.ok) {
    if (response.status === 204 || text.length === 0) {
      return {} as T;
    }
    return JSON.parse(text) as T;
  }
   
  let message = response.statusText || 'Request failed';
  let details: unknown = text;

  try {
    const json = text ? JSON.parse(text) : null;
    if (json && typeof json === 'object') {
      details = json;
      if (typeof (json as any).message === 'string') {
        message = (json as any).message;
      }
    }
  } catch {
    // Keep text as details if JSON parsing fails.
  }

  const error = new Error(message) as FetchError;
  error.status = response.status;
  error.details = details;
  throw error;
}

export async function fetchJson<T = any>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  return parseResponse<T>(response);
}

export function jsonHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export function authHeaders(token?: string): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
